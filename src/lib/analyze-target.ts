import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

export function isPrivateAddress(address: string): boolean {
  const ip = address.toLowerCase().replace(/^\[|\]$/g, "");
  if (ip.includes(":")) {
    if (ip.startsWith("::ffff:")) {
      const tail = ip.slice(7);
      if (tail.includes(".")) return isPrivateAddress(tail);
      const parts = tail.split(":").map((part) => Number.parseInt(part, 16));
      if (parts.length === 2)
        return isPrivateAddress(
          `${parts[0] >> 8}.${parts[0] & 255}.${parts[1] >> 8}.${parts[1] & 255}`,
        );
    }
    return ip === "::" || ip === "::1" || /^(fc|fd|fe[89ab]|ff)/.test(ip);
  }
  const [a, b] = ip.split(".").map(Number);
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 100 && b >= 64 && b <= 127) ||
    a >= 224
  );
}
export function parseTarget(value: string): URL {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error("Enter a complete website address, including https://.");
  }
  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password
  ) {
    throw new Error(
      "Use a public HTTP or HTTPS address without embedded credentials.",
    );
  }
  if (url.port && !["80", "443"].includes(url.port))
    throw new Error("Public scans support standard HTTP and HTTPS ports.");
  return url;
}
export async function assertPublicTarget(url: URL): Promise<void> {
  const hostname = url.hostname.replace(/^\[|\]$/g, "");
  if (
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local")
  ) {
    throw new Error(
      "Private network addresses are not supported. Use the built-in playground for a local test.",
    );
  }
  const addresses = isIP(hostname)
    ? [{ address: hostname }]
    : await lookup(hostname, { all: true });
  if (
    !addresses.length ||
    addresses.some(({ address }) => isPrivateAddress(address))
  ) {
    throw new Error(
      "Private network addresses are not supported. Use the built-in playground for a local test.",
    );
  }
}

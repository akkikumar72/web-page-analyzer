import assert from "node:assert/strict";
import { test } from "node:test";
import {
  assertPublicTarget,
  isPrivateAddress,
  parseTarget,
} from "../src/lib/analyze-target";

test("only standard public web URL shapes are accepted", () => {
  assert.equal(
    parseTarget("https://example.com/docs?q=button#tabs").hostname,
    "example.com",
  );
  for (const url of [
    "example.com",
    "file:///etc/passwd",
    "javascript:alert(1)",
    "https://name:password@example.com",
    "http://example.com:8080",
  ]) {
    assert.throws(() => parseTarget(url), Error, url);
  }
});
test("private addresses include normalized and IPv4-mapped loopback", () => {
  for (const ip of [
    "127.0.0.1",
    "10.3.1.4",
    "172.31.0.2",
    "192.168.1.1",
    "169.254.169.254",
    "100.64.1.1",
    "224.0.0.1",
    "::1",
    "fe80::1",
    "fd00::1",
    "::ffff:127.0.0.1",
    "::ffff:7f00:1",
  ])
    assert.equal(isPrivateAddress(ip), true, ip);
  for (const ip of ["1.1.1.1", "8.8.8.8", "172.32.1.1", "2606:4700:4700::1111"])
    assert.equal(isPrivateAddress(ip), false, ip);
});
test("local targets and alternate loopback notation cannot bypass public validation", async () => {
  for (const url of [
    "http://localhost",
    "http://app.localhost",
    "http://printer.local",
    "http://127.1",
    "http://2130706433",
    "http://[::1]",
    "http://[::ffff:7f00:1]",
  ])
    await assert.rejects(
      assertPublicTarget(parseTarget(url)),
      /Private network/,
    );
});

import Link from "next/link";
export default function NotFound() {
  return (
    <main id="main-content" className="not-found">
      <span className="eyebrow">TRACE / 404</span>
      <h1>This page is outside the trace.</h1>
      <p>Head back to your workspace to start another analysis.</p>
      <Link className="primary-button" href="/">
        Back to workspace
      </Link>
    </main>
  );
}

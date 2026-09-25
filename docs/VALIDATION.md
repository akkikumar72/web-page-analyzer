# Validation

Verified locally on 25 September 2026 with Node 22, Bun 1.3.11, and installed Google Chrome.

## Automated

- `bun run verify`: Biome, TypeScript, three URL-validation tests, and Next.js production build passed.
- `bun run test:integration`: three integration tests passed against both the local development server and the final production build. These cover rejected inputs, backward-compatible JSON output, streamed progress, and actual desktop/mobile browser captures.
- The eight-control desktop playground run observed six changes and two unchanged states, with zero skipped controls. Each interaction had before/after JPEG data. The price-toggle evidence included both $24 and $19.
- The mobile capture test returned 390 × 844 screenshots and four inspected controls without skipped interactions.
- A public URL smoke check against `https://example.com` loaded Example Domain, discovered one link, and correctly skipped its cross-site destination.

## Browser checks

- Overview, Run history, Saved reports, Preferences, Documentation, and Playground navigation.
- Starting a new run from a secondary route, progress, cancellation, and recovery to a subsequent successful run.
- A rejected private address displayed an actionable error and retained the previous report.
- Interaction filtering, search, before/after comparison, comparison slider, screenshot enlargement, Escape dismissal, run summary, and JSON preview.
- Bookmarking, saved-report navigation, report persistence across reload, history search/empty state, and reopening a report.
- Deletion confirmation and the Keep report action. Permanent deletion was not executed during manual review.
- Light/dark appearance and default viewport persisted across reload.
- Mobile layout at 390 × 844, navigation drawer, history, modal dismissal, and no document-level horizontal overflow.
- Chrome selector-copy feedback and JSON export. The downloaded report parsed successfully and contained eight interactions plus full screenshot data.
- A fresh Chrome session displayed the explicitly labeled recorded example.

## Not verified or not included

- Live AI summaries: no OpenAI key was configured. The disabled state and key-free evidence flow were verified.
- No public deployment, cloud synchronization, scheduled monitoring, or multi-user security review was performed.
- External websites may block browser automation or load controls asynchronously. The capture window and supported actions are bounded; observed changes are not assertions that a page is correct.
- The in-app browser did not expose a completed download event during export checking. Native Chrome export was verified instead.

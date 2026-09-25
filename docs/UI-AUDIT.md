# Trace interface audit and design direction

## Starting point

The original application centered a URL form above a long stack of result cards. Its small screenshot crops made surrounding context difficult to inspect. Analysis required an OpenAI key; there was no persistent report workspace or complete sidebar. An existing duplicate favicon route returned an error.

## Reference products

- [Browserbase session replay](https://docs.browserbase.com/platform/browser/observability/session-replay): a useful reference for keeping browser evidence associated with a specific run. Trace uses still captures and observed changes; it does not implement video replay or network tracing.
- [Checkly synthetic monitoring](https://www.checklyhq.com/product/synthetic-monitoring/): a useful reference for organizing debugging evidence around Playwright browser behavior. Trace borrows the clear separation of run-level context and interaction details, not its monitoring infrastructure.

The design uses original components and assets. No competitor branding or screenshots were copied.

## Implemented direction

A neutral workspace with a restrained teal accent keeps dense evidence readable. Geist typography, consistent spacing, thin dividers, and quiet status colors give each part a clear hierarchy. The sidebar separates active inspection, history, saved reports, preferences, and documentation. On mobile it becomes a native modal navigation drawer.

The inspector groups a searchable interaction list alongside its capture, state comparison, selector, and raw observed changes. Outcomes describe what was observed instead of implying test success. Full-viewport captures keep visual context; before/after, comparison, and enlargement support closer inspection.

History is stored locally in IndexedDB, with clear export and deletion actions. Themes and default settings persist on the device. Evidence mode provides a usable product without a paid API key. The sample report is a real recorded run, explicitly labeled as an example.

## Boundaries

The design is a local tool, not an account-based SaaS. There are no invented teams, billing settings, test pass rates, usage metrics, or fabricated customer outcomes. Orbit is an original, controlled playground, not a paying customer or external integration.

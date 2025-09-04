/**
 * Comprehensive list of CSS selectors for interactive elements
 * Used for web page analysis and automation testing
 */

export function getInteractiveElementSelectors(): string[] {
  return [
    // Basic clickable elements
    "button",
    "[role=button]",
    "a[href]:not([href^='#'])",

    // Form input controls
    "input[type=button]",
    "input[type=submit]",
    "input[type=reset]",
    "input[type=checkbox]",
    "input[type=radio]",
    "input[type=file]",
    "input[type=image]",
    "input[type=color]",
    "input[type=range]",
    "input[type=date]",
    "input[type=datetime-local]",
    "input[type=month]",
    "input[type=time]",
    "input[type=week]",
    "input[type=number]",
    "input[type=email]",
    "input[type=password]",
    "input[type=search]",
    "input[type=tel]",
    "input[type=text]",
    "input[type=url]",

    // Form elements
    "select",
    "textarea",
    "option",
    "optgroup",
    "datalist",
    "output",
    "fieldset",
    "legend",
    "meter",
    "progress",

    // Interactive content elements
    "details",
    "summary",
    "canvas[onclick]",
    "canvas[onmousedown]",
    "canvas[onmouseup]",
    "canvas[onkeydown]",
    "canvas[onkeyup]",

    // Media controls
    "video[controls]",
    "audio[controls]",

    // ARIA interactive roles
    "[role=button]",
    "[role=link]",
    "[role=menuitem]",
    "[role=menuitemcheckbox]",
    "[role=menuitemradio]",
    "[role=option]",
    "[role=tab]",
    "[role=tabpanel]",
    "[role=treeitem]",
    "[role=gridcell]",
    "[role=columnheader]",
    "[role=rowheader]",
    "[role=slider]",
    "[role=spinbutton]",
    "[role=switch]",
    "[role=searchbox]",
    "[role=combobox]",
    "[role=listbox]",
    "[role=textbox]",

    // Elements with event handlers
    "[onclick]",
    "[onmousedown]",
    "[onmouseup]",
    "[ondblclick]",
    "[onkeydown]",
    "[onkeyup]",
    "[onkeypress]",
    "[onfocus]",
    "[onblur]",
    "[onchange]",
    "[oninput]",
    "[onsubmit]",

    // Interactive attributes
    "[tabindex]:not([tabindex='-1'])",
    "[contenteditable='true']",
    "[contenteditable='']",
    "[draggable='true']",

    // Custom elements that might be interactive
    "[data-toggle]",
    "[data-action]",
    "[data-click]",
    "[data-target]",
    "[data-href]",

    // Common interactive classes (framework agnostic)
    ".btn",
    ".button",
    ".clickable",
    ".interactive",
    ".selectable",

    // Framework-specific interactive elements
    "[ng-click]", // AngularJS
    "[v-on\\:click]", // Vue.js
    "[\\@click]", // Vue.js shorthand
    "[data-bs-toggle]", // Bootstrap
    "[data-toggle]", // Bootstrap

    // Anchor links that might be interactive
    "a[href^='javascript:']",
    "a[href='#']",

    // Label elements (clickable for form controls)
    "label[for]",
    "label:has(input)",
    "label:has(textarea)",
    "label:has(select)",
  ];
}

/**
 * Get interactive element selectors as a comma-separated string
 * Ready for use with Playwright/Puppeteer locators
 */
export function getInteractiveElementSelector(): string {
  return getInteractiveElementSelectors().join(",");
}

/**
 * Categories of interactive elements for filtering
 */
export const INTERACTIVE_ELEMENT_CATEGORIES = {
  BASIC: ["button", "[role=button]", "a[href]:not([href^='#'])"],
  FORM_INPUTS: [
    "input[type=button]",
    "input[type=submit]",
    "input[type=reset]",
    "input[type=checkbox]",
    "input[type=radio]",
    "input[type=file]",
    "input[type=image]",
    "input[type=color]",
    "input[type=range]",
    "input[type=date]",
    "input[type=datetime-local]",
    "input[type=month]",
    "input[type=time]",
    "input[type=week]",
    "input[type=number]",
    "input[type=email]",
    "input[type=password]",
    "input[type=search]",
    "input[type=tel]",
    "input[type=text]",
    "input[type=url]",
  ],
  FORM_ELEMENTS: [
    "select",
    "textarea",
    "option",
    "optgroup",
    "datalist",
    "output",
    "fieldset",
    "legend",
    "meter",
    "progress",
  ],
  ARIA_ROLES: [
    "[role=button]",
    "[role=link]",
    "[role=menuitem]",
    "[role=menuitemcheckbox]",
    "[role=menuitemradio]",
    "[role=option]",
    "[role=tab]",
    "[role=tabpanel]",
    "[role=treeitem]",
    "[role=gridcell]",
    "[role=columnheader]",
    "[role=rowheader]",
    "[role=slider]",
    "[role=spinbutton]",
    "[role=switch]",
    "[role=searchbox]",
    "[role=combobox]",
    "[role=listbox]",
    "[role=textbox]",
  ],
  EVENT_HANDLERS: [
    "[onclick]",
    "[onmousedown]",
    "[onmouseup]",
    "[ondblclick]",
    "[onkeydown]",
    "[onkeyup]",
    "[onkeypress]",
    "[onfocus]",
    "[onblur]",
    "[onchange]",
    "[oninput]",
    "[onsubmit]",
  ],
} as const;

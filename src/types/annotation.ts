export interface Annotation {
  website_section: string;
  state_before: string;
  state_after: string;
  change_analysis: string;
  element_aria_label: string;
  element_selector: string;
  element_type: string;
  coordinates: {
    x: number;
    y: number;
  };
  screenshot_before?: string;
  screenshot_after?: string;
}

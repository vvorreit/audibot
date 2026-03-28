export interface EtapeRPA {
  id: string;
  action: "fill" | "click" | "select" | "wait";
  selector?: string;
  selectors?: string[];
  variable?: string | null;
  waitFor?: string;
  timeout?: number;
  label?: string;
}

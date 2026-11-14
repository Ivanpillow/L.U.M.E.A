export type Fn = "ramp_up" | "ramp_down" | "band";

export interface Param {
  id: string;
  feature: string;
  fn: Fn;
  args: number[];
  args_raw: (number | string)[];
  weight?: number;
  gate?: boolean;
  comparability: "D" | "R" | "N";
  dimension: string;
  label: string;
  unit: string;
  src: string;
  verified: boolean;
  proxy?: boolean;
  why: string;
}

export interface Validation {
  known_median_pct: number | null;
  tropics_pct: number | null;
  jaccard: number;
  n_known: number;
  n_analog_cells?: number;
}

export interface Profile {
  id: string;
  target: string;
  label: string;
  nasa_gap: string;
  gap_src: string;
  analog_threshold: number;
  params: Param[];
  default_top: string[];
  validation?: Validation;
}

export interface Fact { k: string; v: string; src: string }

export interface Target {
  name: string;
  body: "moon" | "mars";
  summary: string;
  facts: Fact[];
  never_analog: Fact[];
}

export interface FeatureMeta { offset: number; monthly: boolean; lo: number; scale: number; unit: string }

export interface KnownSite { name: string; country: string; lat: number; lon: number; body: string; use: string }

export interface Manifest {
  generated: string;
  grid: { dlat: number; dlon: number; nlat: number; nlon: number };
  n: number;
  features: Record<string, FeatureMeta>;
  profiles: Profile[];
  targets: Record<string, Target>;
  sources: Record<string, { title: string; url: string }>;
  known: KnownSite[];
  known_verified: boolean;
  names: Record<string, string>;
  nms_km: number;
}

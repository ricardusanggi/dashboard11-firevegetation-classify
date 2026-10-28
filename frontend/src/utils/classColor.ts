// Maps a dataset class label to a semantic color, based on keyword heuristics.
// Class names are admin-defined at dataset upload time, so we can't hardcode
// exact labels — instead we match common Indonesian/English keywords for
// vegetation/fire-risk classification and fall back to a neutral color.

type ClassColor = {
  text: string;
  bg: string;
  border: string;
  bar: string;
  gradient: string;
};

const HEALTHY_KEYWORDS = ["sehat", "healthy", "hijau", "vegetasi", "subur", "normal"];
const FIRE_KEYWORDS = ["bakar", "fire", "burn", "kebakaran", "rawan", "kering", "risiko", "risk"];
const EMPTY_KEYWORDS = ["kosong", "tidak", "non", "lahan", "tanah", "gundul", "bare", "none", "unknown"];

const HEALTHY: ClassColor = {
  text: "text-green-700",
  bg: "bg-green-100",
  border: "border-green-300",
  bar: "bg-green-500",
  gradient: "from-green-600 to-emerald-600",
};

const FIRE: ClassColor = {
  text: "text-red-700",
  bg: "bg-red-100",
  border: "border-red-300",
  bar: "bg-red-500",
  gradient: "from-red-600 to-orange-600",
};

const EMPTY: ClassColor = {
  text: "text-stone-700",
  bg: "bg-stone-100",
  border: "border-stone-300",
  bar: "bg-stone-500",
  gradient: "from-stone-600 to-neutral-600",
};

const NEUTRAL: ClassColor = {
  text: "text-green-700",
  bg: "bg-green-100",
  border: "border-green-300",
  bar: "bg-green-500",
  gradient: "from-green-600 to-yellow-600",
};

function matchesAny(label: string, keywords: string[]) {
  return keywords.some((k) => label.includes(k));
}

export function getClassColor(label: string | null | undefined): ClassColor {
  const normalized = (label ?? "").toLowerCase().replaceAll("_", " ");

  if (matchesAny(normalized, FIRE_KEYWORDS)) return FIRE;
  if (matchesAny(normalized, HEALTHY_KEYWORDS)) return HEALTHY;
  if (matchesAny(normalized, EMPTY_KEYWORDS)) return EMPTY;

  return NEUTRAL;
}

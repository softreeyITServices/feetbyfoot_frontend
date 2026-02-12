export function toSlug(sentence: string): string {
  return sentence
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")                // replace & with and
    .replace(/[^a-z0-9]+/g, "-")         // replace non-alphanumeric with -
    .replace(/-+/g, "-")                 // collapse multiple -
    .replace(/^-|-$/g, "");              // trim leading/trailing -
}

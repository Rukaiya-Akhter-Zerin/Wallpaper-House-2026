export function getRecentSearches(): string[] {
  try { return JSON.parse(localStorage.getItem("wh-search-recent") || "[]"); } catch { return []; }
}
export function clearRecentSearches() { localStorage.removeItem("wh-search-recent"); }
export function removeRecentSearch(term: string) {
  const recent = getRecentSearches().filter((s) => s !== term);
  localStorage.setItem("wh-search-recent", JSON.stringify(recent));
}

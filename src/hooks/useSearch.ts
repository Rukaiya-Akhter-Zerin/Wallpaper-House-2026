const STORAGE_KEY = "wh-search-recent";

export function getRecentSearches(): string[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function clearRecentSearches() {
  localStorage.removeItem(STORAGE_KEY);
}

export function removeRecentSearch(term: string) {
  const recent = getRecentSearches().filter((s) => s !== term);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(recent));
}

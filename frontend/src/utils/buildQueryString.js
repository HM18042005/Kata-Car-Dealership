export function buildQueryString(searchTerm, filters) {
  const params = new URLSearchParams();
  if (searchTerm) params.set("make", searchTerm);
  if (filters.category) params.set("category", filters.category);
  if (filters.minPrice) params.set("min_price", filters.minPrice);
  if (filters.maxPrice) params.set("max_price", filters.maxPrice);
  return params.toString();
}

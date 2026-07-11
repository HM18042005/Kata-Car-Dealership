export default function FilterPanel({ filters, onChange }) {
  const categories = ["sedan", "suv", "hatchback", "truck", "coupe", "convertible", "van", "electric"];

  const handleChange = (key, value) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 items-end">
      <div className="w-full sm:w-1/3 flex flex-col gap-2">
        <label htmlFor="category" className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
          <img src="/svgs/filter.svg" alt="" aria-hidden="true" className="w-4 h-4 opacity-60" />
          Category
        </label>
        <select
          id="category"
          value={filters.category || ""}
          onChange={(e) => handleChange("category", e.target.value)}
          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
          ))}
        </select>
      </div>
      
      <div className="w-full sm:w-1/3 flex flex-col gap-2">
        <label htmlFor="minPrice" className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
          <img src="/svgs/dollar.svg" alt="" aria-hidden="true" className="w-4 h-4 opacity-60" />
          Min Price
        </label>
        <input
          id="minPrice"
          type="number"
          min="0"
          value={filters.minPrice || ""}
          onChange={(e) => handleChange("minPrice", e.target.value)}
          placeholder="No minimum"
          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900"
        />
      </div>

      <div className="w-full sm:w-1/3 flex flex-col gap-2">
        <label htmlFor="maxPrice" className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
          <img src="/svgs/dollar.svg" alt="" aria-hidden="true" className="w-4 h-4 opacity-60" />
          Max Price
        </label>
        <input
          id="maxPrice"
          type="number"
          min="0"
          value={filters.maxPrice || ""}
          onChange={(e) => handleChange("maxPrice", e.target.value)}
          placeholder="No maximum"
          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900"
        />
      </div>
    </div>
  );
}

export default function SearchBar({ value, onChange }) {
  return (
    <div className="relative w-full">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <img src="/svgs/search.svg" alt="" aria-hidden="true" className="w-5 h-5 opacity-40" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus:border-transparent shadow-sm text-slate-900 placeholder-slate-400 transition-shadow text-lg"
        placeholder="Search vehicles by make..."
        aria-label="Search vehicles by make"
      />
    </div>
  );
}

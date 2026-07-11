export default function VehicleCard({ vehicle, onPurchase }) {
  const isOutOfStock = vehicle.quantity === 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm transition-shadow hover:shadow-lg hover:-translate-y-0.5 flex flex-col h-full group">
      <div className="p-6 flex-grow flex flex-col relative">
        {/* Low stock warning */}
        {!isOutOfStock && vehicle.quantity <= 2 && (
          <div className="absolute top-4 right-4 flex items-center gap-1 bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-xs font-semibold tracking-wide">
            <img src="/svgs/alert-triangle.svg" alt="" aria-hidden="true" className="w-3 h-3" style={{ filter: "invert(40%) sepia(80%) saturate(2000%) hue-rotate(10deg)" }} />
            Low Stock
          </div>
        )}

        <div className="bg-slate-50 w-full h-40 rounded-lg flex items-center justify-center mb-6 group-hover:bg-teal-50 transition-colors">
          <img 
            src={`/svgs/${vehicle.category}.svg`} 
            alt="" 
            aria-hidden="true" 
            className="w-24 h-24 opacity-80" 
          />
        </div>

        <div className="mb-1 text-sm font-medium text-teal-600 uppercase tracking-wider">{vehicle.category}</div>
        <h3 className="text-xl font-bold text-slate-900 mb-2 line-clamp-2">{vehicle.make} {vehicle.model}</h3>
        
        <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 font-medium">Price</span>
            <span className="text-2xl font-bold text-slate-900">₹{vehicle.price.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-xs text-slate-500 font-medium">In Stock</span>
            <div className="flex items-center gap-1 text-slate-700 font-semibold">
              <img src="/svgs/layers.svg" alt="" aria-hidden="true" className="w-4 h-4" />
              {vehicle.quantity}
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 bg-slate-50 border-t border-slate-200">
        <button
          type="button"
          disabled={isOutOfStock}
          onClick={() => onPurchase(vehicle)}
          className={`w-full py-3 px-4 rounded-lg flex items-center justify-center gap-2 font-semibold transition-all ${
            isOutOfStock 
              ? "bg-slate-200 text-slate-500 cursor-not-allowed" 
              : "bg-teal-600 text-white hover:bg-teal-700 active:scale-[0.98] shadow hover:shadow-md"
          }`}
        >
          <img 
            src="/svgs/cart.svg" 
            alt="" 
            aria-hidden="true" 
            className={`w-5 h-5 ${isOutOfStock ? "opacity-50" : "invert"}`} 
          />
          {isOutOfStock ? "Out of stock" : "Purchase"}
        </button>
      </div>
    </div>
  );
}

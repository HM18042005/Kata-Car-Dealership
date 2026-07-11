export default function OrderCard({ order }) {
  const purchasedAt = new Date(order.created_at).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm flex flex-col h-full">
      <div className="p-6 flex-grow flex flex-col">
        <div className="bg-slate-50 w-full h-40 rounded-lg flex items-center justify-center mb-6">
          <img
            src={`/svgs/${order.category}.svg`}
            alt=""
            aria-hidden="true"
            className="w-24 h-24 opacity-80"
          />
        </div>

        <div className="mb-1 text-sm font-medium text-teal-600 uppercase tracking-wider">{order.category}</div>
        <h3 className="text-xl font-bold text-slate-900 mb-2 line-clamp-2">{order.make} {order.model}</h3>

        <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 font-medium">Price Paid</span>
            <span className="text-2xl font-bold text-slate-900">₹{order.price.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-xs text-slate-500 font-medium">Purchased</span>
            <span className="text-sm font-semibold text-slate-700">{purchasedAt}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

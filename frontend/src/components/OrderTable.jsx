export default function OrderTable({ orders }) {
  if (orders.length === 0) {
    return (
      <div className="p-12 text-center text-slate-500 border border-slate-200 rounded-xl bg-slate-50 flex flex-col items-center gap-4">
        <img src="/svgs/box.svg" alt="" aria-hidden="true" className="w-12 h-12 opacity-20" />
        <span className="text-lg">No orders yet.</span>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-xl border border-slate-200 shadow-sm animate-fade-in">
      <table className="w-full text-left border-collapse whitespace-nowrap">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="p-4 font-semibold text-slate-700">Buyer</th>
            <th className="p-4 font-semibold text-slate-700">Vehicle</th>
            <th className="p-4 font-semibold text-slate-700">Category</th>
            <th className="p-4 font-semibold text-slate-700">Price</th>
            <th className="p-4 font-semibold text-slate-700">Date</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order.id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
              <td className="p-4 text-slate-900">{order.user_email}</td>
              <td className="p-4 text-slate-900 font-medium">{order.make} {order.model}</td>
              <td className="p-4 text-slate-500 uppercase text-xs font-semibold tracking-wider">{order.category}</td>
              <td className="p-4 text-slate-900 font-medium">₹{order.price.toLocaleString("en-IN")}</td>
              <td className="p-4 text-slate-500">
                {new Date(order.created_at).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

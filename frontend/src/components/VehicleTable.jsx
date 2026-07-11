import { useState } from "react";

function Row({ vehicle, onEdit, onDelete, onRestock }) {
  const [amount, setAmount] = useState(1);
  return (
    <tr className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
      <td className="p-4 text-slate-900 font-medium">{vehicle.make}</td>
      <td className="p-4 text-slate-900">{vehicle.model}</td>
      <td className="p-4 text-slate-500 uppercase text-xs font-semibold tracking-wider">{vehicle.category}</td>
      <td className="p-4 text-slate-900 font-medium">${vehicle.price.toLocaleString()}</td>
      <td className="p-4">
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${vehicle.quantity === 0 ? "bg-red-100 text-red-700" : vehicle.quantity <= 2 ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}>
          {vehicle.quantity} in stock
        </span>
      </td>
      <td className="p-4">
        <div className="flex items-center gap-2">
          <button onClick={() => onEdit(vehicle)} aria-label="Edit" className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors">
            <img src="/svgs/pencil.svg" alt="" aria-hidden="true" className="w-4 h-4" style={{ filter: "invert(30%) sepia(80%) saturate(2000%) hue-rotate(200deg)" }} />
          </button>
          <button onClick={() => onDelete(vehicle.id)} aria-label="Delete" className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors">
            <img src="/svgs/trash.svg" alt="" aria-hidden="true" className="w-4 h-4" style={{ filter: "invert(20%) sepia(90%) saturate(3000%) hue-rotate(350deg)" }} />
          </button>
          <div className="flex items-center ml-2 border border-slate-200 rounded-lg p-1 bg-white focus-within:ring-2 focus-within:ring-blue-600 transition-shadow">
            <input 
              type="number" 
              min="1" 
              value={amount} 
              onChange={(e) => setAmount(Number(e.target.value))} 
              className="w-16 p-1 text-center focus:outline-none text-slate-900 bg-transparent text-sm font-medium"
              aria-label="Restock amount"
            />
            <button 
              disabled={!(amount >= 1)}
              onClick={() => onRestock(vehicle.id, amount)} 
              aria-label="Restock"
              className={`p-1.5 rounded transition-colors flex items-center justify-center ${amount >= 1 ? "bg-blue-50 hover:bg-blue-100" : "opacity-50 cursor-not-allowed"}`}
            >
              <img src="/svgs/box.svg" alt="" aria-hidden="true" className="w-4 h-4" style={{ filter: "invert(30%) sepia(80%) saturate(2000%) hue-rotate(200deg)" }} />
            </button>
          </div>
        </div>
      </td>
    </tr>
  );
}

export default function VehicleTable({ vehicles, onEdit, onDelete, onRestock }) {
  if (vehicles.length === 0) {
    return <div className="p-12 text-center text-slate-500 border border-slate-200 rounded-xl bg-slate-50 flex flex-col items-center gap-4">
      <img src="/svgs/box.svg" alt="" aria-hidden="true" className="w-12 h-12 opacity-20" />
      <span className="text-lg">No vehicles in inventory.</span>
    </div>;
  }

  return (
    <div className="overflow-x-auto bg-white rounded-xl border border-slate-200 shadow-sm animate-fade-in">
      <table className="w-full text-left border-collapse whitespace-nowrap">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="p-4 font-semibold text-slate-700">Make</th>
            <th className="p-4 font-semibold text-slate-700">Model</th>
            <th className="p-4 font-semibold text-slate-700">Category</th>
            <th className="p-4 font-semibold text-slate-700">Price</th>
            <th className="p-4 font-semibold text-slate-700">Status</th>
            <th className="p-4 font-semibold text-slate-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {vehicles.map(v => (
            <Row key={v.id} vehicle={v} onEdit={onEdit} onDelete={onDelete} onRestock={onRestock} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

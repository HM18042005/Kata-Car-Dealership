import { useState } from "react";

export default function VehicleForm({ initial, onSubmit }) {
  const [make, setMake] = useState(initial?.make || "");
  const [model, setModel] = useState(initial?.model || "");
  const [category, setCategory] = useState(initial?.category || "sedan");
  const [price, setPrice] = useState(initial?.price || "");
  const [quantity, setQuantity] = useState(initial?.quantity || "");

  const categories = ["sedan", "suv", "hatchback", "truck", "coupe", "convertible", "van", "electric"];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      make,
      model,
      category,
      price: Number(price),
      quantity: Number(quantity),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="make" className="block text-sm font-semibold text-slate-700 mb-1.5">Make</label>
          <input id="make" required type="text" value={make} onChange={e => setMake(e.target.value)} className="w-full p-3 border border-slate-200 rounded-lg focus-visible:ring-2 focus-visible:ring-blue-600 focus:outline-none bg-slate-50 text-slate-900 transition-shadow" />
        </div>
        <div>
          <label htmlFor="model" className="block text-sm font-semibold text-slate-700 mb-1.5">Model</label>
          <input id="model" required type="text" value={model} onChange={e => setModel(e.target.value)} className="w-full p-3 border border-slate-200 rounded-lg focus-visible:ring-2 focus-visible:ring-blue-600 focus:outline-none bg-slate-50 text-slate-900 transition-shadow" />
        </div>
      </div>
      <div>
        <label htmlFor="category" className="block text-sm font-semibold text-slate-700 mb-1.5">Category</label>
        <select id="category" required value={category} onChange={e => setCategory(e.target.value)} className="w-full p-3 border border-slate-200 rounded-lg focus-visible:ring-2 focus-visible:ring-blue-600 focus:outline-none bg-slate-50 text-slate-900 transition-shadow">
          {categories.map(cat => <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="price" className="block text-sm font-semibold text-slate-700 mb-1.5">Price</label>
          <input id="price" required type="number" min="0" value={price} onChange={e => setPrice(e.target.value)} className="w-full p-3 border border-slate-200 rounded-lg focus-visible:ring-2 focus-visible:ring-blue-600 focus:outline-none bg-slate-50 text-slate-900 transition-shadow" />
        </div>
        <div>
          <label htmlFor="quantity" className="block text-sm font-semibold text-slate-700 mb-1.5">Quantity</label>
          <input id="quantity" required type="number" min="0" value={quantity} onChange={e => setQuantity(e.target.value)} className="w-full p-3 border border-slate-200 rounded-lg focus-visible:ring-2 focus-visible:ring-blue-600 focus:outline-none bg-slate-50 text-slate-900 transition-shadow" />
        </div>
      </div>
      <button type="submit" className="w-full py-3.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg mt-2">
        {initial ? "Update Vehicle" : "Add Vehicle"}
      </button>
    </form>
  );
}

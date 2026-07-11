import Modal from "./Modal";

export default function ConfirmPurchaseModal({ vehicle, onConfirm, onCancel, loading }) {
  return (
    <Modal title="Confirm Purchase" onClose={onCancel}>
      <p className="text-slate-700 mb-4">
        You're about to purchase this vehicle. One unit will be reserved for you.
      </p>
      <div className="bg-slate-50 rounded-lg border border-slate-200 p-4 mb-6">
        <div className="text-sm font-medium text-teal-600 uppercase tracking-wider mb-1">{vehicle.category}</div>
        <div className="text-lg font-bold text-slate-900 mb-2">{vehicle.make} {vehicle.model}</div>
        <div className="text-2xl font-bold text-slate-900">₹{vehicle.price.toLocaleString("en-IN")}</div>
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 px-4 rounded-lg font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 py-3 px-4 rounded-lg font-semibold bg-teal-600 text-white hover:bg-teal-700 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Confirming..." : "Confirm Purchase"}
        </button>
      </div>
    </Modal>
  );
}

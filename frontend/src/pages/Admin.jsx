import { useState, useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import VehicleTable from "../components/VehicleTable";
import VehicleForm from "../components/VehicleForm";
import Spinner from "../components/Spinner";
import Toast from "../components/Toast";
import { useApi } from "../hooks/useApi";

export default function Admin() {
  const [toast, setToast] = useState(null);
  const [modalState, setModalState] = useState({ isOpen: false, vehicle: null });
  const modalRef = useRef(null);
  const triggerRef = useRef(null);

  const { data: vehicles, loading, error, execute: fetchVehicles } = useApi("/api/vehicles/search?", { auto: true });
  const { execute: createVehicle } = useApi("/api/vehicles", { method: "POST" });
  const { execute: updateVehicle } = useApi("/api/vehicles", { method: "PUT" });
  const { execute: deleteVehicleApi } = useApi("/api/vehicles", { method: "DELETE" });
  const { execute: restockVehicle } = useApi("/api/vehicles", { method: "POST" });

  const openModal = (vehicle = null) => {
    setModalState({ isOpen: true, vehicle });
  };

  const closeModal = () => {
    setModalState({ isOpen: false, vehicle: null });
    triggerRef.current?.focus();
  };

  useEffect(() => {
    if (!modalState.isOpen) return;

    const modalElement = modalRef.current;
    if (!modalElement) return;

    const focusableElements = modalElement.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (firstElement) firstElement.focus();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeModal();
      } else if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [modalState.isOpen]);

  const handleFormSubmit = async (vehicleData) => {
    try {
      if (modalState.vehicle) {
        await updateVehicle({ path: `/api/vehicles/${modalState.vehicle.id}`, body: vehicleData });
        setToast({ type: "success", message: "Vehicle updated successfully." });
      } else {
        await createVehicle({ body: vehicleData });
        setToast({ type: "success", message: "Vehicle created successfully." });
      }
      closeModal();
      fetchVehicles().catch(() => {});
    } catch (err) {
      setToast({ type: "error", message: "Failed to save vehicle." });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this vehicle?")) return;
    try {
      await deleteVehicleApi({ path: `/api/vehicles/${id}` });
      setToast({ type: "success", message: "Vehicle deleted." });
      fetchVehicles().catch(() => {});
    } catch (err) {
      setToast({ type: "error", message: "Failed to delete vehicle." });
    }
  };

  const handleRestock = async (id, amount) => {
    try {
      await restockVehicle({ path: `/api/vehicles/${id}/restock`, body: { amount } });
      setToast({ type: "success", message: `Restocked ${amount} units.` });
      fetchVehicles().catch(() => {});
    } catch (err) {
      setToast({ type: "error", message: "Failed to restock vehicle." });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Inventory Management</h1>
            <p className="text-slate-500 text-lg font-medium">Add, edit, delete, and restock vehicles.</p>
          </div>
          <button
            type="button"
            ref={triggerRef}
            onClick={() => openModal()}
            className="flex items-center justify-center gap-2 bg-teal-600 text-white px-5 py-3 rounded-xl font-bold hover:bg-teal-700 active:scale-[0.98] transition-all shadow hover:shadow-md"
          >
            <img src="/svgs/plus.svg" alt="" aria-hidden="true" className="w-5 h-5 invert" />
            Add Vehicle
          </button>
        </div>

        <section aria-label="Vehicle inventory management">
          {error && <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 mb-6 font-medium">{error}</div>}
          
          {loading && !vehicles ? (
            <Spinner />
          ) : (
            <VehicleTable 
              vehicles={vehicles || []} 
              onEdit={openModal} 
              onDelete={handleDelete} 
              onRestock={handleRestock} 
            />
          )}
        </section>
      </main>

      {modalState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div 
            ref={modalRef} 
            role="dialog" 
            aria-modal="true" 
            aria-labelledby="modal-title"
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] scale-100 transition-transform"
          >
            <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h2 id="modal-title" className="text-xl font-bold text-slate-900">
                {modalState.vehicle ? "Edit Vehicle" : "Add New Vehicle"}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                aria-label="Close modal"
                className="p-2 hover:bg-slate-200 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
              >
                <img src="/svgs/close.svg" alt="" aria-hidden="true" className="w-5 h-5 opacity-60" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <VehicleForm 
                initial={modalState.vehicle} 
                onSubmit={handleFormSubmit} 
              />
            </div>
          </div>
        </div>
      )}

      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
}

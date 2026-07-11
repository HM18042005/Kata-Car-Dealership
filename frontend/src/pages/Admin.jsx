import { useState, useRef } from "react";
import Navbar from "../components/Navbar";
import VehicleTable from "../components/VehicleTable";
import VehicleForm from "../components/VehicleForm";
import Spinner from "../components/Spinner";
import Toast from "../components/Toast";
import Modal from "../components/Modal";
import { useApi } from "../hooks/useApi";

export default function Admin() {
  const [toast, setToast] = useState(null);
  const [modalState, setModalState] = useState({ isOpen: false, vehicle: null });
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
        <Modal
          title={modalState.vehicle ? "Edit Vehicle" : "Add New Vehicle"}
          onClose={closeModal}
        >
          <VehicleForm
            initial={modalState.vehicle}
            onSubmit={handleFormSubmit}
          />
        </Modal>
      )}

      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
}

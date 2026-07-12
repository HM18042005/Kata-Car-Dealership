import { useState, useRef, useEffect, useContext } from "react";
import Navbar from "../components/Navbar";
import SearchBar from "../components/SearchBar";
import FilterPanel from "../components/FilterPanel";
import VehicleTable from "../components/VehicleTable";
import VehicleForm from "../components/VehicleForm";
import UserManagement from "../components/UserManagement";
import Spinner from "../components/Spinner";
import Toast from "../components/Toast";
import Modal from "../components/Modal";
import { useApi } from "../hooks/useApi";
import { buildQueryString } from "../utils/buildQueryString";
import { AuthContext } from "../context/AuthContext";

export default function Admin() {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("inventory");
  const [toast, setToast] = useState(null);
  const [modalState, setModalState] = useState({ isOpen: false, vehicle: null });
  const triggerRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({});
  const [query, setQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(buildQueryString(searchTerm, filters));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, filters]);

  const { data: vehicles, loading, error, execute: fetchVehicles } = useApi(`/api/vehicles/search?${query}`, { auto: true });
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
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
              {activeTab === "inventory" ? "Inventory Management" : "User Management"}
            </h1>
            <p className="text-slate-500 text-lg font-medium">
              {activeTab === "inventory" ? "Add, edit, delete, and restock vehicles." : "Promote, demote, and remove user accounts."}
            </p>
          </div>
          {activeTab === "inventory" && (
            <button
              type="button"
              ref={triggerRef}
              onClick={() => openModal()}
              className="flex items-center justify-center gap-2 bg-teal-600 text-white px-5 py-3 rounded-xl font-bold hover:bg-teal-700 active:scale-[0.98] transition-all shadow hover:shadow-md"
            >
              <img src="/svgs/plus.svg" alt="" aria-hidden="true" className="w-5 h-5 invert" />
              Add Vehicle
            </button>
          )}
        </div>

        <div className="flex gap-2 mb-8 border-b border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab("inventory")}
            className={`px-4 py-2.5 font-semibold text-sm border-b-2 transition-colors ${activeTab === "inventory" ? "border-teal-600 text-teal-600" : "border-transparent text-slate-500 hover:text-slate-900"}`}
          >
            Inventory
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2.5 font-semibold text-sm border-b-2 transition-colors ${activeTab === "users" ? "border-teal-600 text-teal-600" : "border-transparent text-slate-500 hover:text-slate-900"}`}
          >
            Users
          </button>
        </div>

        {activeTab === "inventory" ? (
          <>
            <section aria-label="Search and filters" className="mb-8 flex flex-col gap-4">
              <SearchBar value={searchTerm} onChange={setSearchTerm} />
              <FilterPanel filters={filters} onChange={setFilters} />
            </section>

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
                  emptyMessage={searchTerm || Object.keys(filters).length ? "No vehicles match your search criteria." : "No vehicles in inventory."}
                />
              )}
            </section>
          </>
        ) : (
          <UserManagement currentUserId={user?.sub} setToast={setToast} />
        )}
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

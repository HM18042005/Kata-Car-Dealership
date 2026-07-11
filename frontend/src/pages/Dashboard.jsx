import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import SearchBar from "../components/SearchBar";
import FilterPanel from "../components/FilterPanel";
import VehicleCard from "../components/VehicleCard";
import Spinner from "../components/Spinner";
import EmptyState from "../components/EmptyState";
import Toast from "../components/Toast";
import ConfirmPurchaseModal from "../components/ConfirmPurchaseModal";
import { useApi } from "../hooks/useApi";

function buildQueryString(searchTerm, filters) {
  const params = new URLSearchParams();
  if (searchTerm) params.set("make", searchTerm);
  if (filters.category) params.set("category", filters.category);
  if (filters.minPrice) params.set("min_price", filters.minPrice);
  if (filters.maxPrice) params.set("max_price", filters.maxPrice);
  return params.toString();
}

export default function Dashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({});
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState(null);
  const [pendingVehicle, setPendingVehicle] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(buildQueryString(searchTerm, filters));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, filters]);

  const { data: vehicles, loading, error, execute: refetch } = useApi(`/api/vehicles/search?${query}`, { auto: true });
  const { execute: purchaseVehicle, loading: purchaseLoading } = useApi("/api/vehicles", { method: "POST" });

  const requestPurchase = (vehicle) => {
    setPendingVehicle(vehicle);
  };

  const confirmPurchase = async () => {
    const id = pendingVehicle.id;
    try {
      await purchaseVehicle({ path: `/api/vehicles/${id}/purchase` });
      setToast({ type: "success", message: "Purchase successful!" });
      refetch().catch(() => {});
    } catch (err) {
      setToast({ type: "error", message: "Failed to purchase vehicle." });
    } finally {
      setPendingVehicle(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Vehicle Inventory</h1>
          <p className="text-slate-500 text-lg font-medium">Browse and purchase vehicles from our premium selection.</p>
        </div>

        <section aria-label="Search and filters" className="mb-8 flex flex-col gap-4">
          <SearchBar value={searchTerm} onChange={setSearchTerm} />
          <FilterPanel filters={filters} onChange={setFilters} />
        </section>

        <section aria-label="Vehicle inventory">
          {error && <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 mb-6 font-medium">{error}</div>}
          
          {loading && !vehicles ? (
            <Spinner />
          ) : !vehicles || vehicles.length === 0 ? (
            <EmptyState
              image={searchTerm || Object.keys(filters).length ? "/svgs/no-search-results.svg" : "/svgs/empty-inventory.svg"}
              alt={searchTerm || Object.keys(filters).length ? "No search results" : "Empty inventory"}
              message={searchTerm || Object.keys(filters).length ? "No vehicles match your search criteria." : "Our inventory is currently empty."}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {vehicles.map(vehicle => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} onPurchase={requestPurchase} />
              ))}
            </div>
          )}
        </section>
      </main>
      {pendingVehicle && (
        <ConfirmPurchaseModal
          vehicle={pendingVehicle}
          loading={purchaseLoading}
          onConfirm={confirmPurchase}
          onCancel={() => setPendingVehicle(null)}
        />
      )}
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
}

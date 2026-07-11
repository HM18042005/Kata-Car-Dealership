import Navbar from "../components/Navbar";
import OrderTable from "../components/OrderTable";
import Spinner from "../components/Spinner";
import { useApi } from "../hooks/useApi";

export default function AdminOrders() {
  const { data: orders, loading, error } = useApi("/api/orders/all", { auto: true });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">All Orders</h1>
          <p className="text-slate-500 text-lg font-medium">Every purchase made across all users.</p>
        </div>

        <section aria-label="All orders">
          {error && <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 mb-6 font-medium">{error}</div>}

          {loading && !orders ? <Spinner /> : <OrderTable orders={orders || []} />}
        </section>
      </main>
    </div>
  );
}

import Navbar from "../components/Navbar";
import OrderCard from "../components/OrderCard";
import Spinner from "../components/Spinner";
import EmptyState from "../components/EmptyState";
import { useApi } from "../hooks/useApi";

export default function Orders() {
  const { data: orders, loading, error } = useApi("/api/orders", { auto: true });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">My Orders</h1>
          <p className="text-slate-500 text-lg font-medium">Vehicles you've purchased.</p>
        </div>

        <section aria-label="Order history">
          {error && <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 mb-6 font-medium">{error}</div>}

          {loading && !orders ? (
            <Spinner />
          ) : !orders || orders.length === 0 ? (
            <EmptyState
              image="/svgs/empty-inventory.svg"
              alt="No orders"
              message="You haven't purchased any vehicles yet."
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {orders.map(order => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 animate-fade-in text-center font-sans">
      <img src="/svgs/error-404.svg" alt="404 Not Found" className="w-64 sm:w-80 h-auto mb-8 opacity-90" />
      <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Page Not Found</h1>
      <p className="text-lg text-slate-500 mb-8 max-w-md mx-auto font-medium">
        We can't seem to find the page you're looking for. It might have been removed or the link is broken.
      </p>
      <Link to="/" className="bg-teal-600 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-teal-700 active:scale-[0.98] transition-all shadow-md hover:shadow-lg">
        Return to Dashboard
      </Link>
    </main>
  );
}

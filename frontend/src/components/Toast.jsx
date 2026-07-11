import { useEffect } from "react";

export default function Toast({ type, message, onClose }) {
  useEffect(() => {
    if (!onClose) return;
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === "success" ? "bg-green-600" : "bg-red-600";
  const icon = type === "success" ? "check.svg" : "alert-circle.svg";

  return (
    <div className={`fixed bottom-4 right-4 flex items-center gap-2 px-4 py-3 text-white rounded-lg shadow-lg ${bgColor} animate-fade-in z-50`}>
      <img src={`/svgs/${icon}`} className="w-5 h-5 invert" aria-hidden="true" alt="" />
      <p className="text-sm font-medium">{message}</p>
      {onClose && (
        <button onClick={onClose} aria-label="Close" className="ml-4 opacity-75 hover:opacity-100 transition-opacity">
          <img src="/svgs/close.svg" className="w-4 h-4 invert" aria-hidden="true" alt="" />
        </button>
      )}
    </div>
  );
}

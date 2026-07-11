export default function EmptyState({ image, message }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center animate-fade-in">
      <img src={image} alt="Empty state" className="w-48 h-auto mb-6" />
      <p className="text-slate-500 text-lg">{message}</p>
    </div>
  );
}

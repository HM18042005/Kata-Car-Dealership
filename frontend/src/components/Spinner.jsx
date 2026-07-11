export default function Spinner() {
  return (
    <div className="flex justify-center items-center p-8">
      <img 
        src="/svgs/spinner.svg" 
        className="w-10 h-10 animate-spin text-teal-600" 
        aria-hidden="true" 
        alt="" 
        style={{ filter: "invert(30%) sepia(80%) saturate(2000%) hue-rotate(150deg) brightness(95%) contrast(90%)" }}
      />
    </div>
  );
}

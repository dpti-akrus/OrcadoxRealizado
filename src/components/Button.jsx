export default function Button({ children, variant = "primary", className = "", ...props }) {
  const variants = {
    primary: "bg-akrus text-white shadow-[0_10px_22px_rgba(23,63,98,0.18)] hover:bg-akrus-800",
    secondary: "border border-slate-200 bg-white text-akrus hover:border-akrus/40",
    ghost: "bg-transparent text-akrus hover:bg-akrus-50",
    danger: "border border-red-100 bg-white text-red-600 hover:bg-red-50"
  };

  return (
    <button
      className={`rounded-lg px-4 py-2.5 text-sm font-bold transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

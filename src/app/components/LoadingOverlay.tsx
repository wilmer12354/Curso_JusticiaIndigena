"use client";

export function LoadingOverlay({ message = "Cargando..." }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-5">
        <div className="h-14 w-14 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-white text-xl font-semibold tracking-wide">{message}</p>
        <p className="text-slate-400 text-sm">Por favor espera, no recargues la página</p>
      </div>
    </div>
  );
}

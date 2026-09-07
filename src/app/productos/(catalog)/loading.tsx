export default function Loading() {
  return (
    <div className="mx-auto max-w-[1600px] px-6 py-12" aria-busy="true" aria-label="Cargando productos">
      <div className="mb-8 flex flex-col gap-3">
        <div className="h-3 w-20 animate-pulse rounded-full bg-sand-dark/60" />
        <div className="h-9 w-64 animate-pulse rounded-full bg-sand-dark/60" />
      </div>
      <div className="flex gap-3">
        <div className="h-10 w-40 animate-pulse rounded-full bg-sand-dark/60" />
        <div className="h-10 w-36 animate-pulse rounded-full bg-sand-dark/60" />
      </div>
      <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-3">
            <div className="aspect-square animate-pulse rounded-card bg-sand-dark/60" />
            <div className="h-3 w-16 animate-pulse rounded-full bg-sand-dark/60" />
            <div className="h-4 w-full animate-pulse rounded-full bg-sand-dark/60" />
            <div className="h-4 w-20 animate-pulse rounded-full bg-sand-dark/60" />
          </div>
        ))}
      </div>
    </div>
  );
}

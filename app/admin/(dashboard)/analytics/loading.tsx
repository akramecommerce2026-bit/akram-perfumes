function Box({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl bg-muted ${className}`} />;
}

export default function AnalyticsLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <Box className="h-9 w-48 rounded-lg" />
          <Box className="h-9 w-24 rounded-lg" />
        </div>
        <Box className="h-8 w-full max-w-md rounded-lg" />
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 15 }).map((_, i) => (
          <Box key={i} className="h-28" />
        ))}
      </div>

      {/* Revenue chart */}
      <Box className="h-80" />

      {/* Two-column rows */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Box className="h-72" />
        <Box className="h-72" />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Box className="h-80" />
        <Box className="h-80" />
      </div>
      <Box className="h-32" />
      <Box className="h-72" />
    </div>
  );
}

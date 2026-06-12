export function SkeletonRow({ cols = 6 }: { cols?: number }) {
  return (
    <tr className="border-b border-gray-100">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="td">
          <div className="h-4 bg-gray-100 rounded animate-pulse" style={{ width: `${60 + Math.random() * 30}%` }} />
        </td>
      ))}
    </tr>
  );
}

export function SkeletonCard() {
  return (
    <div className="card p-5 space-y-3">
      <div className="h-4 bg-gray-100 rounded animate-pulse w-1/3" />
      <div className="h-8 bg-gray-100 rounded animate-pulse w-1/2" />
      <div className="h-3 bg-gray-100 rounded animate-pulse w-1/4" />
    </div>
  );
}

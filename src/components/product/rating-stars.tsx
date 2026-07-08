import { Star } from "@phosphor-icons/react/dist/ssr";

export function RatingStars({
  rating,
  count,
  size = 14,
}: {
  rating: number;
  count?: number;
  size?: number;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5 text-gold" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={size}
            weight={i < Math.round(rating) ? "fill" : "regular"}
          />
        ))}
      </div>
      <span className="sr-only">{rating.toFixed(1)} de 5 estrellas</span>
      {typeof count === "number" && (
        <span className="text-xs text-olive-500">({count})</span>
      )}
    </div>
  );
}

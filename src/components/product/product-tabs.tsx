"use client";

import { useState } from "react";
import { RatingStars } from "./rating-stars";

type Review = {
  id: string;
  authorName: string;
  rating: number;
  comment: string;
  createdAt: Date;
};

export function ProductTabs({
  description,
  nutritionFacts,
  reviews,
}: {
  description: string;
  nutritionFacts: Record<string, string> | null;
  reviews: Review[];
}) {
  const tabs = [
    { id: "descripcion", label: "Descripción" },
    ...(nutritionFacts ? [{ id: "nutricion", label: "Información nutricional" }] : []),
    { id: "reseñas", label: `Reseñas (${reviews.length})` },
  ];
  const [active, setActive] = useState(tabs[0].id);

  return (
    <div>
      <div className="flex gap-8 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActive(tab.id)}
            className={`relative cursor-pointer pb-4 font-sans text-sm font-medium transition-colors ${
              active === tab.id ? "text-olive-900" : "text-olive-500 hover:text-olive-700"
            }`}
          >
            {tab.label}
            {active === tab.id && (
              <span className="absolute inset-x-0 -bottom-px h-0.5 bg-gold" />
            )}
          </button>
        ))}
      </div>

      <div className="py-8">
        {active === "descripcion" && (
          <p className="max-w-2xl font-sans text-base leading-relaxed text-olive-700/90">
            {description}
          </p>
        )}

        {active === "nutricion" && nutritionFacts && (
          <dl className="grid max-w-md grid-cols-2 gap-x-6 gap-y-3">
            {Object.entries(nutritionFacts).map(([key, value]) => (
              <div key={key} className="flex items-baseline justify-between border-b border-border/70 py-2 col-span-2 sm:col-span-1">
                <dt className="font-sans text-sm capitalize text-olive-500">{key}</dt>
                <dd className="font-sans text-sm font-semibold text-olive-900">{value}</dd>
              </div>
            ))}
          </dl>
        )}

        {active === "reseñas" && (
          <div className="flex max-w-2xl flex-col gap-6">
            {reviews.length === 0 ? (
              <p className="font-sans text-sm text-olive-500">
                Todavía no hay reseñas para este producto.
              </p>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="flex flex-col gap-2 border-b border-border/70 pb-6">
                  <div className="flex items-center justify-between">
                    <span className="font-sans text-sm font-semibold text-olive-900">
                      {review.authorName}
                    </span>
                    <RatingStars rating={review.rating} />
                  </div>
                  <p className="font-sans text-sm leading-relaxed text-olive-700/90">
                    {review.comment}
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

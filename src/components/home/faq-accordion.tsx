"use client";

import { useState } from "react";
import { CaretDown } from "@phosphor-icons/react/dist/ssr";

export type FaqItem = { question: string; answer: string };

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="flex flex-col divide-y divide-border">
      {items.map((item, i) => {
        const open = openIndex === i;
        return (
          <div key={item.question} className="py-5">
            <button
              type="button"
              onClick={() => setOpenIndex(open ? null : i)}
              aria-expanded={open}
              className="flex w-full cursor-pointer items-center justify-between gap-4 text-left"
            >
              <span className="font-display text-lg text-olive-900">
                {item.question}
              </span>
              <CaretDown
                size={18}
                className={`shrink-0 text-olive-500 transition-transform duration-300 ${
                  open ? "rotate-180" : ""
                }`}
              />
            </button>
            <div
              className={`grid transition-all duration-300 ease-out ${
                open ? "grid-rows-[1fr] opacity-100 mt-3" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <p className="overflow-hidden font-sans text-sm leading-relaxed text-olive-700/90">
                {item.answer}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

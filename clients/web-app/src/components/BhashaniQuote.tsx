import { useEffect, useState } from "react";

const QUOTES = [
  "Education is the backbone of a nation.",
  "The peasants and workers are the real power of this land.",
  "Knowledge without action is a lamp without flame.",
  "Stand for the oppressed, never bow to the oppressor.",
  "A nation rises on the strength of its students and farmers.",
];

export function BhashaniQuote({ className = "" }: { className?: string }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((n) => (n + 1) % QUOTES.length), 5000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className={className}>
      <blockquote
        key={i}
        className="font-display text-2xl leading-snug animate-fade-in"
      >
        “{QUOTES[i]}”
      </blockquote>
      <div className="mt-3 text-sm opacity-80">— Maulana Abdul Hamid Khan Bhashani</div>
      <div className="mt-4 flex justify-center gap-1.5">
        {QUOTES.map((_, idx) => (
          <span
            key={idx}
            className={`h-1 rounded-full transition-all ${idx === i ? "w-6 bg-primary" : "w-2 bg-sidebar-foreground/30"
              }`}
          />
        ))}
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Building2 } from "lucide-react";
import hall1 from "@/assets/halls/hall-1.jpeg";
import hall2 from "@/assets/halls/hall-1.jpeg";
import hall3 from "@/assets/halls/hall-1.jpeg";
import hall4 from "@/assets/halls/hall-1.jpeg";
import hall5 from "@/assets/halls/hall-1.jpeg";
import hall6 from "@/assets/halls/hall-1.jpeg";
import hall7 from "@/assets/halls/hall-1.jpeg";


interface Slide {
  shortName: string;
  name: string;
  photo: string;
}

const SLIDES: Slide[] = [
  { shortName: "JAMH",  name: "Jatir Janak Bangabandhu Sheikh Mujibur Rahman Hall", photo: hall1 },
  { shortName: "BSBH",  name: "Bangamata Sheikh Fazilatunnesa Mujib Hall",          photo: hall2 },
  { shortName: "SHJH",  name: "Shaheed Ziaur Rahman Hall",                          photo: hall3 },
  { shortName: "SMKH",  name: "Shaheed Mir Quasem Ali Hall",                        photo: hall4 },
  { shortName: "MSBH",  name: "Mawlana Bhashani Hall",                              photo: hall5 },
  { shortName: "SKBH",  name: "Sher-e-Bangla A.K. Fazlul Haq Hall",                photo: hall6 },
  { shortName: "NKGH",  name: "Netaji Subhas Chandra Bose Hall",                   photo: hall7 },
];

export function HallGallery({
  className = "",
  autoplay = true,
  aspect = "aspect-[16/9]",
}: {
  className?: string;
  autoplay?: boolean;
  aspect?: string;
}) {
  const [i, setI] = useState(0);
  const count = SLIDES.length;
  const prev = () => setI((n) => (n - 1 + count) % count);
  const next = () => setI((n) => (n + 1) % count);

  useEffect(() => {
    if (!autoplay) return;
    const id = setInterval(() => setI((n) => (n + 1) % count), 4500);
    return () => clearInterval(id);
  }, [autoplay, count]);

  const s = SLIDES[i];

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm ${className}`}>
      <div className={`relative w-full ${aspect}`}>
        {SLIDES.map((slide, idx) => (
          <img
            key={slide.shortName}
            src={slide.photo}
            alt={slide.name}
            loading={idx === 0 ? "eager" : "lazy"}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
              idx === i ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}

        <button
          type="button"
          onClick={prev}
          aria-label="Previous hall"
          className="absolute left-2 top-1/2 -translate-y-1/2 grid size-9 place-items-center rounded-full bg-background/80 text-foreground backdrop-blur hover:bg-background"
        >
          <ChevronLeft className="size-5" />
        </button>
        <button
          type="button"
          onClick={next}
          aria-label="Next hall"
          className="absolute right-2 top-1/2 -translate-y-1/2 grid size-9 place-items-center rounded-full bg-background/80 text-foreground backdrop-blur hover:bg-background"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>

      <div className="px-4 pt-4 pb-1 text-center bg-card">
        <div className="flex items-center justify-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
          <Building2 className="size-3.5" /> Residential Hall · {s.shortName}
        </div>
        <div className="mt-1 font-bold text-lg sm:text-xl leading-tight">{s.name}</div>
      </div>

      <div className="flex items-center justify-center gap-1.5 py-3 bg-card">
        {SLIDES.map((slide, idx) => (
          <button
            key={slide.shortName}
            type="button"
            aria-label={`Show ${slide.name}`}
            onClick={() => setI(idx)}
            className={`h-1.5 rounded-full transition-all ${
              idx === i
                ? "w-6 bg-primary"
                : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/60"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
import { useEffect, useRef, useState } from "react";
import { Camera, CameraOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  onResult: (text: string) => void;
  active: boolean;
  onStop?: () => void;
}

/**
 * Lightweight wrapper around html5-qrcode. The library is loaded dynamically
 * so it never runs during SSR.
 */
export function QrScanner({ onResult, active, onStop }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const scannerRef = useRef<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!active || !ref.current) return;
    let cancelled = false;
    let instance: any = null;

    (async () => {
      try {
        const mod = await import("html5-qrcode");
        if (cancelled || !ref.current) return;
        const containerId = "qr-reader-" + Math.random().toString(36).slice(2, 8);
        ref.current.id = containerId;
        instance = new mod.Html5Qrcode(containerId, { verbose: false });
        scannerRef.current = instance;
        await instance.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText: string) => onResult(decodedText),
          () => {},
        );
      } catch (err: any) {
        setError(err?.message ?? "Failed to start camera. Check permissions.");
      }
    })();

    return () => {
      cancelled = true;
      const s = scannerRef.current;
      scannerRef.current = null;
      if (s) {
        s.stop().then(() => s.clear()).catch(() => {});
      }
    };
  }, [active, onResult]);

  return (
    <div className="space-y-3">
      <div
        ref={ref}
        className="w-full max-w-sm mx-auto rounded-xl overflow-hidden bg-black/80 aspect-square grid place-items-center"
      >
        {!active && <Camera className="size-10 text-white/50" />}
      </div>
      {error && <div className="text-sm text-destructive text-center">{error}</div>}
      {active && onStop && (
        <div className="text-center">
          <Button variant="outline" size="sm" onClick={onStop}>
            <CameraOff className="size-4" /> Stop camera
          </Button>
        </div>
      )}
    </div>
  );
}

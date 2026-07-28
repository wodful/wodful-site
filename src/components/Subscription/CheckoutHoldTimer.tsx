import * as React from "react";

type CheckoutHoldTimerProps = {
  expiresAt: string;
  onExpire: () => void;
};

function formatRemaining(ms: number) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function CheckoutHoldTimer({
  expiresAt,
  onExpire,
}: CheckoutHoldTimerProps) {
  const expiresMs = React.useMemo(() => new Date(expiresAt).getTime(), [expiresAt]);
  const [remainingMs, setRemainingMs] = React.useState(() =>
    expiresMs - Date.now()
  );
  const expiredRef = React.useRef(false);

  React.useEffect(() => {
    expiredRef.current = false;
    const tick = () => {
      const next = expiresMs - Date.now();
      setRemainingMs(next);
      if (next <= 0 && !expiredRef.current) {
        expiredRef.current = true;
        onExpire();
      }
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [expiresMs, onExpire]);

  const urgent = remainingMs > 0 && remainingMs <= 5 * 60 * 1000;
  const expired = remainingMs <= 0;

  return (
    <div
      className={[
        "flex flex-wrap items-center justify-between gap-2 rounded-xl border px-4 py-3 text-sm",
        expired
          ? "border-red-200 bg-red-50 text-red-800"
          : urgent
            ? "border-amber-200 bg-amber-50 text-amber-900"
            : "border-slate-200 bg-slate-50 text-slate-700",
      ].join(" ")}
      role="timer"
      aria-live="polite"
      aria-atomic="true"
    >
      <span>
        {expired
          ? "Reserva expirada — a vaga foi liberada."
          : "Tempo para concluir o pagamento"}
      </span>
      <span
        className={[
          "font-semibold tabular-nums tracking-wide",
          expired ? "text-red-700" : urgent ? "text-amber-800" : "text-slate-900",
        ].join(" ")}
      >
        {expired ? "00:00" : formatRemaining(remainingMs)}
      </span>
    </div>
  );
}

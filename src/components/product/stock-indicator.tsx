import { stockLabel, stockState } from "@/lib/catalog";

const dot = {
  in_stock: "bg-success",
  low_stock: "bg-danger",
  sold_out: "border border-muted",
} as const;

export function StockIndicator({ quantity }: { quantity: number }) {
  const state = stockState(quantity);

  return (
    <p className={`flex items-center gap-2 ${state === "sold_out" ? "text-muted" : ""}`}>
      <span aria-hidden="true" className={`size-1.5 rounded-full ${dot[state]}`} />
      {stockLabel(quantity)}
    </p>
  );
}

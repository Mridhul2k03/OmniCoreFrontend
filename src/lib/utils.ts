export function cn(...classes: any[]) {
  return classes
    .flatMap((c) => {
      if (!c) return [];
      if (typeof c === "string") return [c];
      if (typeof c === "object") {
        return Object.entries(c)
          .filter(([_, active]) => Boolean(active))
          .map(([key]) => key);
      }
      return [];
    })
    .join(" ");
}

export function formatCurrency(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string | Date): string {
  try {
    const d = typeof dateString === "string" ? new Date(dateString) : dateString;
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return String(dateString);
  }
}

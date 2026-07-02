import { Car, Tags, MessageSquare, Mail, Clock, AlertCircle } from "lucide-react";

interface DashboardCardsProps {
  totalCars: number;
  totalCategories: number;
  totalReviews: number;
  totalMessages: number;
  pendingReviews: number;
  newMessages: number;
}

export default function DashboardCards({
  totalCars,
  totalCategories,
  totalReviews,
  totalMessages,
  pendingReviews,
  newMessages,
}: DashboardCardsProps) {
  const cards = [
    { label: "Total Cars", value: totalCars, icon: Car },
    { label: "Categories", value: totalCategories, icon: Tags },
    { label: "Approved Reviews", value: totalReviews, icon: MessageSquare },
    { label: "Total Messages", value: totalMessages, icon: Mail },
    { label: "Pending Reviews", value: pendingReviews, icon: Clock, accent: pendingReviews > 0 },
    { label: "New Messages", value: newMessages, icon: AlertCircle, accent: newMessages > 0 },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map((card) => (
        <div key={card.label} className="card-surface p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted">{card.label}</p>
            <card.icon className={`h-5 w-5 ${card.accent ? "text-brass-400" : "text-muted/50"}`} />
          </div>
          <p className="mt-3 font-display text-3xl font-bold text-ink">{card.value}</p>
        </div>
      ))}
    </div>
  );
}

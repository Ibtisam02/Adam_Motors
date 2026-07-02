import type { Metadata } from "next";
import Link from "next/link";
import { Car, MessageSquare, Mail, ArrowRight } from "lucide-react";
import DashboardCards from "@/components/DashboardCards";
import CarsByCategoryChart from "@/components/CarsByCategoryChart";
import MonthlyInquiriesChart from "@/components/MonthlyInquiriesChart";
import { getDashboardStats } from "@/actions/dashboard.actions";
import { formatPrice, formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin Dashboard" };
export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-ink sm:text-3xl">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted">An overview of your dealership&apos;s activity.</p>
      </div>

      <DashboardCards {...stats.cards} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card-surface p-5 sm:p-6">
          <h2 className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-brass-400">
            Cars by Category
          </h2>
          <div className="mt-4">
            <CarsByCategoryChart data={stats.charts.carsByCategory} />
          </div>
        </div>

        <div className="card-surface p-5 sm:p-6">
          <h2 className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-brass-400">
            Monthly Inquiries
          </h2>
          <div className="mt-4">
            <MonthlyInquiriesChart data={stats.charts.monthlyInquiries} />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="font-display text-lg font-semibold uppercase tracking-wide text-ink">
          Recent Activity
        </h2>

        <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Recent Cars */}
          <div className="card-surface p-5">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-ink">
                <Car className="h-4 w-4 text-brass-400" /> Recent Cars
              </h3>
              <Link href="/admin/cars" className="text-xs text-brass-400 hover:underline">
                View all
              </Link>
            </div>
            {stats.recentActivity.cars.length === 0 ? (
              <p className="mt-4 text-sm text-muted">No cars added yet.</p>
            ) : (
              <ul className="mt-3 space-y-3">
                {stats.recentActivity.cars.map((car: { _id: string; title: string; price: number; createdAt: string }) => (
                  <li key={car._id} className="flex items-center justify-between gap-2 text-sm">
                    <span className="line-clamp-1 text-ink/90">{car.title}</span>
                    <span className="shrink-0 text-brass-400">{formatPrice(car.price)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Recent Reviews */}
          <div className="card-surface p-5">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-ink">
                <MessageSquare className="h-4 w-4 text-brass-400" /> Recent Reviews
              </h3>
              <Link href="/admin/reviews" className="text-xs text-brass-400 hover:underline">
                View all
              </Link>
            </div>
            {stats.recentActivity.reviews.length === 0 ? (
              <p className="mt-4 text-sm text-muted">No reviews submitted yet.</p>
            ) : (
              <ul className="mt-3 space-y-3">
                {stats.recentActivity.reviews.map((review: { _id: string; reviewerName: string; carId?: { title: string }; approved: boolean }) => (
                  <li key={review._id} className="text-sm">
                    <p className="line-clamp-1 text-ink/90">
                      <span className="font-semibold">{review.reviewerName}</span>
                      {review.carId?.title ? ` on ${review.carId.title}` : ""}
                    </p>
                    <span className={`text-xs ${review.approved ? "text-emerald-400" : "text-brass-300"}`}>
                      {review.approved ? "Approved" : "Pending approval"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Recent Messages */}
          <div className="card-surface p-5">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-ink">
                <Mail className="h-4 w-4 text-brass-400" /> Recent Messages
              </h3>
              <Link href="/admin/messages" className="text-xs text-brass-400 hover:underline">
                View all
              </Link>
            </div>
            {stats.recentActivity.messages.length === 0 ? (
              <p className="mt-4 text-sm text-muted">No messages received yet.</p>
            ) : (
              <ul className="mt-3 space-y-3">
                {stats.recentActivity.messages.map((msg: { _id: string; name: string; status: string; createdAt: string }) => (
                  <li key={msg._id} className="flex items-center justify-between gap-2 text-sm">
                    <span className="line-clamp-1 text-ink/90">{msg.name}</span>
                    <span className="shrink-0 text-xs text-muted">{formatDate(msg.createdAt)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/admin/cars/new" className="btn-primary">
          Add New Car
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link href="/admin/categories" className="btn-outline">
          Manage Categories
        </Link>
      </div>
    </div>
  );
}

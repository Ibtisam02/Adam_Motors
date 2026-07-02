"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { EmptyChart } from "./CarsByCategoryChart";

interface MonthlyInquiriesChartProps {
  data: { month: string; count: number }[];
}

export default function MonthlyInquiriesChart({ data }: MonthlyInquiriesChartProps) {
  const hasData = data.some((d) => d.count > 0);

  if (!hasData) {
    return <EmptyChart message="No inquiries in the last 6 months yet." />;
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="inquiriesGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#D9A23C" stopOpacity={0.4} />
            <stop offset="100%" stopColor="#D9A23C" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#232A36" vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fill: "#9AA4B2", fontSize: 12 }}
          axisLine={{ stroke: "#232A36" }}
          tickLine={false}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fill: "#9AA4B2", fontSize: 12 }}
          axisLine={{ stroke: "#232A36" }}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{ background: "#181D26", border: "1px solid #232A36", borderRadius: 4 }}
          labelStyle={{ color: "#F4F1EB" }}
          itemStyle={{ color: "#D9A23C" }}
        />
        <Area
          type="monotone"
          dataKey="count"
          name="Inquiries"
          stroke="#D9A23C"
          fill="url(#inquiriesGradient)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

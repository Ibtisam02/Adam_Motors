"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";

interface CarsByCategoryChartProps {
  data: { name: string; count: number }[];
}

const COLORS = ["#D9A23C", "#E6B559", "#EFCD8A", "#C68A2C", "#A36F22", "#7E561B"];

export default function CarsByCategoryChart({ data }: CarsByCategoryChartProps) {
  if (data.length === 0) {
    return <EmptyChart message="No cars yet — add inventory to see this chart." />;
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#232A36" vertical={false} />
        <XAxis
          dataKey="name"
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
        <Bar dataKey="count" name="Cars" radius={[4, 4, 0, 0]}>
          {data.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex h-[280px] items-center justify-center rounded-md border border-dashed border-white/10 text-center text-sm text-muted">
      {message}
    </div>
  );
}

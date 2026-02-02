/**
 * BalanceChart Component
 * Line chart showing balance trends over time
 */

"use client";

import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { ChartDataPoint } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

interface BalanceChartProps {
  data: ChartDataPoint[];
  currency?: string;
  showArea?: boolean;
}

export default function BalanceChart({ data, currency = "USD", showArea = true }: BalanceChartProps) {
  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-dark-tertiary/95 backdrop-blur-xl border border-primary/30 rounded-lg p-3 shadow-xl"
      >
        <p className="text-gray-400 text-xs mb-1">{payload[0].payload.date}</p>
        <p className="text-white font-bold text-lg">
          {formatCurrency(payload[0].value, currency as any)}
        </p>
      </motion.div>
    );
  };

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#FF0000" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#FF0000" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.3} />

          <XAxis
            dataKey="date"
            stroke="#666"
            tick={{ fill: "#888", fontSize: 12 }}
            tickLine={false}
          />

          <YAxis
            stroke="#666"
            tick={{ fill: "#888", fontSize: 12 }}
            tickLine={false}
            tickFormatter={(value) => {
              if (value >= 1000000) {
                return `$${(value / 1000000).toFixed(1)}M`;
              } else if (value >= 1000) {
                return `$${(value / 1000).toFixed(1)}k`;
              } else {
                return `$${value.toFixed(0)}`;
              }
            }}
          />

          <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#FF0000", strokeWidth: 2 }} />

          {showArea ? (
            <Area
              type="monotone"
              dataKey="balance"
              stroke="#FF0000"
              strokeWidth={2}
              fill="url(#balanceGradient)"
              animationDuration={1000}
            />
          ) : (
            <Line
              type="monotone"
              dataKey="balance"
              stroke="#FF0000"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6, fill: "#FF0000" }}
              animationDuration={1000}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

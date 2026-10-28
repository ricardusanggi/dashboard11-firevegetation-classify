// path: frontend/src/pages/admin/TrainingMetricsChart.tsx

import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ResponsiveContainer
} from "recharts";

type MetricsData = {
  epoch: number[];
  train_loss: number[];
  val_loss: number[];
  train_acc: number[];
  val_acc: number[];
};

type Props = {
  data?: MetricsData | null;
};

export default function TrainingMetricsChart({ data }: Props) {
  if (!data || !data.epoch?.length) {
    return (
      <div className="flex items-center justify-center h-[320px] text-gray-400 text-sm">
        No training metrics available
      </div>
    );
  }

  const rows = useMemo(() => {
    return data.epoch.map((epoch, i) => ({
      epoch,

      train_loss: data.train_loss?.[i] ?? null,
      val_loss: data.val_loss?.[i] ?? null,

      train_acc: data.train_acc?.[i] ?? null,
      val_acc: data.val_acc?.[i] ?? null
    }));
  }, [data]);

  return (
    <div className="space-y-8">
      {/* LOSS CURVE */}

      <div className="w-full h-[320px]">
        <h3 className="text-sm font-semibold mb-2 text-gray-700">Training Loss</h3>

        <ResponsiveContainer>
          <LineChart data={rows}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="epoch" />

            <YAxis />

            <Tooltip />

            <Legend />

            <Line
              type="monotone"
              dataKey="train_loss"
              stroke="#6366f1"
              name="Train Loss"
              strokeWidth={2}
              dot={false}
            />

            <Line
              type="monotone"
              dataKey="val_loss"
              stroke="#22c55e"
              name="Validation Loss"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ACCURACY CURVE */}

      <div className="w-full h-[320px]">
        <h3 className="text-sm font-semibold mb-2 text-gray-700">Training Accuracy</h3>

        <ResponsiveContainer>
          <LineChart data={rows}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="epoch" />

            <YAxis domain={[0, 1]} />

            <Tooltip />

            <Legend />

            <Line
              type="monotone"
              dataKey="train_acc"
              stroke="#f97316"
              name="Train Accuracy"
              strokeWidth={2}
              dot={false}
            />

            <Line
              type="monotone"
              dataKey="val_acc"
              stroke="#06b6d4"
              name="Validation Accuracy"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

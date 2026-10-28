import React, { useState, useEffect, useMemo } from "react";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer
} from "recharts";

import { ChevronDown } from "lucide-react";

import MetricCard from "./MetricCard";
import ConfigItem from "./ConfigItem";

export default function PerformanceSection({ metrics, datasetInfo, loading }: any) {

  const [openConfig, setOpenConfig] = useState(false);
  const [showChart, setShowChart] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowChart(true), 300);
    return () => clearTimeout(timer);
  }, []);

  /* ========================
     METRIC DATA
  ======================== */

  const radarData = [
    { metric: "Accuracy", value: (metrics?.accuracy ?? 0) * 100 },
    { metric: "Precision", value: (metrics?.precision ?? 0) * 100 },
    { metric: "Recall", value: (metrics?.recall ?? 0) * 100 },
    { metric: "F1 Score", value: (metrics?.f1 ?? 0) * 100 }
  ];

  /* ========================
     TRAINING & DATASET
  ======================== */

  const training = datasetInfo?.training || {};
  const dataset = datasetInfo?.dataset || {};

  const architectureName =
    training?.architecture
      ?.replaceAll("_", "")
      .replace(/\b\w/g, c => c.toUpperCase()) ?? "-"

  const totalDataset = useMemo(() => {

    const dist = dataset?.class_distribution || {};

    return Object.values(dist).reduce(
      (acc: number, v: any) => acc + Number(v),
      0
    );

  }, [dataset]);

  if (loading || !metrics) return null;

  return (

    <section className="py-24 px-6 bg-gray-50 dark:bg-slate-900">

      <div className="max-w-6xl mx-auto">

        {/* TITLE */}

        <div className="text-center mb-12">

          <h2 className="text-3xl md:text-4xl font-bold">
            Performa Model
          </h2>

          <p className="text-gray-500 mt-4 max-w-2xl mx-auto leading-relaxed">

            Evaluasi performa model dilakukan menggunakan metrik klasifikasi
            standar yang umum digunakan dalam penelitian pembelajaran mesin.
            Metrik ini digunakan untuk mengukur kemampuan model dalam mengenali
            pola visual pada citra jenis vegetasi serta menilai tingkat
            akurasi prediksi yang dihasilkan oleh sistem.

          </p>

        </div>

        {/* METRIC CARD */}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-14">

          <MetricCard label="Accuracy" value={(metrics?.accuracy ?? 0) * 100} />
          <MetricCard label="Precision" value={(metrics?.precision ?? 0) * 100} />
          <MetricCard label="Recall" value={(metrics?.recall ?? 0) * 100} />
          <MetricCard label="F1 Score" value={(metrics?.f1 ?? 0) * 100} />

        </div>

        {/* RADAR CHART */}

        {showChart && (

          <div className="max-w-lg mx-auto h-[320px]">

            <ResponsiveContainer>

              <RadarChart data={radarData}>

                <PolarGrid />

                <PolarAngleAxis dataKey="metric" />

                <Radar
                  dataKey="value"
                  stroke="#f59e0b"
                  fill="#f59e0b"
                  fillOpacity={0.45}
                />

              </RadarChart>

            </ResponsiveContainer>

          </div>

        )}

        {/* CONFIGURATION */}

        <div className="max-w-3xl mx-auto mt-16">

          <button
            onClick={() => setOpenConfig(!openConfig)}
            className="w-full flex items-center justify-between py-4 border-b"
          >

            <span className="font-semibold text-lg">
              Detail Konfigurasi Model
            </span>

            <ChevronDown
              className={`transition ${openConfig ? "rotate-180" : ""}`}
            />

          </button>

          {openConfig && (

            <div className="mt-8 space-y-8">

              {/* TRAINING PARAMETER */}

              <div>

                <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-4">
                  Parameter Pelatihan Model
                </h3>

                <div className="grid md:grid-cols-2 gap-x-16 gap-y-3 text-sm">

                  <ConfigItem label="Arsitektur Model" value={architectureName} />
                  <ConfigItem label="Epoch Pelatihan" value={training?.epochs} />

                  <ConfigItem label="Batch Size" value={training?.batch_size} />
                  <ConfigItem label="Learning Rate" value={training?.learning_rate} />

                  <ConfigItem label="Optimizer" value={training?.optimizer} />
                  <ConfigItem label="Loss Function" value={training?.loss_function} />

                  <ConfigItem label="Validation Split" value={training?.val_split} />
                  <ConfigItem label="Perangkat Komputasi" value={training?.device} />

                </div>

              </div>

              {/* DATASET INFORMATION */}

              <div>

                <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-4">
                  Informasi Dataset Pelatihan
                </h3>

                <div className="grid md:grid-cols-2 gap-x-16 gap-y-3 text-sm">

                  <ConfigItem label="Jumlah Kelas Dataset" value={dataset?.num_classes} />
                  <ConfigItem label="Total Data Pelatihan" value={totalDataset} />

                  <ConfigItem label="Lokasi Dataset" value={dataset?.path} />
                  <ConfigItem label="Rasio Ketidakseimbangan Data" value={dataset?.imbalance_ratio?.toFixed?.(2)} />

                </div>

              </div>

            </div>

          )}

        </div>

      </div>

    </section>

  );

}
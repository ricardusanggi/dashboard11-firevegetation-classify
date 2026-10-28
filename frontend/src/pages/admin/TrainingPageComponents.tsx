// path: frontend/src/pages/admin/TrainingPageComponents.tsx

import { memo, useEffect, useState } from "react";
import Spinner from "../../components/Spinner";
import TrainingMetricsChart from "./TrainingMetricsChart";
import { getTrainingMetrics } from "../../api/adminTraining";

import type {
  TrainingJob,
  PreviewSample,
  PreviewModalProps,
  LabelPreviewSectionProps,
  LabelStats,
  StatBadgeProps,
  MetricsData
} from "./types/trainingTypes";


/* ================= STATUS BADGE ================= */

type Status = "running" | "pending" | "approved" | "rejected";

export const StatusBadge = memo(function StatusBadge({ status }: { status: Status }) {
  const styles: Record<Status, string> = {
    running: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    approved: "bg-cyan-100 text-cyan-700",
    rejected: "bg-red-100 text-red-700"
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs ${styles[status]}`}>
      {status}
    </span>
  );
});


/* ================= PARAM BADGE ================= */

export const ParamsBadge = memo(function ParamsBadge({ job }: { job: TrainingJob }) {
  const p: any = job.params ?? job;

  return (
    <div className="text-[11px] space-y-1 text-left">
      <div>
        🌱 Epochs: <b>{p.epochs}</b>
      </div>

      <div>
        📦 Batch: <b>{p.batch_size}</b>
      </div>

      <div>
        ⚡ LR: <b>{p.learning_rate}</b>
      </div>

      <div>
        🧠 Opt: <b>{p.optimizer}</b>
      </div>

      <div>
        🧪 Loss: <b>{p.loss_function}</b>
      </div>

      <div>
        🔀 Aug:
        <span
          className={`ml-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${
            p.augmentation
              ? "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300"
              : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
          }`}
        >
          {p.augmentation ? "ON" : "OFF"}
        </span>
      </div>

      <div>
        📊 Val: <b>{p.val_split}</b>
      </div>

      {/* ================= PSO ================= */}

      {p.use_pso && (
        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 space-y-1">
          <div className="px-2 py-0.5 rounded bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 text-[10px] font-semibold w-fit">
            ⚙ PSO Enabled
          </div>

          <div>
            👥 Pop: <b>{p.pso_population}</b>
          </div>

          <div>
            🔁 Iter: <b>{p.pso_iters}</b>
          </div>

          {p.pso_best_score && (
            <div className="text-purple-600 dark:text-purple-300 font-semibold">
              ⭐ Best Score: {Number(p.pso_best_score).toFixed(4)}
            </div>
          )}
        </div>
      )}
    </div>
  );
});


/* ================= METRICS TABLE ================= */

function format3(v?: number | null) {
  return v !== undefined && v !== null ? v.toFixed(3) : "-";
}

export const MetricsTable = memo(function MetricsTable({ job }: { job: TrainingJob }) {
  return (
    <table className="text-xs mx-auto">
      <tbody>
        <tr>
          <td>Train Loss</td>
          <td>{format3(job.best_train_loss)}</td>
        </tr>
        <tr>
          <td>Val Loss</td>
          <td>{format3(job.best_val_loss)}</td>
        </tr>
        <tr>
          <td>Accuracy</td>
          <td>{format3(job.accuracy)}</td>
        </tr>
        <tr>
          <td>Precision</td>
          <td>{format3(job.precision)}</td>
        </tr>
        <tr>
          <td>Recall</td>
          <td>{format3(job.recall)}</td>
        </tr>
        <tr>
          <td>F1</td>
          <td>{format3(job.f1)}</td>
        </tr>
      </tbody>
    </table>
  );
});


/* ================= PREVIEW MODAL ================= */

export function PreviewModal({ job, data, loading, onClose }: PreviewModalProps) {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loadingMetrics, setLoadingMetrics] = useState(false);

  useEffect(() => {
    if (!job?.id) return;

    setLoadingMetrics(true);

    getTrainingMetrics(job.id)
      .then(setMetrics)
      .catch(() => {})
      .finally(() => setLoadingMetrics(false));

  }, [job]);

  if (loading || !data) {
    return (
      <ModalWrapper>
        <Spinner />
      </ModalWrapper>
    );
  }

  if (!data.samples?.length) {
    return (
      <ModalWrapper>
        <EmptyPreview onClose={onClose} />
      </ModalWrapper>
    );
  }

  const grouped = groupSamplesByLabel(data.samples);

  return (
    <ModalWrapper>
      <div className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 rounded-xl w-full max-w-6xl p-6 max-h-[90vh] overflow-y-auto">

        <div className="flex justify-between items-center mb-6">
          <h2 className="font-bold text-lg">
            Preview Training Job #{job.id}
          </h2>

          <button onClick={onClose}>✖</button>
        </div>

        {Object.entries(grouped).map(([label, samples]) => {
          const stats = calculateLabelStats(samples);

          const uncertaintyWarning =
            stats.accuracy < 0.6 ||
            (stats.avgConfidence > 0.8 && stats.accuracy < 0.7);

          return (
            <LabelPreviewSection
              key={label}
              label={label}
              samples={samples}
              stats={stats}
              warning={uncertaintyWarning}
            />
          );
        })}

        {metrics && (
          <div className="mt-10">
            <h3 className="font-semibold text-lg mb-3">
              📊 Training Curves
            </h3>

            {loadingMetrics
              ? <Spinner />
              : <TrainingMetricsChart data={metrics} />}
          </div>
        )}

      </div>
    </ModalWrapper>
  );
}

/* ================= MODAL WRAPPER ================= */

function ModalWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      {children}
    </div>
  );
}

/* ================= EMPTY PREVIEW ================= */

function EmptyPreview({ onClose }: { onClose: () => void }) {
  return (
    <div className="bg-white p-6 rounded-lg">
      <p className="text-gray-500">Tidak ada data preview</p>
      <button className="mt-4 px-4 py-2 bg-gray-200 rounded" onClick={onClose}>
        Tutup
      </button>
    </div>
  );
}

/* ================= LABEL PREVIEW ================= */

function LabelPreviewSection({
  label,
  samples,
  stats,
  warning
}: LabelPreviewSectionProps) {
  return (
    <div className="mb-12">
      <div className="flex flex-wrap items-center gap-3 mb-2">
        <h3 className="text-lg font-semibold">
          Label: <span className="text-green-700">{label}</span>
        </h3>
        <StatBadge value={stats.accuracy} label="Accuracy" />
        <StatBadge value={stats.avgConfidence} label="Avg Conf" />
        {warning && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-red-200 text-red-800 font-semibold">
            ⚠ Uncertainty Warning
          </span>
        )}
      </div>
      <p className="text-xs text-gray-500 mb-4">
        {stats.correct} benar dari {stats.total} sampel
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {samples.slice(0, 5).map((s: PreviewSample, i: number) => (
          <PredictionCard key={`${label}-${i}`} sample={s} />
        ))}
      </div>
    </div>
  );
}

/* ================= PREDICTION CARD ================= */

function PredictionCard({ sample }: { sample: PreviewSample }) {
  const correct = sample.true_label === sample.predicted_label;
  const highConfidenceError = !correct && sample.confidence >= 0.8;

  return (
    <div
      className={`border rounded-xl p-4 shadow-sm relative ${highConfidenceError ? "border-red-600 bg-red-100" : correct ? "border-cyan-400 bg-cyan-50" : "border-red-400 bg-red-50"}`}
    >
      {highConfidenceError && (
        <div className="absolute top-2 right-2 text-[10px] px-2 py-0.5 rounded bg-red-600 text-white font-bold">
          ⚠ Overconfident Error
        </div>
      )}
      <img
        loading="lazy"
        decoding="async"
        src={`data:image/jpeg;base64,${sample.image_base64}`}
        className="rounded-lg mb-3 mx-auto max-h-40 object-contain"
      />
      <div className="text-xs mb-1">
        <b>True:</b> {sample.true_label}
      </div>
      <div className="text-xs mb-1">
        <b>Pred:</b>{" "}
        <span
          className={
            correct ? "text-cyan-700 font-semibold" : "text-red-700 font-semibold"
          }
        >
          {sample.predicted_label}
        </span>
      </div>
      <div className="text-[11px] text-gray-600">
        Confidence {(sample.confidence * 100).toFixed(3)}%
      </div>
      <div
        className={`mt-2 text-[11px] font-semibold text-center rounded py-0.5 ${correct ? "bg-cyan-200 text-cyan-800" : "bg-red-200 text-red-800"}`}
      >
        {correct ? "Prediction Correct" : "Prediction Incorrect"}
      </div>
    </div>
  );
}

/* ================= STAT BADGE ================= */

function StatBadge({ value, label }: StatBadgeProps) {
  const color =
    value >= 0.8
      ? "bg-cyan-100 text-cyan-700"
      : value >= 0.6
        ? "bg-yellow-100 text-yellow-700"
        : "bg-red-100 text-red-700";
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${color}`}>
      {label} {(value * 100).toFixed(2)}%
    </span>
  );
}

/* ================= HELPERS ================= */

function groupSamplesByLabel(samples: PreviewSample[]) {
  const grouped: Record<string, PreviewSample[]> = {};
  samples.forEach((s) => {
    if (!grouped[s.true_label]) grouped[s.true_label] = [];
    grouped[s.true_label].push(s);
  });
  return grouped;
}

function calculateLabelStats(samples: PreviewSample[]) {
  const total = samples.length;
  const correct = samples.filter((s) => s.true_label === s.predicted_label).length;
  const avgConfidence = total
  ? samples.reduce((sum,s)=>sum+s.confidence,0)/total
  : 0
  return { total, correct, accuracy: correct / total, avgConfidence };
}

/* ================= INPUT CONTROL ================= */

type ControlInputProps = {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  step?: number;
};

export function ControlInput({ label, value, onChange, min, step }: ControlInputProps) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-semibold mb-1">{label}</label>
      <input
        type="number"
        value={value}
        min={min}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500"
      />
    </div>
  );
}

/* ================= SELECT CONTROL ================= */

type ControlSelectProps = {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
};

export function ControlSelect({ label, value, options, onChange }: ControlSelectProps) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-semibold mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

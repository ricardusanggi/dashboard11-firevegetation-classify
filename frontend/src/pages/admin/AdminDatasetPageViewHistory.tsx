// src/pages/admin/AdminDatasetPageViewHistory.tsx

import Card from "../../components/ui/Card";
import Spinner from "../../components/Spinner";
import type {
  UserEntry,
  TrainStats,
  PreviewItem,
  DatasetStatus
} from "./types/datasetTypes";

type Props = {
  history: UserEntry[];
  loading: boolean;
  trainStats: TrainStats;
  previewItems: PreviewItem[];
  previewLoading: boolean;
  showTrainPreview: boolean;
  onToggleTrainPreview: () => void;
  setSelectedClasses: (v: string[]) => void;
  setShowClassModal: (v: boolean) => void;
  setShowTrainModal: (v: boolean) => void;
};

/* ================= STATUS BADGE ================= */

function StatusBadge({ status }: { status: DatasetStatus }) {
  const style: Record<DatasetStatus, string> = {
    pending:
      "bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-300",
    approved:
      "bg-cyan-100 text-cyan-700 border-cyan-300 dark:bg-cyan-900 dark:text-cyan-300",
    rejected:
      "bg-red-100 text-red-700 border-red-300 dark:bg-red-900 dark:text-red-300",
    cancelled:
      "bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300"
  };

  return (
    <span
      className={`px-3 py-1 rounded-full border text-xs font-semibold ${style[status]}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

/* ================= STAT CARD ================= */

function Stat({
  label,
  value,
  color
}: {
  label: string;
  value: number;
  color: "blue" | "green" | "red" | "yellow" | "purple";
}) {
  const styles = {
    blue: {
      bg: "bg-blue-50 dark:bg-blue-900/40",
      text: "text-blue-700 dark:text-blue-300"
    },
    green: {
      bg: "bg-green-50 dark:bg-green-900/40",
      text: "text-green-700 dark:text-green-300"
    },
    red: {
      bg: "bg-red-50 dark:bg-red-900/40",
      text: "text-red-700 dark:text-red-300"
    },
    yellow: {
      bg: "bg-yellow-50 dark:bg-yellow-900/40",
      text: "text-yellow-700 dark:text-yellow-300"
    },
    purple: {
      bg: "bg-purple-50 dark:bg-purple-900/40",
      text: "text-purple-700 dark:text-purple-300"
    }
  };

  return (
    <div
      className={`
      p-5
      rounded-xl
      shadow-sm
      hover:shadow-md
      transition
      flex
      flex-col
      items-center
      justify-center
      text-center
      ${styles[color].bg}
    `}
    >
      <div className="text-xs font-medium text-gray-600 dark:text-gray-300">
        {label}
      </div>

      <div
        className={`text-3xl font-bold tabular-nums mt-1 ${styles[color].text}`}
      >
        {value.toLocaleString()}
      </div>
    </div>
  );
}

/* ================= CLASS DISTRIBUTION CHART ================= */

function ClassDistributionChart({
  data
}: {
  data: Record<string, number> | undefined;
}) {
  if (!data || Object.keys(data).length === 0) return null;

  const entries = Object.entries(data);
  const max = Math.max(...entries.map((e) => e[1]));

  return (
    <div className="mt-6">
      <div className="text-sm font-semibold mb-3">📊 Distribusi Kelas</div>

      <div className="space-y-2">
        {entries.map(([label, count]) => {
          const width = (count / max) * 100;

          return (
            <div key={label}>
              <div className="flex justify-between text-xs mb-1">
                <span>{label}</span>
                <span>{count}</span>
              </div>

              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded">
                <div
                  className="h-2 bg-blue-500 rounded"
                  style={{ width: `${width}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ================= PAGE ================= */

export default function AdminDatasetPageViewHistory({
  history,
  loading,
  trainStats,
  previewItems,
  previewLoading,
  showTrainPreview,
  onToggleTrainPreview,
  setSelectedClasses,
  setShowClassModal,
  setShowTrainModal
}: Props) {
  const totalUploads = history.length;
  const approvedCount = history.filter((h) => h.status === "approved").length;
  const rejectedCount = history.filter((h) => h.status === "rejected").length;
  const pendingCount = history.filter((h) => h.status === "pending").length;
  const readyToMerge = history.filter((h) => h.status === "merged").length;;

  if (loading) {
    return (
      <Card className="p-6 dark:bg-gray-900 dark:border-gray-700">
        <Spinner />
      </Card>
    );
  }

  return (
    <Card className="p-6 dark:bg-gray-900 dark:border-gray-700">

      {/* ================= DATASET SUMMARY ================= */}

      <div className="grid grid-cols-2 md:grid-cols-7 gap-5 mb-6">
        <Stat label="Total Upload" value={totalUploads} color="blue" />
        <Stat label="Approved" value={approvedCount} color="green" />
        <Stat label="Rejected" value={rejectedCount} color="red" />
        <Stat label="Pending" value={pendingCount} color="yellow" />
        <Stat label="Merged" value={readyToMerge} color="purple" />
        {/* TRAIN DATASET CARD */}

        <div
          className={`
          col-span-2
          p-5
          rounded-xl
          border
          shadow-sm
          hover:shadow-md
          transition
          flex
          flex-col
          items-center
          justify-center
          text-center
          ${
            trainStats?.is_synced
              ? "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/40 dark:to-emerald-900/30 border-green-200"
              : "bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/40 dark:to-rose-900/30 border-red-300"
          }
        `}
        >
          <div className="text-xs font-medium text-gray-600 dark:text-gray-300">
            Total Dataset Pelatihan
          </div>

          <button
            onClick={onToggleTrainPreview}
            className={`
            text-3xl
            font-bold
            tabular-nums
            mt-1
            hover:underline
            ${
              trainStats?.is_synced
                ? "text-green-700 dark:text-green-300"
                : "text-red-600 dark:text-red-400"
            }
          `}
          >
            {(trainStats?.total_images ?? 0).toLocaleString()}
          </button>

          <div className="text-xs text-gray-500 mt-1">
            <button
              onClick={() => setShowTrainModal(true)}
              className="hover:underline text-purple-600 dark:text-purple-400"
            >
              {trainStats?.num_classes ?? 0} label
            </button>
          </div>
        </div>
      </div>

      {/* ================= DATASET HEALTH WARNINGS ================= */}

      {(trainStats?.is_synced === false ||
        trainStats?.dataset_health?.imbalance_warning ||
        trainStats?.dataset_health?.missing_classes?.length > 0 ||
        trainStats?.dataset_health?.drift_warning ||
        trainStats?.dataset_health?.underrepresented_classes?.length > 0 ||
        trainStats?.duplicate_count > 0) && (
        <div
          className="
          mb-6
          p-4
          rounded-xl
          border
          shadow-sm
          bg-gradient-to-r
          from-green-50
          to-orange-50
          border-green-200
          dark:from-green-900/30
          dark:to-orange-900/20
          dark:border-green-800
          space-y-1
          text-sm
        "
        >
          <div className="font-semibold text-green-700 dark:text-green-300">
            Peringatan Kesehatan Dataset
          </div>

          {trainStats?.is_synced === false && (
            <div className="text-red-600 dark:text-red-400">
              ⚠ Folder ({trainStats.folder_total}) ≠ Database ({trainStats.database_total})
            </div>
          )}

          {trainStats?.dataset_health?.imbalance_warning && (
            <div className="text-orange-600 dark:text-orange-400">
              ⚠ Ketidakseimbangan dataset {trainStats.dataset_health.imbalance_ratio}
            </div>
          )}

          {trainStats?.dataset_health?.missing_classes?.length > 0 && (
            <div className="text-red-600 dark:text-red-400">
              ⚠ Label hilang: {trainStats.dataset_health.missing_classes.join(", ")}
            </div>
          )}

          {trainStats?.dataset_health?.drift_warning && (
            <div className="text-yellow-600 dark:text-yellow-400">
              🚨 Drift dataset terdeteksi
            </div>
          )}

          {trainStats?.dataset_health?.underrepresented_classes?.length > 0 && (
            <div className="text-yellow-700 dark:text-yellow-400">
              📉 Label kurang representatif:{" "}
              {trainStats.dataset_health.underrepresented_classes.join(", ")}
            </div>
          )}

          {trainStats?.duplicate_count > 0 && (
            <div className="text-red-600 dark:text-red-400">
              🔍 Gambar duplikat terdeteksi: {trainStats.duplicate_count}
            </div>
          )}
        </div>
      )}

      {/* ================= TRAIN DATASET PREVIEW ================= */}

      {showTrainPreview && (
        <div className="mb-8 border rounded-2xl p-6 shadow-sm dark:border-gray-700 bg-white dark:bg-gray-900">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-green-600 dark:text-green-400">
              📂 Preview Dataset Pelatihan
            </h3>

            <button
              onClick={onToggleTrainPreview}
              className="text-sm px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded"
            >
              Tutup
            </button>
          </div>

          {previewLoading && <Spinner />}

          {!previewLoading && previewItems.length === 0 && (
            <p className="text-sm text-gray-500">Tidak ada data preview.</p>
          )}

          {!previewLoading &&
            previewItems.map((group) => (
              <div key={group.label} className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <div className="font-semibold text-gray-700 dark:text-gray-200">
                    {group.label}
                  </div>

                  <div className="text-xs bg-blue-100 dark:bg-blue-900 px-3 py-1 rounded-full">
                    {group.total_images} Citra
                  </div>
                </div>

                <div
                  className="grid gap-3"
                  style={{ gridTemplateColumns: "repeat(auto-fill,minmax(110px,1fr))" }}
                >
                  {group.images.map((img) => (
                    <div
                      key={img.filename}
                      className="
                      border
                      rounded-xl
                      overflow-hidden
                      dark:border-gray-700
                      shadow-sm
                      hover:shadow-lg
                      transition
                    "
                    >
                      <img
                        src={`data:image/jpeg;base64,${img.image_base64}`}
                        alt={img.filename}
                        className="w-full aspect-square object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}

          <ClassDistributionChart data={trainStats?.per_class} />
        </div>
      )}

      {/* ================= DATASET HISTORY TABLE ================= */}

      <div className="overflow-x-auto rounded-lg border dark:border-gray-700">
        <table className="w-full text-sm text-left dark:text-gray-200">
          <thead
            className="
            bg-gradient-to-r
            from-gray-100
            to-gray-200
            dark:from-gray-800
            dark:to-gray-900
            sticky
            top-0
            z-10
          "
          >
            <tr>
              <th className="p-3 font-semibold">ID</th>
              <th className="p-3 font-semibold">Status</th>
              <th className="p-3 font-semibold">Uploader</th>
              <th className="p-3 font-semibold">Reviewer</th>
              <th className="p-3 font-semibold text-right">Citra</th>
              <th className="p-3 font-semibold text-right">Label</th>
              <th className="p-3 font-semibold text-right">Upload #</th>
              <th className="p-3 font-semibold">Waktu</th>
            </tr>
          </thead>

          <tbody>
            {history.length === 0 && (
              <tr>
                <td colSpan={8} className="p-6 text-center text-gray-500">
                  Tidak ada data riwayat dataset.
                </td>
              </tr>
            )}

            {history.map((h, index) => (
              <tr
                key={h.id}
                className={`border-t dark:border-gray-700 ${
                  index % 2 === 0
                    ? "bg-white dark:bg-gray-900"
                    : "bg-gray-50 dark:bg-gray-800"
                } hover:bg-cyan-50 dark:hover:bg-cyan-900/20 transition`}
              >
                <td className="p-3 font-medium">{h.id}</td>

                <td className="p-3">
                  <StatusBadge status={h.status} />
                </td>

                <td className="p-3">{h.uploader_name}</td>

                <td className="p-3">{h.reviewer_name ?? "-"}</td>

                <td className="p-3 text-right font-semibold tabular-nums">
                  {h.total_images.toLocaleString()}
                </td>

                <td className="p-3 text-right">
                  <button
                    onClick={() => {
                      setSelectedClasses(h.class_names || []);
                      setShowClassModal(true);
                    }}
                    className="text-purple-600 dark:text-purple-400 hover:underline"
                  >
                    {h.num_classes}
                  </button>
                </td>

                <td className="p-3 text-right tabular-nums">{h.upload_number}</td>

                <td className="p-3 text-xs text-gray-500">
                  {new Date(h.upload_time).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </Card>
  );
}
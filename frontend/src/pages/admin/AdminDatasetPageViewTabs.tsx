// src/pages/admin/AdminDatasetPageViewTabs.tsx

import { UploadCloud, Clock, Database, Search } from "lucide-react";

type Props = {
  tab: "history" | "upload" | "pending" | "merge";
  setTab: (tab: "history" | "upload" | "pending" | "merge") => void;
  search: string;
  onSearch: (text: string) => void;
};

export default function AdminDatasetPageViewTabs({
  tab,
  setTab,
  search,
  onSearch
}: Props) {
  return (
    <div className="flex gap-3 mb-6 border-b pb-3 dark:border-gray-700">
      {[
        { key: "history", label: "Riwayat Dataset", icon: Clock },
        { key: "upload", label: "Upload Dataset", icon: UploadCloud },
        { key: "pending", label: "Review Dataset", icon: Database },
        { key: "merge", label: "Merge Test → Train", icon: Database }
      ].map((t) => (
        <button
          key={t.key}
          onClick={() => setTab(t.key as any)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition
            ${
              tab === t.key
                ? "bg-green-600 text-white shadow-md"
                : "bg-gray-100 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
        >
          <t.icon size={16} />
          {t.label}
        </button>
      ))}

      {tab === "history" && (
        <div className="ml-auto flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-full">
          <Search size={16} className="text-gray-400" />
          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Cari dataset..."
            className="bg-transparent outline-none dark:text-gray-200"
          />
        </div>
      )}
    </div>
  );
}
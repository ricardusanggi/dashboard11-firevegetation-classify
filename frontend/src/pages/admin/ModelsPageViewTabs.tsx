import { Activity, UploadCloud, List, RotateCcw, Search } from "lucide-react";

type Props = {
  tab: "active" | "upload" | "list" | "version";
  setTab: (v: "active" | "upload" | "list" | "version") => void;
  search: string;
  onSearch: (v: string) => void;
};

export default function ModelsPageViewTabs({
  tab,
  setTab,
  search,
  onSearch
}: Props) {

  const tabs = [
    { key: "active", label: "Model Aktif", icon: Activity },
    { key: "upload", label: "Upload Model", icon: UploadCloud },
    { key: "list", label: "Daftar Model", icon: List },
    { key: "version", label: "Kontrol Versi", icon: RotateCcw }
  ];

  return (
    <div className="flex gap-3 mb-6 border-b pb-3 dark:border-gray-700">

      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => setTab(t.key as any)}
          className={`
            px-4 py-2 rounded-full font-semibold transition
            ${
              tab === t.key
                ? "bg-green-600 text-white shadow-md"
                : "bg-gray-100 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }
          `}
        >
          <div className="flex items-center gap-2">
            <t.icon size={16} />
            {t.label}
          </div>
        </button>
      ))}

      {tab === "list" && (
        <div className="ml-auto flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-full">
          <Search size={16} className="text-gray-400" />
          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Cari model..."
            className="bg-transparent outline-none dark:text-gray-200"
          />
        </div>
      )}

    </div>
  );
}
// frontend/src/pages/user/DashboardUserViewDataset.tsx

import { useRef } from "react";
import Section from "../../components/ui/Section";
import Card from "../../components/ui/Card";
import { UploadCloud, ChevronDown, Clock } from "lucide-react";

type Props = {
  hasPending?: boolean;
  selectedFile: File | null;
  uploading: boolean;
  progress?: number;
  onSelectFile: (file: File | null) => void;
  onUpload: () => void;
};

export default function DashboardUserViewDataset({
  hasPending = false,
  selectedFile,
  uploading,
  progress = 0,
  onSelectFile,
  onUpload
}: Props) {

  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ================= VALIDASI FILE ================= */

  function validateFile(file: File | null) {

    if (!file) {
      onSelectFile(null);
      return;
    }

    const isZip =
      file.name.toLowerCase().endsWith(".zip") ||
      file.type === "application/zip" ||
      file.type === "application/x-zip-compressed";

    if (!isZip) {
      alert("File harus berformat .zip");
      return;
    }

    const maxSize = 1024 * 1024 * 1024;

    if (file.size > maxSize) {
      alert("Ukuran file maksimal 1GB");
      return;
    }

    onSelectFile(file);
  }

  /* ================= DRAG DROP ================= */

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {

    e.preventDefault();

    if (hasPending) return;

    const file = e.dataTransfer.files?.[0];

    validateFile(file || null);
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
  }

  function handleClick() {

    if (hasPending) return;

    fileInputRef.current?.click();
  }

  return (

    <Section title="📦 Upload Dataset Vegetasi">

      <Card className="p-6 shadow-lg border border-gray-200 dark:border-gray-800 dark:bg-gray-900">

        {/* ================= PETUNJUK ================= */}

        <details className="mb-6 group rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">

          <summary className="cursor-pointer list-none p-4 flex justify-between items-center font-semibold text-green-700 dark:text-green-300">

            <span>📘 Petunjuk Upload Dataset Vegetasi</span>

            <ChevronDown
              size={18}
              className="transition group-open:rotate-180"
            />

          </summary>

          <div className="px-5 pb-5">

            <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2 list-disc ml-5">
              <li>File harus dalam format <b>.zip</b></li>
              <li>Struktur folder wajib seperti berikut:</li>
            </ul>

            <div className="mt-3 p-3 rounded-lg bg-white dark:bg-gray-800 border dark:border-gray-700 text-xs font-mono text-gray-700 dark:text-gray-300">
              dataset/
              <br />
              ├── herba/
              <br />
              │ ├── img1.jpg
              <br />
              ├── pohon/
              <br />
              │ ├── img1.jpg
            </div>

            <ul className="mt-3 text-sm text-gray-700 dark:text-gray-300 space-y-2 list-disc ml-5">
              <li>Setiap folder merepresentasikan <b>1 kelas vegetasi</b></li>
              <li>Minimal 1 gambar per folder</li>
              <li>Format gambar: <b>.jpg, .jpeg, .png</b></li>
            </ul>

          </div>

        </details>

        {/* ================= STATUS DATASET PENDING ================= */}

        {hasPending ? (

          <div className="p-6 rounded-xl bg-yellow-50 border border-yellow-300 text-yellow-800 text-sm dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-300 flex items-start gap-3">

            <Clock size={18} className="mt-1"/>

            <div>

              <div className="font-semibold text-base">
                Dataset Sedang Direview Admin
              </div>

              <p className="text-xs mt-2 leading-relaxed">

                Dataset yang Anda upload sedang dalam proses
                <b> verifikasi oleh administrator</b>.

                <br/><br/>

                Selama proses review berlangsung,
                Anda <b>tidak dapat mengupload dataset baru</b>.

                <br/><br/>

                Silakan tunggu hingga dataset Anda
                <b> disetujui atau ditolak oleh admin</b>.

              </p>

            </div>

          </div>

        ) : (

          <>

          {/* ================= UPLOAD AREA ================= */}

          <label className="font-semibold text-gray-800 dark:text-gray-200 mb-2 block">
            Upload Dataset Vegetasi (.zip)
          </label>

          {!selectedFile ? (

            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={handleClick}
              className="border-2 border-dashed rounded-xl p-6 text-center transition cursor-pointer border-gray-300 hover:border-green-500 dark:border-gray-700 dark:hover:border-green-500"
            >

              <UploadCloud
                size={28}
                className="mx-auto text-gray-400 mb-2"
              />

              <p className="text-sm text-gray-600 dark:text-gray-300">
                Drag & Drop dataset.zip
              </p>

              <p className="text-xs text-gray-400 mt-1">
                atau klik untuk memilih file
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept=".zip"
                onChange={(e) =>
                  validateFile(e.target.files?.[0] || null)
                }
                className="hidden"
              />

            </div>

          ) : (

            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm">

              <div className="flex justify-between items-start">

                <div>

                  <div className="font-medium text-gray-700 dark:text-gray-200">
                    File dipilih
                  </div>

                  <div className="text-gray-600 dark:text-gray-400 break-all">
                    {selectedFile.name}
                  </div>

                  <div className="text-xs text-gray-500 mt-1">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </div>

                </div>

                <button
                  onClick={() => {
                    onSelectFile(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                  className="text-xs text-red-500 hover:text-red-600"
                >
                  Hapus
                </button>

              </div>

            </div>

          )}

          {/* ================= BUTTON ================= */}

          <button
            onClick={onUpload}
            disabled={!selectedFile || uploading}
            className={`
              w-full mt-6 py-3 rounded-lg text-sm font-semibold transition shadow-sm
              ${
                !selectedFile || uploading
                  ? "bg-gray-400 dark:bg-gray-700 cursor-not-allowed text-white"
                  : "bg-gradient-to-r from-green-600 to-yellow-600 hover:from-green-700 hover:to-yellow-700 text-white"
              }
            `}
          >
            {uploading
              ? "Mengupload Dataset..."
              : "Upload Dataset"}
          </button>

          </>

        )}

      </Card>

    </Section>

  );

}
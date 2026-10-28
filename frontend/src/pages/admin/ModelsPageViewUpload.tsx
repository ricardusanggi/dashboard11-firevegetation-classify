// src/pages/admin/ModelsPageViewUpload.tsx

import Card from "../../components/ui/Card";
import { UploadCloud, FileArchive, ChevronDown } from "lucide-react";

type Props = {
  uploadName: string;
  setUploadName: (v: string) => void;

  uploadFile: File | null;
  setUploadFile: (f: File | null) => void;

  uploadLoading: boolean;
  handleUpload: () => void;
};

export default function ModelsPageViewUpload({
  uploadName,
  setUploadName,
  uploadFile,
  setUploadFile,
  uploadLoading,
  handleUpload
}: Props) {

  function formatSize(bytes: number) {
    return (bytes / 1024 / 1024).toFixed(2) + " MB";
  }

  function validateFile(file: File | null) {
    if (!file) {
      setUploadFile(null);
      return;
    }

    if (!file.name.toLowerCase().endsWith(".zip")) {
      alert("File model harus berformat .zip");
      return;
    }

    setUploadFile(file);
  }

  return (
    <Card className="p-6 space-y-6 border dark:border-gray-800 dark:bg-gray-900">

      {/* ================= PETUNJUK COLLAPSE ================= */}

      <details className="group rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">

        <summary className="cursor-pointer list-none p-4 flex justify-between items-center font-semibold text-green-700 dark:text-green-300">

          <span>📦 Petunjuk Upload Model</span>

          <ChevronDown
            size={18}
            className="transition group-open:rotate-180"
          />

        </summary>

        <div className="px-5 pb-5">

          <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2 list-disc ml-5">
            <li>File harus dalam format <b>.zip</b></li>
            <li>Model merupakan hasil training dari sistem</li>
            <li>Struktur file wajib seperti berikut:</li>
          </ul>

          {/* STRUKTUR MODEL */}

          <div className="mt-3 p-3 rounded-lg bg-white dark:bg-gray-800 border dark:border-gray-700 text-xs font-mono">
            model_bundle.zip <br />
            ├── model.pth <br />
            ├── class_mapping.json <br />
            ├── metrics.json (opsional) <br />
            └── preview.png (opsional)
          </div>

          {/* PENJELASAN FILE */}

          <div className="mt-4 text-sm text-gray-700 dark:text-gray-300 space-y-2">

            <div>
              <b>model.pth</b> → File model hasil training (PyTorch)
            </div>

            <div>
              <b>class_mapping.json</b> → Mapping label model
            </div>

            <div>
              <b>metrics.json</b> → Hasil evaluasi model (accuracy, precision, recall)
            </div>

            <div>
              <b>preview.png</b> → Gambar preview model (opsional)
            </div>

          </div>

          {/* CONTOH CLASS MAPPING */}

          <div className="mt-4 text-sm">
            <b>Contoh isi class_mapping.json</b>
          </div>

          <div className="mt-2 p-3 rounded-lg bg-white dark:bg-gray-800 border dark:border-gray-700 text-xs font-mono">
            {"{"}
            <br />
            &nbsp;&nbsp;"0": "Arjuna", <br />
            &nbsp;&nbsp;"1": "Bima", <br />
            &nbsp;&nbsp;"2": "Yudistira", <br />
            &nbsp;&nbsp;"3": "Nakula", <br />
            &nbsp;&nbsp;"4": "Sadewa"
            <br />
            {"}"}
          </div>

          <div className="mt-4 text-xs text-gray-500">
            ⚠ Jika struktur file tidak sesuai, sistem akan menolak upload.
          </div>

        </div>

      </details>

      {/* ================= MODEL NAME ================= */}

      <div>
        <label className="font-semibold block mb-2 text-sm text-gray-800 dark:text-gray-200">
          Model Name
        </label>

        <input
          value={uploadName}
          onChange={(e) => setUploadName(e.target.value)}
          placeholder="model_vegetasi_resnet18_v1"
          className="
            w-full
            border
            border-gray-300
            dark:border-gray-700
            rounded-lg
            p-3
            text-sm
            bg-white
            dark:bg-gray-800
            focus:ring-2
            focus:ring-green-500
            outline-none
          "
        />
      </div>

      {/* ================= DRAG DROP ================= */}

      <div>

        <label className="font-semibold block mb-2 text-sm text-gray-800 dark:text-gray-200">
          Upload Model (.zip)
        </label>

        {!uploadFile ? (

          <div
            onClick={() => document.getElementById("modelUploadInput")?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              validateFile(e.dataTransfer.files?.[0] || null);
            }}
            className="
              border-2 border-dashed
              border-gray-300 dark:border-gray-700
              rounded-xl
              p-6
              text-center
              cursor-pointer
              hover:border-green-500
              hover:bg-green-50
              dark:hover:bg-green-900/10
              transition
            "
          >

            <UploadCloud size={28} className="mx-auto text-gray-400 mb-2" />

            <p className="text-sm text-gray-600 dark:text-gray-300">
              Drag & Drop model.zip
            </p>

            <p className="text-xs text-gray-400 mt-1">
              atau klik untuk memilih file
            </p>

            <input
              id="modelUploadInput"
              type="file"
              accept=".zip"
              className="hidden"
              onChange={(e) =>
                validateFile(e.target.files?.[0] || null)
              }
            />

          </div>

        ) : (

          <div className="flex items-center justify-between p-4 border rounded-xl bg-gray-50 dark:bg-gray-800 dark:border-gray-700">

            <div className="flex items-center gap-3">

              <FileArchive size={20} className="text-green-500" />

              <div className="text-sm">

                <div className="font-medium text-gray-800 dark:text-gray-200">
                  {uploadFile.name}
                </div>

                <div className="text-xs text-gray-500">
                  {formatSize(uploadFile.size)}
                </div>

              </div>

            </div>

            <button
              onClick={() => setUploadFile(null)}
              className="text-xs text-red-500 hover:text-red-600"
            >
              Hapus
            </button>

          </div>

        )}

      </div>

      {/* ================= BUTTON ================= */}

      <button
        onClick={handleUpload}
        disabled={!uploadFile || !uploadName || uploadLoading}
        className={`
          w-full py-3 rounded-lg text-sm font-semibold transition shadow-sm
          ${
            !uploadFile || !uploadName || uploadLoading
              ? "bg-gray-400 cursor-not-allowed text-white"
              : "bg-gradient-to-r from-green-600 to-yellow-600 hover:from-green-700 hover:to-yellow-700 text-white"
          }
        `}
      >
        {uploadLoading ? "Uploading Model..." : "Upload Model"}
      </button>

    </Card>
  );
}
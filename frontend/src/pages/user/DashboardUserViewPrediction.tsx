// frontend/src/pages/user/DashboardUserViewPrediction.tsx

import { useEffect, useState, useRef } from "react";
import Section from "../../components/ui/Section";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { UploadCloud, Brain } from "lucide-react";
import { predictImage, getModelClasses } from "../../api/predictApi";
import { getClassColor } from "../../utils/classColor";

type PredictionResult = {
  label: string;
  confidence: number;
  probabilities: Record<string, number>;
};

export default function DashboardUserViewPrediction() {

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [trueLabel, setTrueLabel] = useState("");

  const [classOptions, setClassOptions] = useState<string[]>([]);
  const [modelReady, setModelReady] = useState(false);
  const [checkingModel, setCheckingModel] = useState(true);

  const [result, setResult] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);

  /* ================= LOAD MODEL ================= */

  async function loadClasses() {

    try {

      setCheckingModel(true);

      const res = await getModelClasses();

      if (res?.model_active === false) {

        setModelReady(false);
        setClassOptions([]);

      } else {

        setClassOptions(res?.classes ?? []);
        setModelReady(true);

      }

    } catch (err) {

      console.warn("Gagal memuat class mapping", err);

      setModelReady(false);
      setClassOptions([]);

    } finally {

      setCheckingModel(false);

    }

  }

  useEffect(() => {
    loadClasses();
  }, []);

  /* ================= CLEANUP PREVIEW ================= */

  useEffect(() => {

    return () => {

      if (preview) URL.revokeObjectURL(preview);

    };

  }, [preview]);

  /* ================= RESET ================= */

  function resetImage() {

    setFile(null);
    setPreview(null);
    setResult(null);
    setTrueLabel("");

    if (fileInputRef.current) fileInputRef.current.value = "";

  }

  /* ================= FILE HANDLER ================= */

  function handleFileChange(file: File | null) {

    if (!file) {
      setFile(null);
      setPreview(null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("File harus berupa gambar.");
      return;
    }

    const previewUrl = URL.createObjectURL(file);

    setFile(file);
    setPreview(previewUrl);
    setResult(null);

  }

  /* ================= DRAG DROP ================= */

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {

    e.preventDefault();

    if (!modelReady) return;

    const f = e.dataTransfer.files?.[0];

    handleFileChange(f ?? null);

  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
  }

  function handleClick() {

    if (!modelReady) return;

    fileInputRef.current?.click();

  }

  /* ================= PREDICT ================= */

  async function handlePredict() {

    if (!file || loading) {

      alert("Pilih gambar vegetasi terlebih dahulu.");
      return;

    }

    setLoading(true);
    setResult(null);

    try {

      const res = await predictImage(file, trueLabel);

      setResult({
        label: res?.label ?? "",
        confidence: res?.confidence ?? 0,
        probabilities: res?.probabilities ?? {}
      });

    } catch (err: any) {

      alert(
        "Gagal melakukan klasifikasi: " +
        (err?.response?.data?.detail ??
          err?.message ??
          "Unknown error")
      );

    } finally {

      setLoading(false);

    }

  }

  const isCorrect =
    result && trueLabel
      ? result.label === trueLabel
      : null;

  const sortedProbabilities = result
    ? Object.entries(result.probabilities)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
    : [];

  /* ================= RENDER ================= */

  return (

    <Section title="🔍 Prediksi Jenis Vegetasi">

      <div className="max-w-3xl mx-auto">

        <Card className="p-8 rounded-3xl shadow-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 space-y-6">

          {/* ================= CHECKING MODEL ================= */}

          {checkingModel && (
            <div className="text-center text-sm text-gray-500">
              Memeriksa status model...
            </div>
          )}

          {/* ================= MODEL BELUM TERSEDIA ================= */}

          {!checkingModel && !modelReady && (

            <div className="p-6 rounded-xl bg-yellow-50 border border-yellow-300 text-yellow-800 text-sm dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-300 flex items-start gap-3">

              <Brain size={20} className="mt-1"/>

              <div>

                <div className="font-semibold text-base">
                  Model Prediksi Belum Tersedia
                </div>

                <p className="text-xs mt-2 leading-relaxed">

                  Sistem klasifikasi jenis vegetasi saat ini
                  <b> belum memiliki model AI yang aktif</b>.

                  <br/><br/>

                  Hal ini dapat terjadi karena:

                  <br/>

                  • Admin belum memilih model hasil pelatihan  
                  • Proses pelatihan model masih berlangsung  
                  • Folder <b>models_predict</b> belum berisi model siap pakai

                  <br/><br/>

                  Selama model belum tersedia,
                  <b> fitur prediksi tidak dapat digunakan</b>.

                </p>

              </div>

            </div>

          )}

          {/* ================= PREDICTION UI ================= */}

          {modelReady && (
            <>
            
            {/* UPLOAD */}

            {!preview && (

              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={handleClick}
                className="border-2 border-dashed rounded-2xl p-12 text-center transition cursor-pointer border-gray-300 hover:border-green-500 dark:border-gray-700 dark:hover:border-green-500"
              >

                <UploadCloud size={36} className="mx-auto text-gray-400 mb-3"/>

                <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  Upload Citra Vegetasi
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  Drag & Drop gambar atau klik untuk memilih
                </p>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleFileChange(e.target.files?.[0] ?? null)
                  }
                  className="hidden"
                />

              </div>

            )}

            {/* PREVIEW */}

            {preview && (

              <div className="space-y-4">

                <div className="flex justify-between text-sm">

                  <label className="cursor-pointer font-semibold text-green-600 hover:underline">

                    🔄 Ganti Gambar

                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleFileChange(e.target.files?.[0] ?? null)
                      }
                      className="hidden"
                    />

                  </label>

                  <button
                    onClick={resetImage}
                    className="text-red-500 font-semibold hover:underline"
                  >
                    🗑 Hapus
                  </button>

                </div>

                <img
                  src={preview}
                  alt="Preview vegetasi"
                  className="w-full max-h-72 object-contain rounded-2xl bg-gray-50 dark:bg-gray-800 p-4"
                />

              </div>

            )}

            {/* TRUE LABEL */}

            {file && classOptions.length > 0 && (

              <div>

                <label className="block text-sm font-semibold mb-1">
                  🏷️ Label Asli (Opsional)
                </label>

                <select
                  value={trueLabel}
                  onChange={(e) => setTrueLabel(e.target.value)}
                  className="w-full border rounded-xl p-3 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
                >

                  <option value="">-- Lewati --</option>

                  {classOptions.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}

                </select>

              </div>

            )}

            {/* BUTTON */}

            <Button
              className="w-full py-3 rounded-xl bg-gradient-to-r from-green-600 to-yellow-600 hover:from-green-700 hover:to-yellow-700 text-white"
              onClick={handlePredict}
              disabled={loading || !file}
            >
              {loading ? "⏳ Menganalisis..." : "🔬 Jalankan Prediksi"}
            </Button>

            {/* RESULT */}

            {result && (

              <div className="pt-6 space-y-6">

                <div className={`px-6 py-5 rounded-2xl text-center shadow-md bg-gradient-to-r ${getClassColor(result.label).gradient} text-white`}>

                  <p className="text-2xl font-bold uppercase">
                    {result.label}
                  </p>

                  <p className="text-sm mt-2">
                    Confidence: {(result.confidence * 100).toFixed(2)}%
                  </p>

                </div>

                {trueLabel && (

                  <div
                    className={`p-4 rounded-xl text-center font-semibold ${
                      isCorrect
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >

                    {isCorrect
                      ? "✅ Prediksi Benar"
                      : "❌ Prediksi Salah"}

                    <p className="text-sm mt-1">
                      Label Asli: <b>{trueLabel}</b>
                    </p>

                  </div>

                )}

                {sortedProbabilities.length > 0 && (

                  <div className="space-y-3">

                    <p className="font-semibold">
                      📊 Probabilitas Kelas
                    </p>

                    {sortedProbabilities.map(([cls, prob]) => (

                      <div key={cls} className="text-sm">

                        <div className="flex justify-between">

                          <span>{cls}</span>

                          <span>{(prob * 100).toFixed(2)}%</span>

                        </div>

                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">

                          <div
                            className={`h-2 ${getClassColor(cls).bar} transition-all`}
                            style={{ width: `${prob * 100}%` }}
                          />

                        </div>

                      </div>

                    ))}

                  </div>

                )}

              </div>

            )}

            </>
          )}

        </Card>

      </div>

    </Section>

  );

}
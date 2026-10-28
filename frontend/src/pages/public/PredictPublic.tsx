// frontend/src/pages/public/PredictPublic.tsx

import { useState, useRef, useEffect } from "react";
import PublicLayout from "../../components/layouts/PublicLayout";
import { Microscope, UploadCloud, AlertTriangle, Brain } from "lucide-react";
import { predictImage } from "../../api/predictApi";
import publicApi from "../../api/publicApi";
import { getClassColor } from "../../utils/classColor";

type ProbabilityItem = {
  label: string;
  probability: number;
};

const CONFIDENCE_THRESHOLD = 0.6;

export default function PredictPublic() {

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [label, setLabel] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [probabilities, setProbabilities] = useState<ProbabilityItem[]>([]);

  const [loading, setLoading] = useState(false);
  const [latency, setLatency] = useState<number | null>(null);

  const [architecture, setArchitecture] = useState("MODEL AI");

  const [modelReady, setModelReady] = useState(false);
  const [checkingModel, setCheckingModel] = useState(true);

  /* ================= LOAD MODEL ================= */

  async function loadArchitecture() {

    try {

      setCheckingModel(true);

      const res = await publicApi.get("/public/model-info");

      const arch = res?.data?.training?.architecture;

      if (arch) {
        setArchitecture(String(arch).toUpperCase());
        setModelReady(true);
      } else {
        setModelReady(false);
      }

    } catch (err: any) {

      if (err?.response?.status === 409) {

        setModelReady(false);

      } else {

        console.warn("Failed loading architecture");
        setModelReady(false);

      }

    } finally {

      setCheckingModel(false);

    }

  }

  /* ================= PAGE LOAD ================= */

  useEffect(() => {

    loadArchitecture();

  }, []);

  /* ================= FILE PROCESS ================= */

  function processFile(selectedFile: File | null) {

    if (!selectedFile) {

      setFile(null);
      setPreview(null);
      return;

    }

    if (!selectedFile.type.startsWith("image/")) {

      alert("File harus berupa gambar");
      return;

    }

    setFile(selectedFile);
    setLabel(null);
    setConfidence(null);
    setProbabilities([]);

    const reader = new FileReader();

    reader.onload = () => {

      setPreview(reader.result as string);

    };

    reader.readAsDataURL(selectedFile);

  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {

    processFile(e.target.files?.[0] || null);

  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {

    e.preventDefault();

    if (!modelReady) return;

    processFile(e.dataTransfer.files?.[0] || null);

  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {

    e.preventDefault();

  }

  function reset() {

    setFile(null);
    setPreview(null);

    setLabel(null);
    setConfidence(null);
    setProbabilities([]);
    setLatency(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

  }

  /* ================= PREDICT ================= */

  async function predict() {

    if (!modelReady) {

      alert("Model prediksi belum tersedia.");
      return;

    }

    if (!file) {

      alert("Pilih gambar terlebih dahulu.");
      return;

    }

    setLoading(true);

    setLabel(null);
    setConfidence(null);

    const start = performance.now();

    try {

      const res = await predictImage(file);

      const end = performance.now();

      setLatency(Math.round(end - start));

      setLabel(res?.label ?? null);
      setConfidence(res?.confidence ?? null);

      const probs = res?.probabilities ?? res?.data?.probabilities ?? {};

      const distribution: ProbabilityItem[] =
        Object.entries(probs)
          .map(([label, probability]) => ({
            label,
            probability: Number(probability)
          }))
          .sort((a, b) => b.probability - a.probability)
          .slice(0, 5);

      setProbabilities(distribution);

    } catch (err: any) {

      if (err?.response?.status === 409) {

        setModelReady(false);

        alert("Model belum tersedia.");

        return;

      }

      alert("Gagal memproses gambar");

    } finally {

      setLoading(false);

    }

  }

  return (

    <PublicLayout>

      {/* HERO */}

      <section className="text-center py-8 bg-gradient-to-br from-slate-900 via-emerald-800 to-orange-600 text-white">

        <div className="flex justify-center items-center gap-3">

          <Microscope className="w-7 h-7 text-green-300"/>

          <h1 className="text-2xl md:text-3xl font-bold">
            Klasifikasi Jenis Vegetasi
          </h1>

        </div>

        <p className="text-sm mt-2 text-white/90">
          Deep Learning Model —
          <span className="text-green-300 font-semibold">
            {" "}{architecture}
          </span>
        </p>

      </section>

      {/* MAIN */}

      <section className="py-10 px-6 bg-slate-50 dark:bg-slate-950">

        <div className="max-w-4xl mx-auto">

          {/* CHECK MODEL */}

          {checkingModel && (

            <div className="text-center py-10 text-gray-500">
              Memeriksa status model AI...
            </div>

          )}

          {/* MODEL BELUM TERSEDIA */}

          {!checkingModel && !modelReady && (

            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow border">

              <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-6 text-yellow-800 flex gap-3">

                <Brain size={20} className="mt-1 shrink-0 text-yellow-700"/>

                <div>

                  <div className="font-semibold text-base">
                    Model Prediksi Belum Tersedia
                  </div>

                  <p className="text-sm mt-2 leading-relaxed">

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

            </div>

          )}

          {/* AREA PREDIKSI */}

          {!checkingModel && modelReady && (

            <div className="grid md:grid-cols-2 gap-8">

              {/* UPLOAD */}

              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow border">

                {!preview && (

                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center cursor-pointer hover:border-green-500"
                  >

                    <UploadCloud className="mx-auto mb-3 w-10 h-10 text-gray-400"/>

                    <p className="font-semibold text-gray-700 dark:text-gray-300">
                      Upload Citra Vegetasi
                    </p>

                    <p className="text-xs text-gray-500 mt-1">
                      Drag & Drop gambar atau klik untuk memilih
                    </p>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                  </div>

                )}

                {preview && (

                  <div className="space-y-4">

                    <div className="flex justify-between text-sm">

                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="text-green-600 hover:underline"
                      >
                        Ganti
                      </button>

                      <button
                        onClick={reset}
                        className="text-red-500 hover:underline"
                      >
                        Hapus
                      </button>

                    </div>

                    <img
                      src={preview}
                      className="w-full max-h-64 object-contain rounded-lg border"
                    />

                  </div>

                )}

                <button
                  onClick={predict}
                  disabled={loading || !file || !modelReady}
                  className="mt-6 w-full py-3 rounded-full bg-gradient-to-r from-green-600 to-yellow-600 text-white font-semibold"
                >
                  {loading ? "Menganalisis..." : "Jalankan Prediksi"}
                </button>

              </div>

              {/* RESULT */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow border">
                  {!label && (
                    <div className="text-center text-gray-400 text-sm">
                      Hasil klasifikasi akan muncul di sini
                    </div>
                  )}

                  {label && confidence !== null && (

                    <div className="space-y-6">

                      <div className="text-center">

                        <h2 className={`text-2xl font-bold capitalize ${getClassColor(label).text}`}>
                          {label.replaceAll("_", " ")}
                        </h2>

                        <p className="text-sm text-gray-500">
                          Confidence {(confidence * 100).toFixed(2)}%
                        </p>
                        
                        {/* ================= NARASI HASIL ================= */}

                        {label === "unknown" && (
                            <div className="mt-3 text-xs text-yellow-800 bg-yellow-50 border border-yellow-200 p-4 rounded-lg leading-relaxed">

                              <p className="text-center">
                                Sistem belum dapat memastikan satu kelas vegetasi secara pasti karena tingkat
                                keyakinan prediksi berada di bawah ambang batas kepercayaan
                                <b> {(CONFIDENCE_THRESHOLD * 100).toFixed(0)}%</b>.
                              </p>

                              <p className="mt-3 text-center">
                                Untuk membantu interpretasi hasil, sistem menampilkan lima kelas vegetasi
                                yang memiliki tingkat kemiripan visual tertinggi berdasarkan analisis model:
                              </p>

                              <ul className="mt-4 space-y-1 max-w-xs mx-auto">

                                {probabilities.map((p, i) => (
                                  <li key={i} className="flex justify-between">
                                    <span className="capitalize">
                                      {p.label.replaceAll("_", " ")}
                                    </span>

                                    <span className="font-semibold">
                                      {(p.probability * 100).toFixed(1)}%
                                    </span>
                                  </li>
                                ))}

                              </ul>

                            </div>
                        )}

                        {label !== "unknown" && (

                          <div className="mt-3 text-xs text-gray-600 bg-gray-50 border border-gray-200 p-3 rounded-lg">

                            Model AI mendeteksi bahwa gambar ini paling mendekati kelas
                            <b> {label.replaceAll("_", " ")}</b> berdasarkan pola visual
                            yang dipelajari selama proses pelatihan model.

                          </div>

                        )}
                      </div>

                      {/* PROBABILITIES */}

                      {probabilities.map((p, i) => (

                        <div key={i} className="text-xs">

                          <div className="flex justify-between">

                            <span>
                              {p.label.replaceAll("_", " ")}
                            </span>

                            <span>
                              {(p.probability * 100).toFixed(1)}%
                            </span>

                          </div>

                          <div className="h-2 bg-gray-200 rounded">

                            <div
                              className={`h-2 rounded ${getClassColor(p.label).bar}`}
                              style={{ width: `${p.probability * 100}%` }}
                            />

                          </div>

                        </div>

                      ))}

                      {/* LATENCY */}

                      {latency && (

                        <p className="text-xs text-gray-500 text-center">
                          Inference time: <b>{latency} ms</b>
                        </p>

                      )}

                      {/* LOW CONFIDENCE WARNING */}

                      {confidence < CONFIDENCE_THRESHOLD && (

                        <div className="p-3 bg-yellow-100 border border-yellow-300 rounded flex gap-2 text-xs">

                          <AlertTriangle className="w-4 h-4"/>

                          <span>
                            Tingkat keyakinan rendah. Perlu verifikasi manual.
                          </span>

                        </div>

                      )}

                    </div>

                  )}

                </div>

            </div>

          )}

        </div>

      </section>

    </PublicLayout>

  );

}
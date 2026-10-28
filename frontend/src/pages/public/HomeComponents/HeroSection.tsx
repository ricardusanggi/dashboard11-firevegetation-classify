import React, { useEffect, useState, lazy, Suspense, useRef } from "react";
import { Link } from "react-router-dom";
import { Microscope, UploadCloud, Leaf } from "lucide-react";

const NeuralBackground = lazy(() =>
  import("../../../components/ai/NeuralBackground")
);

export default function HeroSection({ datasetInfo }: any) {

  const [lowPerformance, setLowPerformance] = useState(false);
  const [heroVisible, setHeroVisible] = useState(true);

  const heroRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {

    const mediaQuery = window.matchMedia("(max-width:1024px)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (mediaQuery.matches || reducedMotion.matches) {
      setLowPerformance(true);
    }

  }, []);

  useEffect(() => {

    const observer = new IntersectionObserver(
      ([entry]) => setHeroVisible(entry.isIntersecting),
      { threshold: 0.25 }
    );

    if (heroRef.current) observer.observe(heroRef.current);

    return () => observer.disconnect();

  }, []);

  const architecture =
    datasetInfo?.training?.architecture
      ?.replaceAll("_", " ")
      .replace(/\b\w/g, c => c.toUpperCase()) ?? "-";

  return (

    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center px-6 text-white overflow-hidden bg-gradient-to-br from-slate-900 via-emerald-900 to-orange-700"
    >

      {/* Background AI */}

      {!lowPerformance && heroVisible && (
        <Suspense fallback={null}>
          <div className="absolute inset-0 z-0">
            <NeuralBackground />
          </div>
        </Suspense>
      )}

      <div className="hero-glow" />

      <div className="relative z-10 max-w-6xl mx-auto text-center">

        <Leaf className="w-16 h-16 mx-auto mb-6 text-green-300" />

        <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">

          Kenali Vegetasi

          <br />

          <span className="text-green-300">
            Sistem Klasifikasi Jenis Vegetasi
          </span>

        </h1>

        <p className="mt-6 text-base md:text-lg text-white/90 max-w-3xl mx-auto leading-relaxed">

          <span className="text-green-300 font-semibold">
            Kenali Vegetasi
          </span>{" "}
          merupakan sistem analisis citra digital yang dirancang untuk membantu
          proses klasifikasi jenis vegetasi dalam konteks
          <span className="text-green-300 font-semibold">
            {" "}kerawanan kebakaran
          </span>.
          Sistem ini memanfaatkan teknologi
          <span className="text-green-300 font-semibold">
            {" "}Deep Learning
          </span>{" "}
          dengan arsitektur
          <span className="text-green-300 font-semibold">
            {" "}{architecture}
          </span>{" "}
          untuk mengekstraksi karakteristik visual dari citra jenis vegetasi
          secara otomatis dan menghasilkan prediksi klasifikasi secara sistematis.

        </p>

        {/* PENJELASAN FITUR UTAMA */}

        <div className="grid md:grid-cols-2 gap-8 mt-10 text-left">

          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-6">

            <h3 className="font-semibold text-green-300 mb-2">
              Mulai Klasifikasi
            </h3>

            <p className="text-sm text-white/80 leading-relaxed">

              Pengguna dapat mengunggah citra jenis vegetasi untuk dianalisis
              oleh model klasifikasi berbasis kecerdasan artifisial. Sistem akan
              mengekstraksi pola visual dari citra tersebut dan menghasilkan
              prediksi jenis vegetasi beserta tingkat keyakinan model
              terhadap hasil klasifikasi yang diperoleh.

            </p>

          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-6">

            <h3 className="font-semibold text-green-300 mb-2">
              Kontribusi Dataset
            </h3>

            <p className="text-sm text-white/80 leading-relaxed">

              Pengguna terdaftar dapat berkontribusi dalam pengembangan dataset
              dengan menambahkan citra jenis vegetasi yang telah diberi label.
              Dataset yang telah diverifikasi akan digunakan dalam proses
              pelatihan ulang model guna meningkatkan akurasi serta kemampuan
              generalisasi sistem dalam mengenali jenis vegetasi.

            </p>

          </div>

        </div>

        {/* CTA */}

        <div className="flex flex-col md:flex-row justify-center gap-6 mt-10">

          <Link
            to="/predict"
            className="flex items-center gap-2 px-8 py-4 rounded-xl bg-green-500 hover:bg-green-400 text-black font-semibold shadow-lg transition"
          >

            <Microscope size={20} />
            Mulai Klasifikasi

          </Link>

          <Link
            to="/register"
            className="flex items-center gap-2 px-8 py-4 rounded-xl border border-white/30 bg-white/10 backdrop-blur-md hover:bg-white/20 transition"
          >

            <UploadCloud size={20} />
            Kontribusi Dataset

          </Link>

        </div>

      </div>

    </section>

  );

}
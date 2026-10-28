import React from "react";
import { Cpu, BarChart3, GitBranch } from "lucide-react";
import FeatureCard from "./FeatureCard";

export default function FeatureSection() {

  return (

    <section className="py-24 px-6">

      <div className="max-w-6xl mx-auto text-center">

        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Keunggulan Sistem
        </h2>

        <p className="text-gray-500 max-w-2xl mx-auto mb-16 leading-relaxed">

          Sistem Kenali Vegetasi dirancang untuk mendukung proses klasifikasi citra
          jenis vegetasi secara sistematis melalui pemanfaatan teknologi
          kecerdasan artifisial serta pengelolaan dataset pelatihan yang
          terstruktur. Platform ini memungkinkan proses analisis citra dilakukan
          secara otomatis sekaligus mendukung pengembangan penelitian dalam
          bidang mitigasi kerawanan kebakaran vegetasi dan pembelajaran mesin.

        </p>

        <div className="grid md:grid-cols-3 gap-10">

          <FeatureCard
            icon={<Cpu />}
            title="Model Deep Learning Modern"
            description="Model klasifikasi menggunakan arsitektur jaringan saraf konvolusional ResNet yang dirancang untuk mengekstraksi fitur visual kompleks dari citra. Pendekatan ini memungkinkan sistem mengenali karakteristik unik pada setiap jenis vegetasi secara lebih akurat."
          />

          <FeatureCard
            icon={<BarChart3 />}
            title="Evaluasi Performa Model"
            description="Performa model dianalisis menggunakan metrik evaluasi klasifikasi seperti Accuracy, Precision, Recall, dan F1 Score. Evaluasi ini memberikan gambaran menyeluruh mengenai kemampuan model dalam mengidentifikasi jenis vegetasi dari citra digital."
          />

          <FeatureCard
            icon={<GitBranch />}
            title="Pengembangan Dataset Berkelanjutan"
            description="Sistem mendukung kontribusi dataset oleh pengguna terdaftar sehingga proses pelatihan model dapat dilakukan secara berkelanjutan. Pendekatan ini memungkinkan peningkatan kualitas model melalui penambahan data pelatihan yang lebih beragam."
          />

        </div>

      </div>

    </section>

  );

}
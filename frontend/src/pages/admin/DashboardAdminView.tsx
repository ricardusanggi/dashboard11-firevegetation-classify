import { Link } from "react-router-dom"
import Section from "../../components/ui/Section"
import Card from "../../components/ui/Card"

import {
  Database,
  Layers,
  Users,
  Box,
  PlayCircle,
  Leaf
} from "lucide-react"

interface Props {
  pendingDatasets: number
  activeModelVersion: number | null
  totalUsers: number
  totalModels: number
  totalTrainings: number

  datasetStats: {
    total_images: number
    num_classes: number
    per_class: Record<string, number>
  }
}

export default function DashboardAdminView({
  pendingDatasets,
  activeModelVersion,
  totalUsers,
  totalModels,
  totalTrainings,
  datasetStats
}: Props) {

  return (

    <Section title="🌿 Dashboard Admin Sistem Klasifikasi Vegetasi">

      {/* ================= KPI UTAMA ================= */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

        {/* DATASET */}

        <Card className="md:col-span-2 p-8 rounded-3xl border border-gray-200 dark:border-gray-800 bg-gradient-to-br from-green-600 to-yellow-600 text-white shadow-lg">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm opacity-80">
                Dataset Pelatihan Vegetasi
              </p>

              <h2 className="text-4xl font-bold mt-2">
                {datasetStats.total_images} Citra
              </h2>

              <p className="text-sm opacity-80 mt-2">
                {datasetStats.total_images} citra • {datasetStats.num_classes} kelas vegetasi
              </p>

            </div>

            <Leaf size={42} className="opacity-80" />

          </div>

        </Card>


        {/* DATASET REVIEW */}

        <Card className="p-6 rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:shadow-lg transition">

          <div className="flex items-center gap-4">

            <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/40">
              <Database size={24} className="text-green-600 dark:text-green-300" />
            </div>

            <div>

              <p className="text-sm text-gray-500">
                Dataset Menunggu Review
              </p>

              <p className="text-2xl font-semibold">
                {pendingDatasets}
              </p>

            </div>

          </div>

        </Card>


        {/* MODEL AKTIF */}

        <Card className="p-6 rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:shadow-lg transition">

          <div className="flex items-center gap-4">

            <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/40">
              <Layers size={24} className="text-green-600 dark:text-green-300" />
            </div>

            <div>

              <p className="text-sm text-gray-500">
                Model Aktif
              </p>

              <p className="text-lg font-semibold">

                {activeModelVersion !== null
                  ? `Versi ${activeModelVersion}`
                  : "Belum Ada"}

              </p>

            </div>

          </div>

        </Card>

      </div>


      {/* ================= METRIC SECONDARY ================= */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">

        {/* USERS */}

        <Card className="p-6 rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:shadow-lg transition">

          <div className="flex items-center gap-4">

            <Users size={24} className="text-purple-500" />

            <div>
              <p className="text-sm text-gray-500">
                Total Pengguna
              </p>

              <p className="text-2xl font-semibold">
                {totalUsers}
              </p>
            </div>

          </div>

        </Card>


        {/* MODELS */}

        <Card className="p-6 rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:shadow-lg transition">

          <div className="flex items-center gap-4">

            <Box size={24} className="text-green-500" />

            <div>

              <p className="text-sm text-gray-500">
                Total Model
              </p>

              <p className="text-2xl font-semibold">
                {totalModels}
              </p>

            </div>

          </div>

        </Card>


        {/* TRAINING */}

        <Card className="p-6 rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:shadow-lg transition">

          <div className="flex items-center gap-4">

            <PlayCircle size={24} className="text-red-500" />

            <div>

              <p className="text-sm text-gray-500">
                Riwayat Training
              </p>

              <p className="text-2xl font-semibold">
                {totalTrainings}
              </p>

            </div>

          </div>

        </Card>

      </div>


      {/* ================= QUICK ACTION ================= */}

      <div className="mt-12">

        <h3 className="text-lg font-semibold mb-6">
          Aksi Cepat
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

          <Link to="/admin/datasets">

            <Card className="group p-6 rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:shadow-lg hover:-translate-y-1 transition cursor-pointer">

              <div className="flex justify-between items-center">

                <div>
                  <h4 className="font-semibold">
                    Kelola Dataset
                  </h4>

                  <p className="text-xs text-gray-500 mt-1">
                    Review & validasi dataset vegetasi
                  </p>
                </div>

                <Database className="opacity-40 group-hover:opacity-100 transition" />

              </div>

            </Card>

          </Link>


          <Link to="/admin/training">

            <Card className="group p-6 rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:shadow-lg hover:-translate-y-1 transition cursor-pointer">

              <div className="flex justify-between items-center">

                <div>
                  <h4 className="font-semibold">
                    Training Model
                  </h4>

                  <p className="text-xs text-gray-500 mt-1">
                    Jalankan & pantau pelatihan model
                  </p>
                </div>

                <Layers className="opacity-40 group-hover:opacity-100 transition" />

              </div>

            </Card>

          </Link>


          <Link to="/admin/models">

            <Card className="group p-6 rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:shadow-lg hover:-translate-y-1 transition cursor-pointer">

              <div className="flex justify-between items-center">

                <div>
                  <h4 className="font-semibold">
                    Kelola Model
                  </h4>

                  <p className="text-xs text-gray-500 mt-1">
                    Aktivasi & monitoring model
                  </p>
                </div>

                <Box className="opacity-40 group-hover:opacity-100 transition" />

              </div>

            </Card>

          </Link>


          <Link to="/admin/users">

            <Card className="group p-6 rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:shadow-lg hover:-translate-y-1 transition cursor-pointer">

              <div className="flex justify-between items-center">

                <div>
                  <h4 className="font-semibold">
                    Kelola Pengguna
                  </h4>

                  <p className="text-xs text-gray-500 mt-1">
                    Manajemen & verifikasi pengguna
                  </p>
                </div>

                <Users className="opacity-40 group-hover:opacity-100 transition" />

              </div>

            </Card>

          </Link>

        </div>

      </div>

    </Section>

  )

}
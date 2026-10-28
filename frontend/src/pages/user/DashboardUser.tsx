//frontend/src/pages/user/DashboardUser.tsx
import { useEffect, useState, useCallback, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../store/useAuth";
import { usersDatasetApi, userMeApi, userPredictionApi } from "../../api/users";
import { Toaster, toast } from "react-hot-toast";
import UserLayout from "../../components/layouts/UserLayout";

import DashboardUserViewOverview from "./DashboardUserViewOverview";
import DashboardUserViewProfile from "./DashboardUserViewProfile";
import DashboardUserViewDataset from "./DashboardUserViewDataset";
import DashboardUserViewPrediction from "./DashboardUserViewPrediction";
import DashboardUserViewHistory from "./DashboardUserViewHistory";
import { TabType } from "./types/dashboard";

export type PredictionLog = {
  id: number;
  label: string;
  input_path: string;
  predicted_at: string;
  model_version: number | null;
};

export default function DashboardUser() {

  const user = useAuth((s) => s.user);
  const logoutStore = useAuth((s) => s.logout);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [overview, setOverview] = useState({
    database_summary: {
      total_images: 0,
      total_labels: 0
    },
    train_folder_summary: {
      total_images: 0
    },
    is_consistent: true
  });
  const [predictionHistory, setPredictionHistory] = useState<PredictionLog[]>([]);

  const [editMode, setEditMode] = useState(false);

  const [form, setForm] = useState({
    full_name: "",
    email: ""
  });

  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [accountStatus, setAccountStatus] = useState<string | null>(null);
  const [loadingPage, setLoadingPage] = useState(true);

  /* 🔴 TAMBAHAN */
  const [hasPendingDataset, setHasPendingDataset] = useState(false);

  /* ======================================================
     AUTH CHECK
  ====================================================== */

  useEffect(() => {
    if (!user) navigate("/");
  }, [user, navigate]);

  /* ======================================================
     LOAD DATA
  ====================================================== */

  const loadAll = useCallback(async () => {

    if (!user) return;

    try {

      setLoadingPage(true);

      const [overviewRes, predictionRes, meRes, pendingRes] = await Promise.all([
        usersDatasetApi.getOverview(),
        userPredictionApi.getMyHistory(),
        userMeApi.getMe(),
        usersDatasetApi.listMyPending() // 🔴 cek dataset pending
      ]);

      const predictionRows = predictionRes?.data?.data ?? [];

      setOverview(overviewRes.data);
      setPredictionHistory(predictionRows);

      setAccountStatus(meRes.data?.status ?? "approved");

      /* 🔴 jika ada dataset pending */
      const pending = pendingRes?.data?.data ?? pendingRes?.data ?? [];
      setHasPendingDataset(pending.length > 0);

    } catch (error) {

      console.error("Gagal load dashboard:", error);

    } finally {

      setLoadingPage(false);

    }

  }, [user]);

  useEffect(() => {

    if (!user) return;

    setForm({
      full_name: user.full_name || "",
      email: user.email || ""
    });

    loadAll();

  }, [user, loadAll]);

  /* ======================================================
     ACTIONS
  ====================================================== */

  function handleLogout() {

    const confirmLogout = window.confirm(
      "Apakah Anda yakin ingin keluar dari sistem?"
    );

    if (!confirmLogout) return;

    //localStorage.removeItem("token");
    //logoutStore();
    //window.location.href = "/";
    logoutStore();
    navigate("/");
  }

  async function handleSaveProfile(payload: any) {

    try {

      await userMeApi.updateMe(payload);

      toast.success("Profil berhasil diperbarui");

      setEditMode(false);

      loadAll();

    } catch (error: any) {

      console.error(error);

      toast.error(
        error?.response?.data?.message || "Gagal memperbarui profil"
      );

    }

  }

  async function handleUploadDataset() {

    if (!uploadFile) {
      toast.error("Pilih file ZIP terlebih dahulu.");
      return;
    }

    if (hasPendingDataset) {
      toast.error("Dataset sebelumnya masih menunggu review admin.");
      return;
    }

    try {

      setUploading(true);
      setUploadProgress(0);

      await usersDatasetApi.upload(uploadFile, (percent: number) => {
        setUploadProgress(percent);
      });

      toast.success("Dataset berhasil diupload");

      setUploadFile(null);

      loadAll();

    } catch (error: any) {

      console.error(error);

      if (error?.response?.status === 409) {
        toast.error(
          error?.response?.data?.detail ||
          "Dataset sebelumnya masih menunggu review admin"
        );
        return;
      }

      toast.error("Upload dataset gagal");

    } finally {

      setUploading(false);

    }

  }

  /* ======================================================
     TAB CONTENT
  ====================================================== */

  const tabContent: Record<TabType, ReactNode> = {
    overview: <DashboardUserViewOverview user={user} overview={overview} />,
    profile: (
      <DashboardUserViewProfile
        user={user}
        editMode={editMode}
        setEditMode={setEditMode}
        form={form}
        setForm={setForm}
        onSaveProfile={handleSaveProfile}
      />
    ),
    dataset: (
      <DashboardUserViewDataset
        hasPending={hasPendingDataset}
        selectedFile={uploadFile}
        uploading={uploading}
        progress={uploadProgress}
        onSelectFile={setUploadFile}
        onUpload={handleUploadDataset}
      />
    ),
    prediction: <DashboardUserViewPrediction />,
    history: (
      <DashboardUserViewHistory
        predictionHistory={predictionHistory}
      />
    )
  };

  /* ======================================================
     LOADING SCREEN
  ====================================================== */

  if (loadingPage) {

    return (
      <UserLayout
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        onReload={loadAll}
      >
        <div className="flex justify-center items-center py-32 text-gray-500">
          Memuat dashboard pengguna...
        </div>
      </UserLayout>
    );

  }

  /* ======================================================
     ACCOUNT PENDING SCREEN
  ====================================================== */

  if (accountStatus === "pending") {

    return (
      <UserLayout
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        onReload={loadAll}
      >

        <div className="flex items-center justify-center py-32">

          <div className="bg-white dark:bg-slate-900 p-10 rounded-2xl shadow-lg max-w-md text-center border border-slate-200 dark:border-slate-800">

            <h2 className="text-2xl font-semibold mb-4 text-green-600">
              Menunggu Persetujuan Reviewer
            </h2>

            <p className="text-sm text-gray-600 leading-relaxed">
              Akun Anda sedang dalam proses
              <b> peninjauan oleh administrator </b>.
            </p>

          </div>

        </div>

      </UserLayout>
    );

  }

  /* ======================================================
     NORMAL DASHBOARD
  ====================================================== */

  return (

    <UserLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onLogout={handleLogout}
      onReload={loadAll}
    >

      <Toaster position="top-right" />

      {tabContent[activeTab]}

    </UserLayout>

  );

}
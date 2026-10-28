import { useEffect, useState } from "react";
import api from "../../api/api";
import DashboardAdminView from "./DashboardAdminView";
import { useAuth } from "../../store/useAuth";

export default function DashboardAdmin() {

  const { user } = useAuth();

  const [pendingDatasets, setPendingDatasets] = useState(0);
  const [activeModelVersion, setActiveModelVersion] = useState<number | null>(null);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalModels, setTotalModels] = useState(0);
  const [totalTrainings, setTotalTrainings] = useState(0);

  const [datasetStats, setDatasetStats] = useState({
    total_images: 0,
    num_classes: 0,
    per_class: {} as Record<string, number>
  });

  useEffect(() => {

    const token = localStorage.getItem("token");
    if (!token) return;

    loadData();

  }, []);


  async function loadData() {

    try {

      /* ================= DATASET PENDING ================= */

      const pending = await api.get("/admin/datasets/pending");
      setPendingDatasets(pending.data.length);


      /* ================= ACTIVE MODEL ================= */

      const model = await api.get("/admin/models/active");

      setActiveModelVersion(
        model.data?.version ?? null
      );


      /* ================= USERS ================= */

      const users = await api.get("/admin/users");
      setTotalUsers(users.data.length);


      /* ================= MODELS ================= */

      const models = await api.get("/admin/models/lists");
      setTotalModels(models.data.length);


      /* ================= TRAININGS ================= */

      const jobs = await api.get("/admin/training/jobs");
      setTotalTrainings(jobs.data.length);


      /* ================= DATASET STATS ================= */

      const stats = await api.get("/admin/datasets/stats");

      setDatasetStats({
        total_images: stats.data.total_images,
        num_classes: stats.data.num_classes,
        per_class: stats.data.per_class
      });

    } catch (err) {

      console.error("Gagal memuat dashboard admin", err);

    }

  }


  return (

    <DashboardAdminView
      pendingDatasets={pendingDatasets}
      activeModelVersion={activeModelVersion}
      totalUsers={totalUsers}
      totalModels={totalModels}
      totalTrainings={totalTrainings}
      datasetStats={datasetStats}
    />

  );

}
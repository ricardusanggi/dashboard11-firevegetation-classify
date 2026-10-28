// src/pages/admin/ModelsPageView.tsx

import Section from "../../components/ui/Section";

import ModelsPageViewTabs from "./ModelsPageViewTabs";
import ModelsPageViewActive from "./ModelsPageViewActive";
import ModelsPageViewUpload from "./ModelsPageViewUpload";
import ModelsPageViewList from "./ModelsPageViewList";
import ModelsPageViewVersion from "./ModelsPageViewVersion";

import type { ModelItem, ActiveModel } from "./types/modelTypes";

type Props = {
  tab: "active" | "upload" | "list" | "version";
  setTab: (v: "active" | "upload" | "list" | "version") => void;

  paginatedData: ModelItem[];
  models: ModelItem[];
  activeModel: ActiveModel | null;
  loading: boolean;

  search: string;
  handleSearch: (v: string) => void;

  uploadName: string;
  setUploadName: (v: string) => void;
  uploadFile: File | null;
  setUploadFile: (f: File | null) => void;
  uploadLoading: boolean;

  handleUpload: () => void;
  handleSetActive: (m: ModelItem) => void;
  handleRollback: () => void;

  canRollback: boolean;

  stats: {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
  };

  currentPage: number;
  totalPages: number;
  setCurrentPage: (p: number) => void;
};

export default function ModelsPageView(props: Props) {
  const { tab, setTab, search, handleSearch } = props;

  return (
    <Section title="🌿 Manajemen Model Klasifikasi Vegetasi">

      {/* TABS */}
      <ModelsPageViewTabs
        tab={tab}
        setTab={setTab}
        search={search}
        onSearch={handleSearch}
      />

      {/* ACTIVE */}
      {tab === "active" && (
        <ModelsPageViewActive
          activeModel={props.activeModel}
          loading={props.loading}
        />
      )}

      {/* UPLOAD */}
      {tab === "upload" && (
        <ModelsPageViewUpload
          uploadName={props.uploadName}
          setUploadName={props.setUploadName}
          uploadFile={props.uploadFile}
          setUploadFile={props.setUploadFile}
          uploadLoading={props.uploadLoading}
          handleUpload={props.handleUpload}
        />
      )}

      {/* LIST */}
      {tab === "list" && (
        <ModelsPageViewList
          paginatedData={props.paginatedData}
          stats={props.stats}
          loading={props.loading}
          currentPage={props.currentPage}
          totalPages={props.totalPages}
          setCurrentPage={props.setCurrentPage}
          handleSetActive={props.handleSetActive}
        />
      )}

      {/* VERSION */}
      {tab === "version" && (
        <ModelsPageViewVersion
          models={props.models}
          canRollback={props.canRollback}
          handleRollback={props.handleRollback}
        />
      )}

    </Section>
  );
}
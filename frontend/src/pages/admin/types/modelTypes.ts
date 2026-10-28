// path frontend/src/pages/admin/types/modelTypes.ts

// ================= REVIEW STATUS =================
export type ReviewStatus = "pending" | "approved" | "rejected";

// ================= MODEL METRICS =================
export type ModelMetrics = {
  accuracy: number | null;
  precision: number | null;
  recall: number | null;
  f1: number | null;
};

// ================= MODEL ITEM (LIST) =================
export type ModelItem = {
  id: number;
  name: string;
  version: string;
  path: string;

  review_status: ReviewStatus;
  is_active: boolean;

  created_at?: string;

  architecture?: string;

  // Metrics
  accuracy: number | null;
  precision: number | null;
  recall: number | null;
  f1: number | null;
};

// ================= ACTIVE MODEL RESPONSE =================
export type ActiveModel =
  | {
      active: null;
    }
  | (ModelItem & {
      active: true;
    });

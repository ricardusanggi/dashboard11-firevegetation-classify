// path: frontend/src/pages/admin/types/trainingTypes.ts
export interface TrainingJob {
  id: number
  started_by: number

  // TRAINING PARAMS
  architecture: string;
  epochs: number
  batch_size: number
  learning_rate: number
  optimizer: string
  loss_function: string

  augmentation: boolean
  val_split: number

  // PSO
  use_pso?: boolean
  pso_population?: number
  pso_iters?: number
  pso_best_params?: Record<string, number>
  pso_best_score?: number

  // LOSS
  best_train_loss: number | null
  best_val_loss: number | null

  // METRICS
  accuracy: number | null
  precision: number | null
  recall: number | null
  f1: number | null

  // LEGACY
  mean_iou?: number | null
  mean_dice?: number | null
  pixel_accuracy?: number | null

  // STATUS
  model_id: number | null

  review_status: "running" | "pending" | "approved" | "rejected"

  created_at: string
  updated_at: string
}

export interface TrainingStatusResponse {
  running: boolean
  job: TrainingJob | null
}

export interface PreviewSample {
  true_label: string
  predicted_label: string
  confidence: number
  image_base64: string
}

export interface PreviewData {
  summary: {
    train_loss: number
    val_loss: number
    accuracy: number
    precision: number
    recall: number
    f1: number
  }
  samples: PreviewSample[]
}

export type LabelStats = {
  total: number
  correct: number
  accuracy: number
  avgConfidence: number
}

export type LabelPreviewSectionProps = {
  label: string
  samples: PreviewSample[]
  stats: LabelStats
  warning: boolean
}

export type PreviewModalProps = {
  job: TrainingJob
  data: PreviewData | null
  loading: boolean
  onClose: () => void
}

export type StatBadgeProps = {
  value: number
  label: string
}

export type MetricsData = {
  epoch: number[]
  train_loss: number[]
  val_loss: number[]
  train_acc: number[]
  val_acc: number[]
}

export type TrainingParams = {
  architecture: string;
  epochs: number
  batch_size: number
  learning_rate: number
  optimizer: string
  loss_function: string
  augmentation: boolean
  val_split: number
  use_pso: boolean
  pso_population: number
  pso_iters: number
}
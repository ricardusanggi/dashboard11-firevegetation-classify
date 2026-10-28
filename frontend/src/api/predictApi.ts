//path: 
import api from "./api";

/* ===============================
   PREDICT IMAGE
================================ */

export async function predictImage(file: File, trueLabel?: string) {
  const form = new FormData();
  form.append("file", file);

  if (trueLabel) {
    form.append("true_label", trueLabel);
  }

  const res = await api.post("/predict/upload-image-testing", form);

  return res.data;
}

/* ===============================
   GET MODEL CLASSES
================================ */

export async function getModelClasses() {
  const res = await api.get("/predict/classes");
  return res.data;
}
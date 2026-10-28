//path:  frontend/src/pages/admin/AdminDatasetPageViewModals.tsx
import { createPortal } from "react-dom";

type Props = {
  showClassModal: boolean;
  selectedClasses: string[];
  onCloseClass: () => void;

  showTrainModal: boolean;
  trainClassNames: string[];
  onCloseTrain: () => void;
};

export default function AdminDatasetPageViewModals({
  showClassModal,
  selectedClasses,
  onCloseClass,
  showTrainModal,
  trainClassNames,
  onCloseTrain
}: Props) {
  if (!showClassModal && !showTrainModal) return null;

  return createPortal(
    <>
      {/* CLASS MODAL */}
      {showClassModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="relative bg-white dark:bg-gray-900 rounded-xl p-6 w-[420px] shadow-2xl">
            <h3 className="text-lg font-semibold mb-4">📂 Daftar Label Dataset</h3>

            {selectedClasses.length === 0 ? (
              <p className="text-sm text-gray-500">Tidak ada label.</p>
            ) : (
              <ul className="space-y-2 max-h-64 overflow-y-auto">
                {selectedClasses.map((cls, i) => (
                  <li
                    key={i}
                    className="px-3 py-2 rounded bg-gray-100 dark:bg-gray-800 text-sm"
                  >
                    {cls}
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-4 text-right">
              <button
                onClick={onCloseClass}
                className="px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TRAIN LABEL MODAL */}
      {showTrainModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="relative bg-white dark:bg-gray-900 rounded-xl p-6 w-[420px] shadow-2xl">
            <h3 className="text-lg font-semibold mb-4">📂 Label Dataset Train</h3>

            {trainClassNames.length === 0 ? (
              <p className="text-sm text-gray-500">Tidak ada label.</p>
            ) : (
              <ul className="space-y-2 max-h-64 overflow-y-auto">
                {trainClassNames.map((cls, i) => (
                  <li
                    key={i}
                    className="px-3 py-2 rounded bg-gray-100 dark:bg-gray-800 text-sm"
                  >
                    {cls}
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-4 text-right">
              <button
                onClick={onCloseTrain}
                className="px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>,
    document.body
  );
}

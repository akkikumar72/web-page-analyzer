import type { AnalysisRun } from "@/types/analysis";

const DATABASE = "trace-workspace";
const STORE = "runs";
async function database(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE, 1);
    request.onupgradeneeded = () =>
      request.result.createObjectStore(STORE, { keyPath: "id" });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(
        new Error(
          "Browser storage is unavailable. You can still export this report.",
        ),
      );
  });
}
export async function loadRuns(): Promise<AnalysisRun[]> {
  const db = await database();
  try {
    return await new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE, "readonly");
      const request = transaction.objectStore(STORE).getAll();
      request.onsuccess = () =>
        resolve(
          (request.result as AnalysisRun[]).sort((a, b) =>
            b.startedAt.localeCompare(a.startedAt),
          ),
        );
      request.onerror = () => reject(request.error);
    });
  } finally {
    db.close();
  }
}
export async function saveRun(run: AnalysisRun): Promise<void> {
  const db = await database();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE, "readwrite");
      transaction.objectStore(STORE).put(run);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () =>
        reject(
          new Error("The report could not be saved. Export it to keep a copy."),
        );
      transaction.onabort = () =>
        reject(
          new Error(
            "Storage is full or unavailable. Export this report to keep it.",
          ),
        );
    });
  } finally {
    db.close();
  }
}
export async function deleteRun(id: string): Promise<void> {
  const db = await database();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE, "readwrite");
      transaction.objectStore(STORE).delete(id);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () =>
        reject(new Error("Could not delete this report."));
    });
  } finally {
    db.close();
  }
}
export function exportRun(run: AnalysisRun) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(run, null, 2)], { type: "application/json" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = `trace-${run.id}.json`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

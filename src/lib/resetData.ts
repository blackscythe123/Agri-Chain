export function resetLocalData() {
  const keys = ["agri:batches"];
  keys.forEach(k => localStorage.removeItem(k));
}

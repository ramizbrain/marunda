/** Tauri rejects with the serialized `AppError` string; anything else is unexpected. */
export function toErrorMessage(error: unknown): string {
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  return "Something went wrong.";
}

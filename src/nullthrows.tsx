export function nullthrows<T>(value: T | null | undefined, msg?: string) {
  if (value == null) {
    throw new Error(msg ?? "nil");
  }
  return value;
}

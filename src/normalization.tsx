export function normalizeString(str: string) {
  // from: https://stackoverflow.com/questions/5700636/using-javascript-to-perform-text-matches-with-without-accented-characters
  const sinAcentos = str.normalize("NFD").replace(/\p{Diacritic}/gu, "");
  return sinAcentos.trim().toLowerCase();
}

export function aliasesForName(name: string) {
  const result = new Set(name);
  // ie, "Isla de la Piedra (Stone Island)"
  const parts = name.split("(").map((str) => str.replace(")", "").trim());
  for (const part of parts) {
    //ie, "x-cabil"
    result.add(part);
    result.add(part.replace("-", ""));
  }
  if (name === "ciudad de mexico") {
    result.add("cdmx");
  }
  return result;
}

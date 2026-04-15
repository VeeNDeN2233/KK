export type CsvRow = Record<string, string>;

function detectDelimiter(text: string) {
  const firstLine = text.split(/\r?\n/).find((l) => l.trim().length > 0) ?? "";
  const commas = (firstLine.match(/,/g) ?? []).length;
  const semis = (firstLine.match(/;/g) ?? []).length;
  return semis > commas ? ";" : ",";
}

export function parseCsv(text: string): CsvRow[] {
  const delimiter = detectDelimiter(text);
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (!lines.length) return [];

  const headers = lines[0]
    .split(delimiter)
    .map((h) => h.trim().replace(/^"|"$/g, ""));
  const rows: CsvRow[] = [];

  for (const line of lines.slice(1)) {
    const cells = line
      .split(delimiter)
      .map((c) => c.trim().replace(/^"|"$/g, ""));
    const row: CsvRow = {};
    headers.forEach((h, idx) => {
      row[h] = cells[idx] ?? "";
    });
    rows.push(row);
  }
  return rows;
}

export function toCsv(headers: string[], rows: CsvRow[], delimiter = ",") {
  const esc = (s: string) => {
    if (s.includes("\"") || s.includes(delimiter) || s.includes("\n")) {
      return `"${s.replaceAll("\"", "\"\"")}"`;
    }
    return s;
  };
  const out: string[] = [];
  out.push(headers.map(esc).join(delimiter));
  for (const r of rows) {
    out.push(headers.map((h) => esc(r[h] ?? "")).join(delimiter));
  }
  return out.join("\n") + "\n";
}


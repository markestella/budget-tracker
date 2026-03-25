import { toNumber } from '@/lib/budgets';

function escapeCsv(value: unknown) {
  const stringValue = value == null ? '' : String(value);

  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

export function buildCsv(sections: Array<{ name: string; rows: Record<string, unknown>[] }>) {
  return sections
    .map(({ name, rows }) => {
      if (rows.length === 0) {
        return `# ${name}\n`;
      }

      const headers = Array.from(
        rows.reduce<Set<string>>((accumulator, row) => {
          Object.keys(row).forEach((key) => accumulator.add(key));
          return accumulator;
        }, new Set<string>()),
      );

      const lines = [headers.join(',')];

      for (const row of rows) {
        lines.push(headers.map((header) => escapeCsv(row[header])).join(','));
      }

      return `# ${name}\n${lines.join('\n')}`;
    })
    .join('\n\n');
}

export function normalizeExportRecord<T extends Record<string, unknown>>(record: T) {
  return Object.fromEntries(
    Object.entries(record).map(([key, value]) => {
      if (value instanceof Date) {
        return [key, value.toISOString()];
      }

      if (typeof value === 'object' && value !== null && 'toString' in value) {
        const asString = value.toString();
        const asNumber = Number(asString);
        return [key, Number.isFinite(asNumber) ? toNumber(asString) : asString];
      }

      return [key, value];
    }),
  );
}
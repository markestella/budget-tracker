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

export async function buildPdf(sections: Array<{ name: string; rows: Record<string, unknown>[] }>) {
  const { default: jsPDF } = await import('jspdf');
  const doc = new jsPDF();
  let y = 20;

  doc.setFontSize(18);
  doc.text('MoneyQuest — Financial Export', 14, y);
  y += 8;

  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, y);
  doc.setTextColor(0);
  y += 12;

  for (const section of sections) {
    if (y > 260) {
      doc.addPage();
      y = 20;
    }

    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text(section.name, 14, y);
    y += 7;

    if (section.rows.length === 0) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text('No data', 14, y);
      y += 10;
      continue;
    }

    const headers = Array.from(
      section.rows.reduce<Set<string>>((acc, row) => {
        Object.keys(row).forEach((k) => acc.add(k));
        return acc;
      }, new Set<string>()),
    );

    const colWidth = Math.min(40, (180 / headers.length));

    // Header row
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    headers.forEach((h, i) => {
      doc.text(h, 14 + i * colWidth, y, { maxWidth: colWidth - 2 });
    });
    y += 5;

    // Data rows
    doc.setFont('helvetica', 'normal');
    for (const row of section.rows) {
      if (y > 275) {
        doc.addPage();
        y = 20;
      }
      headers.forEach((h, i) => {
        const val = row[h] == null ? '' : String(row[h]);
        doc.text(val.slice(0, 30), 14 + i * colWidth, y, { maxWidth: colWidth - 2 });
      });
      y += 4.5;
    }
    y += 8;
  }

  return doc.output('blob');
}
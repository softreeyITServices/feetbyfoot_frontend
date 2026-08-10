import * as XLSX from "xlsx";
import Papa from "papaparse";

export interface ExportDataPayload {
  metricName: string;
  value: string;
  previousValue?: string;
  changePercent?: string;
  dateRange: string;
  items?: Record<string, any>[];
}

/**
 * Downloads single metric or Product List as Excel (.xlsx)
 */
export function exportToExcel(payload: ExportDataPayload) {
  try {
    const sanitizeName = payload.metricName.replace(/[^a-zA-Z0-9]/g, "_");
    const fileName = `${sanitizeName}_${payload.dateRange.replace(/[^a-zA-Z0-9]/g, "-")}.xlsx`;

    const mainSheetRows: Record<string, any>[] = [
      { Field: "Metric Name", Value: payload.metricName },
      { Field: "Date Range", Value: payload.dateRange },
      { Field: "Current Total Value", Value: payload.value },
      ...(payload.previousValue ? [{ Field: "Previous Period Value", Value: payload.previousValue }] : []),
      ...(payload.changePercent ? [{ Field: "Change Percent", Value: payload.changePercent }] : []),
      { Field: "Export Date", Value: new Date().toLocaleString() },
    ];

    const workbook = XLSX.utils.book_new();

    if (payload.items && payload.items.length > 0) {
      const combinedRows: any[] = [];
      mainSheetRows.forEach((r) => combinedRows.push(r));
      combinedRows.push({});

      const reportSheet = XLSX.utils.json_to_sheet(combinedRows);
      XLSX.utils.sheet_add_json(reportSheet, payload.items, { origin: "A9" });
      XLSX.utils.book_append_sheet(workbook, reportSheet, "Report Summary & List");

      const detailsSheet = XLSX.utils.json_to_sheet(payload.items);
      XLSX.utils.book_append_sheet(workbook, detailsSheet, "Detailed Items Only");
    } else {
      const summarySheet = XLSX.utils.json_to_sheet(mainSheetRows);
      XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");
    }

    XLSX.writeFile(workbook, fileName);
  } catch (err) {
    console.error("Excel export error:", err);
    alert("Failed to export Excel file. Please try again.");
  }
}

/**
 * Downloads single metric or Product List as CSV (.csv)
 */
export function exportToCSV(payload: ExportDataPayload) {
  try {
    const sanitizeName = payload.metricName.replace(/[^a-zA-Z0-9]/g, "_");
    const fileName = `${sanitizeName}_${payload.dateRange.replace(/[^a-zA-Z0-9]/g, "-")}.csv`;

    let csvContent = "\uFEFF"; // UTF-8 BOM for Excel / Windows compatibility

    csvContent += `METRIC REPORT: ${payload.metricName.toUpperCase()}\n`;
    csvContent += `Date Range,"${payload.dateRange}"\n`;
    csvContent += `Current Total Value,"${payload.value.replace(/"/g, '""')}"\n`;
    if (payload.previousValue) csvContent += `Previous Value,"${payload.previousValue.replace(/"/g, '""')}"\n`;
    if (payload.changePercent) csvContent += `Change %,"${payload.changePercent}"\n`;
    csvContent += `Generated At,"${new Date().toLocaleString()}"\n\n`;

    if (payload.items && payload.items.length > 0) {
      csvContent += `--- DETAILED BREAKDOWN LIST ---\n`;
      const itemsCsv = Papa.unparse(payload.items);
      csvContent += itemsCsv;
    }

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 200);
  } catch (err) {
    console.error("CSV export error:", err);
    alert("Failed to export CSV file. Please try again.");
  }
}

/**
 * Downloads single metric or Product List as PDF (.pdf) via invisible iframe stream (Bypasses popup blockers!)
 */
export function exportToPDF(payload: ExportDataPayload) {
  try {
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    iframe.style.visibility = "hidden";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      alert("Unable to generate PDF document stream.");
      return;
    }

    let tableHtml = "";
    if (payload.items && payload.items.length > 0) {
      const headers = Object.keys(payload.items[0]);
      tableHtml = `
        <div style="margin-top: 25px;">
          <h3 style="font-size: 13px; text-transform: uppercase; color: #334155; letter-spacing: 0.5px; margin-bottom: 12px;">Itemized Breakdown List (${payload.items.length} records)</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
            <thead>
              <tr style="background-color: #f1f5f9; text-align: left; color: #334155;">
                ${headers.map((h) => `<th style="padding: 8px 10px; border: 1px solid #cbd5e1; font-weight: 600;">${h}</th>`).join("")}
              </tr>
            </thead>
            <tbody>
              ${payload.items
                .map(
                  (row, i) => `
                <tr style="background-color: ${i % 2 === 0 ? "#ffffff" : "#f8fafc"}; color: #1e293b;">
                  ${headers.map((h) => `<td style="padding: 7px 10px; border: 1px solid #e2e8f0;">${row[h] ?? "-"}</td>`).join("")}
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </div>
      `;
    }

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${payload.metricName} Report - ${payload.dateRange}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              margin: 0;
              padding: 24px;
              color: #1e293b;
              background: #fff;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 2px solid #e2e8f0;
              padding-bottom: 14px;
              margin-bottom: 20px;
            }
            .logo {
              font-size: 20px;
              font-weight: 800;
              color: #0f172a;
              letter-spacing: -0.5px;
            }
            .tag {
              background: #fef3c7;
              color: #92400e;
              font-weight: 700;
              font-size: 12px;
              padding: 4px 12px;
              border-radius: 9999px;
              text-transform: uppercase;
            }
            .summary-card {
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 10px;
              padding: 16px 20px;
              margin-bottom: 20px;
            }
            .metric-title {
              font-size: 11px;
              font-weight: 700;
              color: #64748b;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .metric-value {
              font-size: 26px;
              font-weight: 800;
              color: #0f172a;
              margin: 4px 0;
            }
            .meta-info {
              font-size: 11px;
              color: #64748b;
            }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">FeetByFoot Financial & Operational Report</div>
              <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Filtered Date Window: ${payload.dateRange}</div>
            </div>
            <div>
              <span class="tag">${payload.metricName}</span>
            </div>
          </div>

          <div class="summary-card">
            <div class="metric-title">${payload.metricName} Total</div>
            <div class="metric-value">${payload.value}</div>
            <div class="meta-info">
              ${payload.previousValue ? `Previous Period: <b>${payload.previousValue}</b> &nbsp;|&nbsp; ` : ""}
              ${payload.changePercent ? `Change: <b>${payload.changePercent}</b> &nbsp;|&nbsp; ` : ""}
              Generated: <b>${new Date().toLocaleString()}</b>
            </div>
          </div>

          ${tableHtml}
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    }, 250);
  } catch (err) {
    console.error("PDF export error:", err);
    alert("Failed to generate PDF. Please try again.");
  }
}

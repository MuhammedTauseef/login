// src/app/api/employees/export/route.js

import db from '@/lib/db';
import ExcelJS from 'exceljs';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const [rows] = await db.query('SELECT * FROM employees');

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'No employees to export' },
        { status: 400 }
      );
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Employees');

    // Add header row
    const headerRow = worksheet.addRow(Object.keys(rows[0]));
    headerRow.eachCell((cell) => {
      cell.font = { bold: true };
    });

    // Add data rows
    rows.forEach((row) => {
      worksheet.addRow(Object.values(row));
    });

    // Adjust column widths
    worksheet.columns.forEach((column) => {
      column.width = 20;
    });

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Set headers for file download
    return new NextResponse(buffer, {
      headers: {
        'Content-Disposition': 'attachment; filename=employees.xlsx',
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    });
  } catch (error) {
    console.error('Error exporting employees:', error);
    return NextResponse.json(
      { error: 'Error exporting employees' },
      { status: 500 }
    );
  }
}

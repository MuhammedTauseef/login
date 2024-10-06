// src/app/api/employees/exportPdf/route.js

import db from '@/lib/db';
import PDFDocument from 'pdfkit';
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

    const doc = new PDFDocument({ margin: 30 });
    const chunks = [];

    return new Promise((resolve, reject) => {
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => {
        const pdfData = Buffer.concat(chunks);
        const response = new NextResponse(pdfData, {
          headers: {
            'Content-Disposition': 'attachment; filename=employees.pdf',
            'Content-Type': 'application/pdf',
          },
        });
        resolve(response);
      });
      doc.on('error', (err) => {
        console.error('Error generating PDF:', err);
        reject(
          NextResponse.json({ error: 'Error generating PDF' }, { status: 500 })
        );
      });

      // Add content to the PDF
      doc.fontSize(18).text('Employees', { align: 'center' });
      doc.moveDown();

      // Table headers
      const headers = Object.keys(rows[0]);
      const tableTop = doc.y;
      const itemIncrement = 20;
      let y = tableTop;

      doc.fontSize(12);
      headers.forEach((header, i) => {
        doc.text(header, 50 + i * 100, y);
      });

      y += itemIncrement;

      // Data rows
      rows.forEach((row) => {
        headers.forEach((header, i) => {
          const text = row[header] !== null ? row[header].toString() : '';
          doc.text(text, 50 + i * 100, y);
        });
        y += itemIncrement;
      });

      // Finalize the PDF and end the stream
      doc.end();
    });
  } catch (error) {
    console.error('Error exporting employees:', error);
    return NextResponse.json(
      { error: 'Error exporting employees' },
      { status: 500 }
    );
  }
}

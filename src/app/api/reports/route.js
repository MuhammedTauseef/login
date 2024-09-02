import { NextResponse } from 'next/server';
import db from '@/lib/db';

// GET request - Fetch all reports
export async function GET() {
  try {
    const [rows] = await db.query('SELECT * FROM reports');
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.error(new Error('Failed to fetch reports'));
  }
}

// POST request - Add new report
export async function POST(req) {
  const { employeeName, employeeId, reportTitle, reportDescription, reportDate } = await req.json();

  if (
    !employeeName || typeof employeeName !== 'string' ||
    !employeeId || isNaN(Number(employeeId)) ||
    !reportTitle || typeof reportTitle !== 'string' ||
    !reportDescription || typeof reportDescription !== 'string'
  ) {
    return NextResponse.error(new Error('Validation failed: Invalid data'), { status: 400 });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO reports (employeeName, employeeId, reportTitle, reportDescription, reportDate) VALUES (?, ?, ?, ?, ?)',
      [employeeName, employeeId, reportTitle, reportDescription, reportDate]
    );
    const insertedReport = {
      id: result.insertId,
      employeeName,
      employeeId,
      reportTitle,
      reportDescription,
      reportDate,
    };
    return NextResponse.json(insertedReport, { status: 201 });
  } catch (error) {
    return NextResponse.error(new Error('Failed to add report'));
  }
}

// PUT request - Update an existing report
export async function PUT(req) {
  const id = req.nextUrl.searchParams.get('id');
  const { employeeName, employeeId, reportTitle, reportDescription, reportDate } = await req.json();

  if (
    !employeeName || typeof employeeName !== 'string' ||
    !employeeId || isNaN(Number(employeeId)) ||
    !reportTitle || typeof reportTitle !== 'string' ||
    !reportDescription || typeof reportDescription !== 'string'
  ) {
    return NextResponse.error(new Error('Validation failed: Invalid data'), { status: 400 });
  }

  try {
    await db.query(
      'UPDATE reports SET employeeName = ?, employeeId = ?, reportTitle = ?, reportDescription = ?, reportDate = ? WHERE id = ?',
      [employeeName, employeeId, reportTitle, reportDescription, reportDate, id]
    );
    return NextResponse.json({
      id: parseInt(id),
      employeeName,
      employeeId,
      reportTitle,
      reportDescription,
      reportDate,
    });
  } catch (error) {
    return NextResponse.error(new Error('Failed to update report'));
  }
}

// DELETE request - Delete a report
export async function DELETE(req) {
  const id = req.nextUrl.searchParams.get('id');
  
  if (!id) {
    return NextResponse.error(new Error('No ID provided'), { status: 400 });
  }

  try {
    const [result] = await db.query('DELETE FROM reports WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return NextResponse.error(new Error('Report not found or already deleted'), { status: 404 });
    }

    return NextResponse.json({ message: 'Report deleted successfully', id }, { status: 200 });
  } catch (error) {
    return NextResponse.error(new Error('Failed to delete report'));
  }
}

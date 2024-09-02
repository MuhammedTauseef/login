import { NextResponse } from 'next/server';
import db from '@/lib/db';

// GET /api/attendance
export async function GET(request) {
  try {
    const [rows] = await db.query('SELECT * FROM attendance');
    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/attendance
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      employeeCode,
      name,
      designation,
      cnic,
      bps,
      checkIn,
      checkOut,
      status,
    } = body;

    // BPS validation
    if (isNaN(bps) || bps < 1 || bps > 22) {
      return NextResponse.json({ error: 'BPS must be a number between 1 and 22' }, { status: 400 });
    }

    const [result] = await db.query(
      'INSERT INTO attendance (employeeCode, name, designation, cnic, bps, checkIn, checkOut, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [employeeCode, name, designation, cnic, bps, checkIn, checkOut, status]
    );

    const newRecord = {
      id: result.insertId,
      employeeCode,
      name,
      designation,
      cnic,
      bps,
      checkIn,
      checkOut,
      status,
    };

    return NextResponse.json(newRecord, { status: 201 });
  } catch (error) {
    console.error('Error creating attendance record:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT /api/attendance/[id]
export async function PUT(request) {
  try {
    const id = request.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const {
      employeeCode,
      name,
      designation,
      cnic,
      bps,
      checkIn,
      checkOut,
      status,
    } = body;

    // BPS validation
    if (isNaN(bps) || bps < 1 || bps > 22) {
      return NextResponse.json({ error: 'BPS must be a number between 1 and 22' }, { status: 400 });
    }

    const [result] = await db.query(
      'UPDATE attendance SET employeeCode = ?, name = ?, designation = ?, cnic = ?, bps = ?, checkIn = ?, checkOut = ?, status = ? WHERE id = ?',
      [employeeCode, name, designation, cnic, bps, checkIn, checkOut, status, id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }

    const updatedRecord = {
      id,
      employeeCode,
      name,
      designation,
      cnic,
      bps,
      checkIn,
      checkOut,
      status,
    };
    return NextResponse.json(updatedRecord, { status: 200 });
  } catch (error) {
    console.error('Error updating attendance record:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE /api/attendance/[id]
export async function DELETE(request) {
  try {
    const id = request.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const [result] = await db.query(`DELETE FROM attendance WHERE id = ?`, [id]);

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Record deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting attendance record:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

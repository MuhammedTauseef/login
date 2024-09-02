import { NextResponse } from 'next/server';
import db from '@/lib/db';

// GET all leave requests
export async function GET() {
  try {
    const [leaveRequests] = await db.query('SELECT * FROM leaves');
    return NextResponse.json(leaveRequests);
  } catch (error) {
    console.error('Error retrieving leave requests:', error);
    return NextResponse.error('Error retrieving leave requests', { status: 500 });
  }
}

// POST new leave request
export async function POST(request) {
  try {
    const leaveRequest = await request.json();
    const { employee_code, name, start_date, end_date, type } = leaveRequest;
    await db.query(
      'INSERT INTO leaves (employee_code, name, start_date, end_date, type) VALUES (?, ?, ?, ?, ?)',
      [employee_code, name, start_date, end_date, type]
    );
    return NextResponse.json({ message: 'Leave request added successfully' });
  } catch (error) {
    console.error('Error adding leave request:', error);
    return NextResponse.error('Error adding leave request', { status: 500 });
  }
}

// PUT update leave request
export async function PUT(request) {
  try {
    const leaveRequest = await request.json();
    const { id, employee_code, name, start_date, end_date, type, status } = leaveRequest;
    await db.query(
      'UPDATE leaves SET employee_code = ?, name = ?, start_date = ?, end_date = ?, type = ?, status = ? WHERE id = ?',
      [employee_code, name, start_date, end_date, type, status, id]
    );
    return NextResponse.json({ message: 'Leave request updated successfully' });
  } catch (error) {
    console.error('Error updating leave request:', error);
    return NextResponse.error('Error updating leave request', { status: 500 });
  }
}

// DELETE leave request
export async function DELETE(request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    if (!id) {
      return NextResponse.error('ID parameter is missing', { status: 400 });
    }
    await db.query('DELETE FROM leaves WHERE id = ?', [id]);
    return NextResponse.json({ message: 'Leave request deleted successfully' });
  } catch (error) {
    console.error('Error deleting leave request:', error);
    return NextResponse.error('Error deleting leave request', { status: 500 });
  }
}

// PATCH update leave status
export async function PATCH(request) {
  try {
    const { id, status } = await request.json();
    await db.query('UPDATE leaves SET status = ? WHERE id = ?', [status, id]);
    return NextResponse.json({ message: `Leave request ${status.toLowerCase()} successfully` });
  } catch (error) {
    console.error('Error updating leave status:', error);
    return NextResponse.error('Error updating leave status', { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import db from '@/lib/db';

// GET /api/employees
export async function GET(request) {
  try {
    const [rows] = await db.query('SELECT * FROM employees');
    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/employees
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, code, designation, bps } = body;

    const [result] = await db.query(
      'INSERT INTO employees (name, code, designation, bps) VALUES (?, ?, ?, ?)',
      [name, code, designation, bps]
    );

    const newEmployee = {
      id: result.insertId,
      name,
      code,
      designation,
      bps,
    };

    return NextResponse.json(newEmployee, { status: 201 });
  } catch (error) {
    console.error('Error creating employee:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT /api/employees
export async function PUT(request) {
  try {
    const id = request.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const { name, code, designation, bps } = body;

    const [result] = await db.query(
      'UPDATE employees SET name = ?, code = ?, designation = ?, bps = ? WHERE id = ?',
      [name, code, designation, bps, id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }

    const updatedEmployee = {
      id,
      name,
      code,
      designation,
      bps,
    };

    return NextResponse.json(updatedEmployee, { status: 200 });
  } catch (error) {
    console.error('Error updating employee:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE /api/employees
export async function DELETE(request) {
  try {
    const id = request.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const [result] = await db.query('DELETE FROM employees WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Employee deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting employee:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

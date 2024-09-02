import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import db from '@/lib/db'; // Adjust the path if necessary
import { ResultSetHeader } from 'mysql2';

// POST /api/holidays
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, date }: { name: string; date: string } = body;

    if (!name || !date) {
      return NextResponse.json({ error: 'Name and date are required' }, { status: 400 });
    }

    const [result] = await db.query<ResultSetHeader>(
      'INSERT INTO holidays (name, date) VALUES (?, ?)',
      [name, date]
    );

    const newHoliday = {
      id: result.insertId,
      name,
      date,
    };

    return NextResponse.json(newHoliday, { status: 201 });
  } catch (error) {
    console.error('Error creating holiday:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// GET /api/holidays
export async function GET() {
  try {
    const [rows] = await db.query('SELECT * FROM holidays');
    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    console.error('Error fetching holidays:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE /api/holidays/[id]
export async function DELETE(request: NextRequest) {
    try {
      const url = new URL(request.url);
      const id = url.pathname.split('/').pop(); // Extract ID from URL path
  
      if (!id) {
        return NextResponse.json({ error: 'Holiday ID is required' }, { status: 400 });
      }
  
      const [result] = await db.query<ResultSetHeader>(
        'DELETE FROM holidays WHERE id = ?',
        [id]
      );
  
      if (result.affectedRows === 0) {
        return NextResponse.json({ error: 'Holiday not found' }, { status: 404 });
      }
  
      return NextResponse.json({ message: 'Holiday deleted successfully' }, { status: 200 });
    } catch (error) {
      console.error('Error deleting holiday:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }
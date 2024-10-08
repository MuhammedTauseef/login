// app/api/holidays/bulk-delete/route.ts
import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ids } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });
    }

    const numericIds = ids
      .map((id: any) => Number(id))
      .filter((id) => !isNaN(id));

    if (numericIds.length === 0) {
      return NextResponse.json({ message: 'No valid IDs provided' }, { status: 400 });
    }

    const placeholders = numericIds.map(() => '?').join(',');
    const query = `DELETE FROM holidays WHERE HOLIDAYID IN (${placeholders})`;

    await db.execute(query, numericIds);

    return NextResponse.json({ message: 'Holidays deleted successfully' });
  } catch (error) {
    console.error('Error handling bulk delete:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

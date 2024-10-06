// /app/api/attendance/bulk-delete/route.ts
import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { ids }: { ids: number[] } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'No IDs provided' }, { status: 400 });
    }

    const [result] = await db.query('DELETE FROM CHECKINOUT WHERE ID IN (?)', [ids]);

    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ error: 'No records deleted' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Records deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error bulk deleting records:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// app/api/holidays/[id]/route.js
import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function PUT(request, { params }) {
  const { id } = params;

  try {
    const body = await request.json();
    const {
      HOLIDAYNAME,
      HOLIDAYYEAR,
      HOLIDAYMONTH,
      HOLIDAYDAY,
      STARTTIME,
      DURATION,
      HOLIDAYTYPE,
      XINBIE,
      MINZU,
      DeptID,
      timezone,
    } = body;

    await db.query(
      'UPDATE holidays SET HOLIDAYNAME = ?, HOLIDAYYEAR = ?, HOLIDAYMONTH = ?, HOLIDAYDAY = ?, STARTTIME = ?, DURATION = ?, HOLIDAYTYPE = ?, XINBIE = ?, MINZU = ?, DeptID = ?, timezone = ? WHERE HOLIDAYID = ?',
      [
        HOLIDAYNAME,
        HOLIDAYYEAR,
        HOLIDAYMONTH,
        HOLIDAYDAY,
        STARTTIME,
        DURATION,
        HOLIDAYTYPE,
        XINBIE,
        MINZU,
        DeptID,
        timezone,
        id,
      ]
    );

    // Fetch the updated holiday
    const [rows] = await db.query('SELECT * FROM holidays WHERE HOLIDAYID = ?', [id]);
    const updatedHoliday = rows[0];

    return NextResponse.json(updatedHoliday);
  } catch (error) {
    console.error('Error updating holiday:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const { id } = params;

  try {
    await db.query('DELETE FROM holidays WHERE HOLIDAYID = ?', [id]);
    return NextResponse.json({ message: 'Holiday deleted successfully' });
  } catch (error) {
    console.error('Error deleting holiday:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

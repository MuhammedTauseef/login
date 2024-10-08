// app/api/holidays/bulk-import/route.ts
import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(request: Request) {
  try {
    const holidays = await request.json();

    if (!Array.isArray(holidays)) {
      return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });
    }

    const values = holidays.map((holiday) => [
      holiday.HOLIDAYID,
      holiday.HOLIDAYNAME,
      holiday.HOLIDAYYEAR,
      holiday.HOLIDAYMONTH,
      holiday.HOLIDAYDAY,
      holiday.STARTTIME,
      holiday.DURATION,
      holiday.HOLIDAYTYPE,
      holiday.XINBIE,
      holiday.MINZU,
      holiday.DeptID,
      holiday.timezone,
    ]);

    if (values.length > 0) {
      await db.query(
        'INSERT INTO holidays (HOLIDAYID, HOLIDAYNAME, HOLIDAYYEAR, HOLIDAYMONTH, HOLIDAYDAY, STARTTIME, DURATION, HOLIDAYTYPE, XINBIE, MINZU, DeptID, timezone) VALUES ?',
        [values]
      );
    }

    return NextResponse.json({ message: 'Holidays imported successfully' }, { status: 201 });
  } catch (error) {
    console.error('Error handling bulk import:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

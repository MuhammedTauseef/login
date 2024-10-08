// app/api/holidays/route.js
import { NextResponse } from 'next/server';
import db from '@/lib/db';

/**
 * Handles GET requests to fetch all holidays.
 */
export async function GET() {
  try {
    const [rows] = await db.query('SELECT * FROM holidays');
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching holidays:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

/**
 * Handles POST requests to add a new holiday.
 * @param {Request} request - The incoming request object.
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      HOLIDAYID,
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

    // Insert the new holiday into the database
    await db.query(
      `INSERT INTO holidays (
        HOLIDAYID, 
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
        timezone
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        HOLIDAYID,
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
      ]
    );

    // Fetch the newly inserted holiday
    const [rows] = await db.query(
      'SELECT * FROM holidays WHERE HOLIDAYID = ?',
      [HOLIDAYID]
    );
    const insertedHoliday = rows[0];

    return NextResponse.json(insertedHoliday, { status: 201 });
  } catch (error) {
    console.error('Error adding holiday:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

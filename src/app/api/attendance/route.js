// /app/api/attendance/route.js
import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const [rows] = await db.query('SELECT * FROM CHECKINOUT ORDER BY CHECKTIME DESC');
    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    console.error('Error fetching attendance data:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const newRecord = await request.json();

    // Validate required fields
    if (!newRecord.USERID || !newRecord.CHECKTIME || !newRecord.CHECKTYPE) {
      return NextResponse.json(
        { error: 'Required fields are missing' },
        { status: 400 }
      );
    }

    const [result] = await db.query(
      `INSERT INTO CHECKINOUT 
        (USERID, CHECKTIME, CHECKTYPE, VERIFYCODE, SENSORID, Memoinfo, WorkCode, sn, UserExtFmt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newRecord.USERID,
        newRecord.CHECKTIME,
        newRecord.CHECKTYPE,
        newRecord.VERIFYCODE,
        newRecord.SENSORID,
        newRecord.Memoinfo,
        newRecord.WorkCode,
        newRecord.sn,
        newRecord.UserExtFmt,
      ]
    );

    const insertedId = result.insertId;
    const [newEntry] = await db.query('SELECT * FROM CHECKINOUT WHERE ID = ?', [insertedId]);

    return NextResponse.json(newEntry[0], { status: 201 });
  } catch (error) {
    console.error('Error creating attendance record:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

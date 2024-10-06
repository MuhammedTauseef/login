// /app/api/attendance/import/route.ts
import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import * as XLSX from 'xlsx';

interface AttendanceRecord {
  USERID?: string;
  CHECKTIME?: string;
  CHECKTYPE?: string;
  VERIFYCODE?: string;
  SENSORID?: string;
  Memoinfo?: string;
  WorkCode?: string;
  sn?: string;
  UserExtFmt?: string;
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { error: 'Invalid content type' },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(new Uint8Array(buffer), { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data: AttendanceRecord[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });

    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      for (const row of data) {
        const {
          USERID,
          CHECKTIME,
          CHECKTYPE,
          VERIFYCODE,
          SENSORID,
          Memoinfo,
          WorkCode,
          sn,
          UserExtFmt,
        } = row;

        // Validate required fields
        if (!USERID || !CHECKTIME || !CHECKTYPE) {
          throw new Error('Required fields are missing in one or more rows');
        }

        await connection.query(
          `INSERT INTO CHECKINOUT 
            (USERID, CHECKTIME, CHECKTYPE, VERIFYCODE, SENSORID, Memoinfo, WorkCode, sn, UserExtFmt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            USERID,
            CHECKTIME,
            CHECKTYPE,
            VERIFYCODE,
            SENSORID,
            Memoinfo,
            WorkCode,
            sn,
            UserExtFmt,
          ]
        );
      }

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      console.error('Error importing data:', error);
      return NextResponse.json(
        { error: 'Error importing data' },
        { status: 500 }
      );
    } finally {
      connection.release();
    }

    // Fetch the updated data
    const [rows] = await db.query(
      'SELECT * FROM CHECKINOUT ORDER BY CHECKTIME DESC'
    );

    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    console.error('Error importing data:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

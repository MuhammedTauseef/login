// /app/api/leave/import/route.ts
import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import * as XLSX from 'xlsx';

interface LeaveRecord {
  LeaveName: string;
  MinUnit: number;
  Unit: number;
  RemaindProc?: string;
  RemaindCount?: number;
  ReportSymbol?: string;
  Deduct?: boolean;
  Color?: string;
  Classify?: string;
  Code?: string;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: 'No file uploaded or file is not valid.' },
        { status: 400 }
      );
    }

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data: LeaveRecord[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });

    // Validate and prepare data for insertion
    const values = data.map((record, index) => {
      const {
        LeaveName,
        MinUnit,
        Unit,
        RemaindProc = '',
        RemaindCount = 0,
        ReportSymbol = '',
        Deduct = false,
        Color = '#FFFFFF',
        Classify = '',
        Code = '',
      } = record;

      if (!LeaveName || typeof MinUnit !== 'number' || typeof Unit !== 'number') {
        throw new Error(`Missing required fields in row ${index + 2}`);
      }

      return [
        LeaveName,
        MinUnit,
        Unit,
        RemaindProc,
        RemaindCount,
        ReportSymbol,
        Deduct,
        Color,
        Classify,
        Code,
      ];
    });

    // Bulk insert into the database
    const sql = `INSERT INTO leaves 
      (LeaveName, MinUnit, Unit, RemaindProc, RemaindCount, ReportSymbol, Deduct, Color, Classify, Code) 
      VALUES ?`;

    await db.query(sql, [values]);

    // Fetch the updated data
    const [rows] = await db.query('SELECT * FROM leaves ORDER BY LeaveId DESC');

    return NextResponse.json(rows, { status: 200 });
  } catch (error: any) {
    console.error('Error importing leave data:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

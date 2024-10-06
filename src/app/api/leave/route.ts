// /app/api/leave/route.ts

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import * as XLSX from 'xlsx';
import { RowDataPacket, OkPacket } from 'mysql2';

// Define the structure of a Leave record
interface LeaveRecord {
  LeaveId?: number; // Optional for new records
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
  Status?: string;
}

// Utility function to validate LeaveRecord
const validateLeaveRecord = (record: any, index: number): LeaveRecord => {
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
    Status = 'Pending',
  } = record;

  if (!LeaveName || typeof LeaveName !== 'string') {
    throw new Error(`Invalid or missing 'LeaveName' in row ${index + 2}`);
  }

  if (typeof MinUnit !== 'number' || isNaN(MinUnit)) {
    throw new Error(`Invalid or missing 'MinUnit' in row ${index + 2}`);
  }

  if (typeof Unit !== 'number' || isNaN(Unit)) {
    throw new Error(`Invalid or missing 'Unit' in row ${index + 2}`);
  }

  return {
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
    Status,
  };
};

// GET Handler: Fetch all leaves or export as XLSX
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  try {
    if (action === 'export') {
      // Fetch leave data from the database with correct typing
      const [rows] = await db.query<RowDataPacket[]>('SELECT * FROM leaves ORDER BY LeaveId DESC');

      // Convert data to XLSX format
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(rows);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Leaves');

      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      // Return the XLSX file as a downloadable response
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Disposition': `attachment; filename="leaves_export_${new Date().toISOString().split('T')[0]}.xlsx"`,
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
      });
    } else {
      // Fetch and return all leave records as JSON with correct typing
      const [rows] = await db.query<RowDataPacket[]>('SELECT * FROM leaves');
      return NextResponse.json(rows);
    }
  } catch (error: any) {
    console.error('Error in GET /api/leave:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// POST Handler: Add a new leave or import leaves from XLSX
export async function POST(request: NextRequest) {
  const contentType = request.headers.get('Content-Type') || '';

  if (contentType.includes('multipart/form-data')) {
    // Handle XLSX Import
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

      if (data.length === 0) {
        throw new Error('Uploaded XLSX file is empty.');
      }

      // Validate and prepare data for insertion
      const values = data.map((record, index) => {
        const validatedRecord = validateLeaveRecord(record, index);
        const {
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
          Status,
        } = validatedRecord;

        return [
          LeaveName,
          MinUnit,
          Unit,
          RemaindProc,
          RemaindCount,
          ReportSymbol,
          Deduct ? 1 : 0, // Assuming Deduct is stored as TINYINT(1) in DB
          Color,
          Classify,
          Code,
          Status,
        ];
      });

      // Bulk insert into the database
      const sql = `INSERT INTO leaves 
        (LeaveName, MinUnit, Unit, RemaindProc, RemaindCount, ReportSymbol, Deduct, Color, Classify, Code, Status) 
        VALUES ?`;

      const [result] = await db.query<OkPacket>(sql, [values]);

      // Optionally, you can check result.affectedRows or other properties
      console.log(`Inserted ${result.affectedRows} rows`);

      // Fetch the updated data
      const [rows] = await db.query<RowDataPacket[]>('SELECT * FROM leaves ORDER BY LeaveId DESC');

      return NextResponse.json(rows, { status: 200 });
    } catch (error: any) {
      console.error('Error importing leave data:', error);
      return NextResponse.json(
        { error: error.message || 'Internal Server Error' },
        { status: 500 }
      );
    }
  } else {
    // Handle single leave addition
    try {
      const leaveRequest = await request.json();
      const {
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
      } = leaveRequest;

      // Basic validation
      if (!LeaveName || typeof LeaveName !== 'string') {
        return NextResponse.json(
          { error: 'Missing or invalid required field: LeaveName' },
          { status: 400 }
        );
      }

      if (typeof MinUnit !== 'number' || isNaN(MinUnit)) {
        return NextResponse.json(
          { error: 'Missing or invalid required field: MinUnit' },
          { status: 400 }
        );
      }

      if (typeof Unit !== 'number' || isNaN(Unit)) {
        return NextResponse.json(
          { error: 'Missing or invalid required field: Unit' },
          { status: 400 }
        );
      }

      // Insert the new leave into the database
      const insertSql = `INSERT INTO leaves 
        (LeaveName, MinUnit, Unit, RemaindProc, RemaindCount, ReportSymbol, Deduct, Color, Classify, Code, Status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

      const insertValues = [
        LeaveName,
        MinUnit,
        Unit,
        RemaindProc || '',
        RemaindCount || 0,
        ReportSymbol || '',
        Deduct ? 1 : 0, // Assuming Deduct is stored as TINYINT(1) in DB
        Color || '#FFFFFF',
        Classify || '',
        Code || '',
        'Pending', // Default status
      ];

      const [result] = await db.query<OkPacket>(insertSql, insertValues);

      // Optionally, you can check result.insertId or other properties
      console.log(`Inserted leave with ID ${result.insertId}`);

      return NextResponse.json({ message: 'Leave added successfully', LeaveId: result.insertId }, { status: 201 });
    } catch (error: any) {
      console.error('Error adding leave:', error);
      return NextResponse.json(
        { error: `Error adding leave: ${error.message}` },
        { status: 500 }
      );
    }
  }
}

// PUT Handler: Update an existing leave
export async function PUT(request: NextRequest) {
  try {
    const leaveRequest = await request.json();
    const {
      LeaveId,
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
      Status,
    } = leaveRequest;

    // Validation
    if (typeof LeaveId !== 'number' || isNaN(LeaveId)) {
      return NextResponse.json(
        { error: 'Invalid or missing LeaveId for updating a leave.' },
        { status: 400 }
      );
    }

    if (!LeaveName || typeof LeaveName !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid required field: LeaveName' },
        { status: 400 }
      );
    }

    if (typeof MinUnit !== 'number' || isNaN(MinUnit)) {
      return NextResponse.json(
        { error: 'Missing or invalid required field: MinUnit' },
        { status: 400 }
      );
    }

    if (typeof Unit !== 'number' || isNaN(Unit)) {
      return NextResponse.json(
        { error: 'Missing or invalid required field: Unit' },
        { status: 400 }
      );
    }

    // Optional fields can have defaults or be set to existing values
    const updatedStatus = Status && typeof Status === 'string' ? Status : 'Pending';

    const updateSql = `UPDATE leaves SET 
      LeaveName = ?, 
      MinUnit = ?, 
      Unit = ?, 
      RemaindProc = ?, 
      RemaindCount = ?, 
      ReportSymbol = ?, 
      Deduct = ?, 
      Color = ?, 
      Classify = ?, 
      Code = ?, 
      Status = ?
    WHERE LeaveId = ?`;

    const updateValues = [
      LeaveName,
      MinUnit,
      Unit,
      RemaindProc || '',
      RemaindCount || 0,
      ReportSymbol || '',
      Deduct ? 1 : 0, // Assuming Deduct is stored as TINYINT(1) in DB
      Color || '#FFFFFF',
      Classify || '',
      Code || '',
      updatedStatus,
      LeaveId,
    ];

    const [result] = await db.query<OkPacket>(updateSql, updateValues);

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: `No leave found with LeaveId ${LeaveId}.` },
        { status: 404 }
      );
    }

    console.log(`Leave with ID ${LeaveId} updated successfully`);
    return NextResponse.json({ message: 'Leave updated successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Error updating leave:', error);
    return NextResponse.json(
      { error: `Error updating leave: ${error.message}` },
      { status: 500 }
    );
  }
}

// DELETE Handler: Delete leave(s)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const idsParam = searchParams.getAll('id');

    if (idsParam.length === 0) {
      console.error('No IDs provided for deletion.');
      return NextResponse.json({ error: 'No valid IDs provided for deletion' }, { status: 400 });
    }

    // Parse IDs to integers and filter out invalid ones
    const ids = idsParam
      .map((id) => parseInt(id, 10))
      .filter((id) => !isNaN(id) && id > 0);

    if (ids.length === 0) {
      console.error('No valid numeric IDs provided for deletion.');
      return NextResponse.json({ error: 'No valid IDs provided for deletion' }, { status: 400 });
    }

    console.log(`Received IDs for deletion: ${ids.join(', ')}`);

    // Construct placeholders based on the number of IDs
    const placeholders = ids.map(() => '?').join(',');
    const sql = `DELETE FROM leaves WHERE LeaveId IN (${placeholders})`;

    // Execute the query with the IDs spread out as parameters
    const [result] = await db.query<OkPacket>(sql, ids);

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'No leaves found with the provided IDs.' },
        { status: 404 }
      );
    }

    console.log('Bulk delete successful');

    return NextResponse.json({ message: 'Leave(s) deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting leaves:', error);
    return NextResponse.json(
      { error: `Error deleting leaves: ${error.message}` },
      { status: 500 }
    );
  }
}

// PATCH Handler: Bulk cancel or update status
export async function PATCH(request: NextRequest) {
  try {
    const { action, ids, status } = await request.json();

    // Validation
    if (!action || typeof action !== 'string') {
      return NextResponse.json({ error: 'Invalid or missing action parameter.' }, { status: 400 });
    }

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'Invalid or missing ids parameter.' }, { status: 400 });
    }

    // Parse IDs to integers and filter out invalid ones
    const parsedIds = ids
      .map((id: any) => parseInt(id, 10))
      .filter((id: number) => !isNaN(id) && id > 0);

    if (parsedIds.length === 0) {
      return NextResponse.json({ error: 'No valid IDs provided.' }, { status: 400 });
    }

    console.log(`Action: ${action}, IDs: ${parsedIds.join(', ')}, Status: ${status}`);

    let sql: string;
    let queryValues: any[];

    if (action === 'bulk_cancel') {
      const newStatus = 'Cancelled';

      // Construct placeholders
      const placeholders = parsedIds.map(() => '?').join(',');
      sql = `UPDATE leaves SET Status = ? WHERE LeaveId IN (${placeholders})`;
      queryValues = [newStatus, ...parsedIds];
    } else if (action === 'update_status') {
      if (!status || typeof status !== 'string') {
        return NextResponse.json({ error: 'Invalid or missing status parameter for update_status action.' }, { status: 400 });
      }

      // Construct placeholders
      const placeholders = parsedIds.map(() => '?').join(',');
      sql = `UPDATE leaves SET Status = ? WHERE LeaveId IN (${placeholders})`;
      queryValues = [status, ...parsedIds];
    } else {
      console.error(`Unsupported action: ${action}`);
      return NextResponse.json({ error: 'Unsupported action parameter.' }, { status: 400 });
    }

    // Execute the update
    const [result] = await db.query<OkPacket>(sql, queryValues);

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'No leaves found with the provided IDs.' },
        { status: 404 }
      );
    }

    if (action === 'bulk_cancel') {
      console.log('Bulk cancel successful');
      return NextResponse.json({ message: 'Leave(s) cancelled successfully' }, { status: 200 });
    } else if (action === 'update_status') {
      console.log(`Status updated to "${status}" for IDs: ${parsedIds.join(', ')}`);
      return NextResponse.json({ message: `Leave(s) updated to "${status}" successfully` }, { status: 200 });
    }
  } catch (error: any) {
    console.error('Error processing PATCH request:', error);
    return NextResponse.json(
      { error: `Error processing request: ${error.message}` },
      { status: 500 }
    );
  }
}

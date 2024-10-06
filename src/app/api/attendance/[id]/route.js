import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    console.log(id);

    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ error: 'Invalid ID provided' }, { status: 400 });
    }

    const [result] = await db.query('DELETE FROM CHECKINOUT WHERE ID = ?', [id]);
    const affectedRows = result.affectedRows;

    if (affectedRows === 0) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Record deleted successfully' });
  } catch (error) {
    console.error('Error deleting record:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;

    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ error: 'Invalid ID provided' }, { status: 400 });
    }

    const body = await request.json();
    const { USERID, CHECKTIME, CHECKTYPE, VERIFYCODE, SENSORID, Memoinfo, WorkCode, sn, UserExtFmt } = body;

    if (!USERID || !CHECKTIME || !CHECKTYPE || !VERIFYCODE || !SENSORID || !Memoinfo || !WorkCode || !sn || !UserExtFmt) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const [result] = await db.query(
      `UPDATE CHECKINOUT 
       SET USERID = ?, CHECKTIME = ?, CHECKTYPE = ?, VERIFYCODE = ?, SENSORID = ?, Memoinfo = ?, WorkCode = ?, sn = ?, UserExtFmt = ? 
       WHERE ID = ?`,
      [USERID, CHECKTIME, CHECKTYPE, VERIFYCODE, SENSORID, Memoinfo, WorkCode, sn, UserExtFmt, id]
    );

    const affectedRows = result.affectedRows;

    if (affectedRows === 0) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }

    // Fetch the updated record and return it
    const [updatedRecord] = await db.query('SELECT * FROM CHECKINOUT WHERE ID = ?', [id]);
    
    return NextResponse.json(updatedRecord[0]);
  } catch (error) {
    console.error('Error updating record:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}


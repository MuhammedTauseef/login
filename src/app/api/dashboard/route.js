// app/api/dashboard/route.js

import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    // کل ملازمین کی تعداد حاصل کریں
    const [totalEmployeesResult] = await db.query('SELECT COUNT(*) as total FROM employees');
    const totalEmployees = totalEmployeesResult[0].total;

    // آج چیک ان اور چیک آؤٹ کرنے والے ملازمین کی تعداد حاصل کریں
    const [presentResult] = await db.query(`
      SELECT COUNT(DISTINCT ci.USERID) as present
      FROM CHECKINOUT ci
      JOIN CHECKINOUT co ON ci.USERID = co.USERID
      WHERE DATE(ci.CHECKTIME) = CURDATE()
        AND ci.CHECKTYPE = "I"
        AND co.CHECKTYPE = "O"
        AND DATE(co.CHECKTIME) = CURDATE()
    `);
    const present = presentResult[0].present;

    // غیر حاضر کی تعداد کا حساب کل سے موجودہ ملازمین کو منہا کرکے
    const absent = totalEmployees - present;

    // دیر سے آنے والوں کی تعداد (جو چیک ان وقت سے بعد آئے ہیں)
    const [lateArrivalsResult] = await db.query(`
      SELECT COUNT(DISTINCT ci.USERID) as late
      FROM CHECKINOUT ci
      JOIN CHECKINOUT co ON ci.USERID = co.USERID
      WHERE DATE(ci.CHECKTIME) = CURDATE()
        AND ci.CHECKTYPE = "I"
        AND TIME(ci.CHECKTIME) > "09:00:00"
        AND co.CHECKTYPE = "O"
        AND DATE(co.CHECKTIME) = CURDATE()
    `);
    const lateArrivals = lateArrivalsResult[0].late;

    // آنے والے تعطیلات کی تعداد
    const [upcomingHolidaysResult] = await db.query(
      'SELECT COUNT(*) as upcoming FROM holidays WHERE date > NOW()'
    );
    const upcomingHolidays = upcomingHolidaysResult[0].upcoming;

    // کل لیوز کی تعداد حاصل کریں
    const [totalLeavesResult] = await db.query('SELECT COUNT(*) as totalLeaves FROM leaves');
    const totalLeaves = totalLeavesResult[0].totalLeaves;

    return NextResponse.json({
      totalEmployees,
      present,
      absent,
      lateArrivals,
      upcomingHolidays,
      totalLeaves,
    });
  } catch (error) {
    console.error('Error retrieving dashboard data:', error);
    return NextResponse.json({ error: 'Error retrieving dashboard data' }, { status: 500 });
  }
}

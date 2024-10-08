// app/api/dashboard/route.js
import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    // Get the total number of employees
    const [totalEmployeesResult] = await db.query('SELECT COUNT(*) as total FROM employees');
    const totalEmployees = totalEmployeesResult[0].total;

    // Get the number of employees who checked in and out today
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

    // Calculate the number of absent employees
    const absent = totalEmployees - present;

    // Get the number of late arrivals
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

    // Get the number of upcoming holidays using HOLIDAYYEAR, HOLIDAYMONTH, HOLIDAYDAY
    const [upcomingHolidaysResult] = await db.query(`
      SELECT COUNT(*) as upcoming FROM holidays
      WHERE STR_TO_DATE(
        CONCAT(
          HOLIDAYYEAR, '-',
          LPAD(HOLIDAYMONTH, 2, '0'), '-',
          LPAD(HOLIDAYDAY, 2, '0')
        ), '%Y-%m-%d') > CURDATE()
    `);
    const upcomingHolidays = upcomingHolidaysResult[0].upcoming;

    // Get the total number of leaves
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

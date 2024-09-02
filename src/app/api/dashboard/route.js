import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const [totalEmployees] = await db.query('SELECT COUNT(*) as total FROM employees');
    const [present] = await db.query('SELECT COUNT(*) as present FROM attendance WHERE status = "Present"');
    const [onLeave] = await db.query('SELECT COUNT(*) as onLeave FROM leaves WHERE status = "Pending"');
    const [lateArrivals] = await db.query('SELECT COUNT(*) as late FROM attendance WHERE status = "Late"');
    const [upcomingHolidays] = await db.query('SELECT COUNT(*) as upcoming FROM holidays WHERE date > NOW()');

    return NextResponse.json({
      totalEmployees: totalEmployees[0].total,
      present: present[0].present,
      onLeave: onLeave[0].onLeave,
      lateArrivals: lateArrivals[0].late,
      upcomingHolidays: upcomingHolidays[0].upcoming
    });
  } catch (error) {
    console.error('Error retrieving dashboard data:', error);
    return NextResponse.error('Error retrieving dashboard data', { status: 500 });
  }
}

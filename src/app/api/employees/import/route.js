// src/app/api/employees/import/route.js

import db from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const employees = await request.json(); // Should be an array of employee objects

    if (!Array.isArray(employees) || employees.length === 0) {
      return NextResponse.json(
        { error: 'No employees to import' },
        { status: 400 }
      );
    }

    const allowedFields = [
      'USERID', // Include USERID
      'Badgenumber',
      'SSN',
      'Name',
      'Gender',
      'TITLE',
      'PAGER',
      'BIRTHDAY',
      'HIREDDAY',
      'street',
      'CITY',
      'STATE',
      'ZIP',
      'OPHONE',
      'FPHONE',
      'VERIFICATIONMETHOD',
      'DEFAULTDEPTID',
      'SECURITYFLAGS',
      'ATT',
      'INLATE',
      'OUTEARLY',
      'OVERTIME',
      'SEP',
      'HOLIDAY',
      'MINZU',
      'PASSWORD',
      'LUNCHDURATION',
      'Notes',
      'privilege',
      'InheritDeptSch',
      'InheritDeptSchClass',
      'AutoSchPlan',
      'MinAutoSchInterval',
      'RegisterOT',
      'InheritDeptRule',
      'EMPRIVILEGE',
      'CardNo',
      'FaceGroup',
      'AccGroup',
      'UseAccGroupTZ',
      'VerifyCode',
      'Expires',
      'ValidCount',
      'ValidTimeBegin',
      'ValidTimeEnd',
      'TimeZone1',
      'TimeZone2',
      'TimeZone3',
      'Pin1',
    ];

    const fields = Object.keys(employees[0]).filter((field) =>
      allowedFields.includes(field)
    );

    const placeholders = employees.map(
      () => `(${fields.map(() => '?').join(', ')})`
    );

    const values = employees.reduce((acc, employee) => {
      const employeeValues = fields.map((field) => employee[field]);
      return acc.concat(employeeValues);
    }, []);

    const sql = `INSERT INTO employees (${fields.join(
      ', '
    )}) VALUES ${placeholders.join(', ')}`;

    await db.query(sql, values);

    return NextResponse.json({ message: 'Employees imported successfully' });
  } catch (error) {
    console.error('Error importing employees:', error);
    return NextResponse.json(
      { error: 'Error importing employees' },
      { status: 500 }
    );
  }
}

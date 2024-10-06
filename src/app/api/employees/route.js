// src/app/api/employees/route.js

import db from '@/lib/db';
import { NextResponse } from 'next/server';

// Define allowed fields for operations
const allowedFields = [
  'USERID', // Included in POST for creation, excluded in PUT for updates
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

// GET: Fetch all employees
export async function GET(request) {
  try {
    const [rows] = await db.query('SELECT * FROM employees');
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json(
      { error: 'Error fetching employees' },
      { status: 500 }
    );
  }
}

// POST: Add a new employee
export async function POST(request) {
  try {
    const employee = await request.json();
    const fields = Object.keys(employee);
    const values = Object.values(employee);

    // Filter out any unexpected fields
    const sanitizedFields = fields.filter((field) =>
      allowedFields.includes(field)
    );

    if (sanitizedFields.length === 0) {
      return NextResponse.json(
        { error: 'No valid fields provided for employee creation' },
        { status: 400 }
      );
    }

    const sanitizedValues = sanitizedFields.map((field) => employee[field]);
    const sanitizedPlaceholders = sanitizedFields.map(() => '?').join(', ');

    const sql = `INSERT INTO employees (${sanitizedFields.join(
      ', '
    )}) VALUES (${sanitizedPlaceholders})`;

    const [result] = await db.query(sql, sanitizedValues);

    // Fetch the inserted employee
    let fetchedEmployee;
    if (employee.USERID) {
      // If USERID is provided, fetch by USERID
      const [rows] = await db.query('SELECT * FROM employees WHERE USERID = ?', [
        employee.USERID,
      ]);
      fetchedEmployee = rows[0];
    } else {
      // Otherwise, fetch by auto-generated ID
      const [rows] = await db.query('SELECT * FROM employees WHERE USERID = ?', [
        result.insertId,
      ]);
      fetchedEmployee = rows[0];
    }

    return NextResponse.json(fetchedEmployee, { status: 201 });
  } catch (error) {
    console.error('Error adding employee:', error);
    return NextResponse.json(
      { error: 'Error adding employee' },
      { status: 500 }
    );
  }
}

// PUT: Update an existing employee
export async function PUT(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const employee = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Employee ID is required' },
        { status: 400 }
      );
    }

    const fields = Object.keys(employee);

    // Exclude 'USERID' from allowedFields for updates
    const updateAllowedFields = allowedFields.filter((field) => field !== 'USERID');

    const sanitizedFields = fields.filter((field) =>
      updateAllowedFields.includes(field)
    );
    const sanitizedValues = sanitizedFields.map((field) => employee[field]);

    if (sanitizedFields.length === 0) {
      return NextResponse.json(
        { error: 'No valid fields provided for update' },
        { status: 400 }
      );
    }

    const fieldAssignments = sanitizedFields.map((field) => `${field} = ?`);
    const sql = `UPDATE employees SET ${fieldAssignments.join(
      ', '
    )} WHERE USERID = ?`;

    await db.query(sql, [...sanitizedValues, id]);

    // Fetch the updated employee
    const [rows] = await db.query('SELECT * FROM employees WHERE USERID = ?', [
      id,
    ]);

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'Employee not found after update' },
        { status: 404 }
      );
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Error updating employee:', error);
    return NextResponse.json(
      { error: 'Error updating employee' },
      { status: 500 }
    );
  }
}

// DELETE: Delete an employee or bulk delete
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (request.method === 'DELETE' && !id) {
      // Handle bulk delete
      const { ids } = await request.json();

      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return NextResponse.json(
          { error: 'No employee IDs provided for deletion' },
          { status: 400 }
        );
      }

      // Ensure all IDs are valid (e.g., integers or strings as per your schema)
      const sanitizedIds = ids.filter((id) => typeof id === 'string' || typeof id === 'number');

      if (sanitizedIds.length === 0) {
        return NextResponse.json(
          { error: 'No valid employee IDs provided for deletion' },
          { status: 400 }
        );
      }

      const placeholders = sanitizedIds.map(() => '?').join(', ');
      const sql = `DELETE FROM employees WHERE USERID IN (${placeholders})`;

      await db.query(sql, sanitizedIds);

      return NextResponse.json({ message: 'Employees deleted successfully' });
    }

    if (!id) {
      return NextResponse.json(
        { error: 'Employee ID is required' },
        { status: 400 }
      );
    }

    const [result] = await db.query('DELETE FROM employees WHERE USERID = ?', [id]);

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Error deleting employee(s):', error);
    return NextResponse.json(
      { error: 'Error deleting employee(s)' },
      { status: 500 }
    );
  }
}

'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';

interface AttendanceRecord {
  id?: number;
  employeeCode: string;
  name: string;
  designation: string;
  cnic: string;
  bps: number;
  checkIn: string;
  checkOut?: string | null;
  status: 'Present' | 'Late' | 'Absent';
}

export default function AttendancePage() {
  const [date, setDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [newEmployee, setNewEmployee] = useState<AttendanceRecord>({
    employeeCode: '',
    name: '',
    designation: '',
    cnic: '',
    bps: 1, // Default BPS value
    checkIn: '',
    checkOut: null,
    status: 'Present',
  });
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [editingEmployee, setEditingEmployee] = useState<number | null>(null);

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  const fetchAttendanceData = async () => {
    try {
      const response = await fetch('/api/attendance');
      const data: AttendanceRecord[] = await response.json();
      setAttendanceData(data);
      updateDashboardData(data);
    } catch (error) {
      console.error('Error fetching attendance data:', error);
    }
  };

  const updateDashboardData = async (data: AttendanceRecord[]) => {
    try {
      await fetch('/api/update-dashboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          present: data.filter(record => record.status === 'Present').length,
          late: data.filter(record => record.status === 'Late').length,
        }),
      });
    } catch (error) {
      console.error('Error updating dashboard data:', error);
    }
  };

  const validateForm = () => {
    const { employeeCode, name, designation, cnic, bps, checkIn } = newEmployee;
    if (!employeeCode || !name || !designation || !cnic || !checkIn) {
      alert('Please fill out all required fields.');
      return false;
    }
    if (isNaN(Number(employeeCode))) {
      alert('Employee Code must be a number.');
      return false;
    }
    if (!/^\d{5}-\d{7}-\d{1,}$/.test(cnic)) {
      alert('CNIC must be in the format XXXX-XXXXXXX-X.');
      return false;
    }
    if (isNaN(bps) || bps < 1 || bps > 22) {
      alert('BPS must be a number between 1 and 22.');
      return false;
    }
    return true;
  };

  const saveEmployee = async () => {
    if (!validateForm()) return;

    try {
      if (editingEmployee !== null) {
        const response = await fetch(`/api/attendance?id=${editingEmployee}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newEmployee),
        });
        const updatedRecord: AttendanceRecord = await response.json();
        setAttendanceData(
          attendanceData.map((record) =>
            record.id === editingEmployee ? updatedRecord : record
          )
        );
      } else {
        const response = await fetch('/api/attendance', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newEmployee),
        });
        const data: AttendanceRecord = await response.json();
        setAttendanceData([...attendanceData, data]);
      }
      resetForm();
      updateDashboardData(attendanceData);
    } catch (error) {
      console.error('Error saving employee:', error);
    }
  };

  const resetForm = () => {
    setNewEmployee({
      employeeCode: '',
      name: '',
      designation: '',
      cnic: '',
      bps: 1, // Reset to default value
      checkIn: '',
      checkOut: null,
      status: 'Present',
    });
    setEditingEmployee(null);
  };

  const editEmployee = (id: number) => {
    const employee = attendanceData.find((record) => record.id === id);
    if (employee) {
      setNewEmployee(employee);
      setEditingEmployee(id);
    }
  };

  const deleteEmployee = async (id: number) => {
    if (confirm('Are you sure you want to delete this record?')) {
      try {
        await fetch(`/api/attendance?id=${id}`, {
          method: 'DELETE',
        });
        const updatedData = attendanceData.filter((record) => record.id !== id);
        setAttendanceData(updatedData);
        updateDashboardData(updatedData);
      } catch (error) {
        console.error('Error deleting employee:', error);
      }
    }
  };

  const filteredData = attendanceData.filter((record) => {
    const matchesSearchTerm =
      searchTerm === '' ||
      record.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.cnic.includes(searchTerm);

    return matchesSearchTerm;
  });

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-4">Attendance</h1>

      {/* Date Picker and Print Button */}
      <div className="flex justify-between items-center mb-4">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="p-2 border rounded"
        />
        <button
          onClick={() => window.print()}
          className="p-4 bg-blue-500 text-white rounded text-lg"
        >
          Print
        </button>
      </div>

      {/* Search */}
      <div className="mb-4 p-4 border rounded">
        <input
          type="text"
          placeholder="Search by Employee Code, Name, Designation, or CNIC"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 mb-2 border rounded w-full"
        />
      </div>

      {/* Add Employee Form */}
      <div className="mb-4 p-4 border rounded">
        <h2 className="text-xl font-bold mb-2">
          {editingEmployee !== null ? 'Edit Employee' : 'Add New Employee'}
        </h2>
        <input
          type="text"
          placeholder="Employee Code"
          value={newEmployee.employeeCode}
          onChange={(e) =>
            setNewEmployee({ ...newEmployee, employeeCode: e.target.value })
          }
          className="p-2 mb-2 border rounded w-full"
        />
        <input
          type="text"
          placeholder="Name"
          value={newEmployee.name}
          onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
          className="p-2 mb-2 border rounded w-full"
        />
        <input
          type="text"
          placeholder="Designation"
          value={newEmployee.designation}
          onChange={(e) =>
            setNewEmployee({ ...newEmployee, designation: e.target.value })
          }
          className="p-2 mb-2 border rounded w-full"
        />
        <input
          type="text"
          placeholder="CNIC (XXXX-XXXXXXX-X)"
          value={newEmployee.cnic}
          onChange={(e) => setNewEmployee({ ...newEmployee, cnic: e.target.value })}
          className="p-2 mb-2 border rounded w-full"
        />
        <select
          value={newEmployee.bps}
          onChange={(e) => setNewEmployee({ ...newEmployee, bps: Number(e.target.value) })}
          className="p-2 mb-2 border rounded w-full"
        >
          {[...Array(22).keys()].map(i => (
            <option key={i + 1} value={i + 1}>
              BPS {i + 1}
            </option>
          ))}
        </select>
        <input
          type="datetime-local"
          placeholder="Check In"
          value={newEmployee.checkIn}
          onChange={(e) => setNewEmployee({ ...newEmployee, checkIn: e.target.value })}
          className="p-2 mb-2 border rounded w-full"
        />
        <input
          type="datetime-local"
          placeholder="Check Out"
          value={newEmployee.checkOut || ''}
          onChange={(e) =>
            setNewEmployee({ ...newEmployee, checkOut: e.target.value || null })
          }
          className="p-2 mb-2 border rounded w-full"
        />
        <select
          value={newEmployee.status}
          onChange={(e) =>
            setNewEmployee({
              ...newEmployee,
              status: e.target.value as 'Present' | 'Late' | 'Absent',
            })
          }
          className="p-2 mb-2 border rounded w-full"
        >
          <option value="Present">Present</option>
          <option value="Late">Late</option>
          <option value="Absent">Absent</option>
        </select>
        <button
          onClick={saveEmployee}
          className="p-2 bg-blue-500 text-white rounded w-full"
        >
          {editingEmployee !== null ? 'Update Employee' : 'Add Employee'}
        </button>
        {editingEmployee !== null && (
          <button
            onClick={resetForm}
            className="p-2 bg-gray-500 text-white rounded w-full mt-2"
          >
            Cancel Edit
          </button>
        )}
      </div>

      {/* Attendance Table */}
      <div className="overflow-x-auto mb-4">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="p-3 border">Employee Code</th>
              <th className="p-3 border">Name</th>
              <th className="p-3 border">Designation</th>
              <th className="p-3 border">CNIC</th>
              <th className="p-3 border">BPS</th>
              <th className="p-3 border">Check In</th>
              <th className="p-3 border">Check Out</th>
              <th className="p-3 border">Status</th>
              <th className="p-3 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((record) => (
              <tr key={record.id}>
                <td className="p-3 border">{record.employeeCode}</td>
                <td className="p-3 border">{record.name}</td>
                <td className="p-3 border">{record.designation}</td>
                <td className="p-3 border">{record.cnic}</td>
                <td className="p-3 border">BPS {record.bps}</td>
                <td className="p-3 border">
                  {record.checkIn ? format(new Date(record.checkIn), 'yyyy-MM-dd HH:mm:ss') : '-'}
                </td>
                <td className="p-3 border">
                  {record.checkOut ? format(new Date(record.checkOut), 'yyyy-MM-dd HH:mm:ss') : '-'}
                </td>
                <td className="p-3 border">{record.status}</td>
                <td className="p-3 border">
                  <button
                    onClick={() => editEmployee(record.id!)}
                    className="text-blue-500 hover:underline"
                  >
                    Edit
                  </button>
                  {' | '}
                  <button
                    onClick={() => deleteEmployee(record.id!)}
                    className="text-red-500 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

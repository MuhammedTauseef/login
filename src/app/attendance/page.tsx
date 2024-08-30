'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';

// Define types for the attendance data and the new employee form
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
    bps: 1,
    checkIn: '',
    checkOut: null,
    status: 'Present',
  });
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedBpsGroup, setSelectedBpsGroup] = useState<string>('All');
  const [editingEmployee, setEditingEmployee] = useState<number | null>(null);

  // Fetch attendance data from API
  useEffect(() => {
    fetch('/api/attendance')
      .then((response) => response.json())
      .then((data: AttendanceRecord[]) => setAttendanceData(data))
      .catch((error) => console.error('Error fetching attendance data:', error));
  }, []);

  // Validate form data
  const validateForm = () => {
    const { employeeCode, name, designation, cnic, bps, checkIn } = newEmployee;
    if (!employeeCode || !name || !designation || !cnic || !bps || !checkIn) {
      alert('Please fill out all required fields.');
      return false;
    }
    return true;
  };

  // Add or update employee attendance record
  const saveEmployee = () => {
    if (!validateForm()) return;

    if (editingEmployee !== null) {
      // Update existing record
      fetch(`/api/attendance?id=${editingEmployee}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newEmployee),
      })
        .then((response) => response.json())
        .then((updatedRecord: AttendanceRecord) => {
          setAttendanceData(
            attendanceData.map((record) =>
              record.id === editingEmployee ? updatedRecord : record
            )
          );
          resetForm();
        })
        .catch((error) => console.error('Error updating employee:', error));
    } else {
      // Add new record
      fetch('/api/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newEmployee),
      })
        .then((response) => response.json())
        .then((data: AttendanceRecord) => {
          setAttendanceData([...attendanceData, data]);
          resetForm();
        })
        .catch((error) => console.error('Error adding employee:', error));
    }
  };

  // Reset form after adding or updating
  const resetForm = () => {
    setNewEmployee({
      employeeCode: '',
      name: '',
      designation: '',
      cnic: '',
      bps: 1,
      checkIn: '',
      checkOut: null,
      status: 'Present',
    });
    setEditingEmployee(null);
  };

  // Edit employee record
  const editEmployee = (id: number) => {
    const employee = attendanceData.find((record) => record.id === id);
    if (employee) {
      setNewEmployee(employee);
      setEditingEmployee(id);
    }
  };

  // Delete employee record
  const deleteEmployee = (id: number) => {
    if (confirm('Are you sure you want to delete this record?')) {
      fetch(`/api/attendance/${id}`, {
        method: 'DELETE',
      })
        .then(() => {
          setAttendanceData(attendanceData.filter((record) => record.id !== id));
        })
        .catch((error) => console.error('Error deleting employee:', error));
    }
  };

  // Filtered Data based on search and BPS group
  const filteredData = attendanceData.filter((record) => {
    const matchesSearchTerm =
      searchTerm === '' ||
      record.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.cnic.includes(searchTerm);

    const matchesBpsGroup =
      selectedBpsGroup === 'All' ||
      (selectedBpsGroup === 'BPS 1-16' && record.bps <= 16) ||
      (selectedBpsGroup === 'BPS 17' && record.bps === 17) ||
      (selectedBpsGroup === 'BPS 18' && record.bps === 18) ||
      (selectedBpsGroup === 'BPS 19-21' && record.bps >= 19 && record.bps <= 21);

    return matchesSearchTerm && matchesBpsGroup;
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

      {/* Search and Filter */}
      <div className="mb-4 p-4 border rounded">
        <input
          type="text"
          placeholder="Search by Employee Code, Name, Designation, or CNIC"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 mb-2 border rounded w-full"
        />
        <select
          value={selectedBpsGroup}
          onChange={(e) => setSelectedBpsGroup(e.target.value)}
          className="p-2 mb-2 border rounded w-full"
        >
          <option value="All">All BPS</option>
          <option value="BPS 1-16">BPS 1-16</option>
          <option value="BPS 17">BPS 17</option>
          <option value="BPS 18">BPS 18</option>
          <option value="BPS 19-21">BPS 19-21</option>
        </select>
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
          placeholder="CNIC"
          value={newEmployee.cnic}
          onChange={(e) => setNewEmployee({ ...newEmployee, cnic: e.target.value })}
          className="p-2 mb-2 border rounded w-full"
        />
        <input
          type="number"
          placeholder="BPS"
          value={newEmployee.bps}
          onChange={(e) =>
            setNewEmployee({ ...newEmployee, bps: parseInt(e.target.value) })
          }
          className="p-2 mb-2 border rounded w-full"
        />
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
                <td className="p-3 border">{record.bps}</td>
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

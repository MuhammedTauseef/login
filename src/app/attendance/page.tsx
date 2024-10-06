'use client';

import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';

interface AttendanceRecord {
  ID?: number;
  USERID: number;
  CHECKTIME: string;
  CHECKTYPE: string;
  VERIFYCODE: string;
  SENSORID: number;
  Memoinfo: string;
  WorkCode: string;
  sn: string;
  UserExtFmt: string;
}

export default function AttendancePage() {
  const [date, setDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [newRecord, setNewRecord] = useState<AttendanceRecord>({
    USERID: 0,
    CHECKTIME: '',
    CHECKTYPE: '',
    VERIFYCODE: '',
    SENSORID: 0,
    Memoinfo: '',
    WorkCode: '',
    sn: '',
    UserExtFmt: '',
  });
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [editingRecord, setEditingRecord] = useState<number | null>(null);
  const [selectedRecords, setSelectedRecords] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAttendanceData();
    // Optionally, you can refetch data when the date changes
    // fetchAttendanceData();
  }, []);

  const fetchAttendanceData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/attendance');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch attendance data');
      }
      const data: AttendanceRecord[] = await response.json();
      setAttendanceData(data);
    } catch (error: any) {
      console.error('Error fetching attendance data:', error);
      setError(error.message || 'Error fetching attendance data');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const { USERID, CHECKTIME, CHECKTYPE } = newRecord;
    if (!USERID || !CHECKTIME || !CHECKTYPE) {
      alert('Please fill out all required fields.');
      return false;
    }
    return true;
  };

  const saveRecord = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError(null);
    try {
      let response: Response;
      if (editingRecord !== null) {
        response = await fetch(`/api/attendance/${editingRecord}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newRecord),
        });
      } else {
        response = await fetch('/api/attendance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newRecord),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save record');
      }

      const savedRecord: AttendanceRecord = await response.json();

      if (editingRecord !== null) {
        setAttendanceData((prevData) =>
          prevData.map((record) =>
            record.ID === editingRecord ? savedRecord : record
          )
        );
        alert('Record updated successfully.');
      } else {
        setAttendanceData((prevData) => [...prevData, savedRecord]);
        alert('Record added successfully.');
      }

      resetForm();
    } catch (error: any) {
      console.error('Error saving record:', error);
      setError(error.message || 'Error saving record');
      alert(`Error: ${error.message || 'Failed to save record'}`);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNewRecord({
      USERID: 0,
      CHECKTIME: '',
      CHECKTYPE: '',
      VERIFYCODE: '',
      SENSORID: 0,
      Memoinfo: '',
      WorkCode: '',
      sn: '',
      UserExtFmt: '',
    });
    setEditingRecord(null);
  };

  const editRecord = (id: number) => {
    const record = attendanceData.find((record) => record.ID === id);
    if (record) {
      setNewRecord(record);
      setEditingRecord(id);
    }
  };

  const deleteRecord = async (id: number) => {
    if (confirm('Are you sure you want to delete this record?')) {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/attendance/${id}`, { method: 'DELETE' });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to delete record');
        }
        setAttendanceData(attendanceData.filter((record) => record.ID !== id));
        alert('Record deleted successfully.');
      } catch (error: any) {
        console.error('Error deleting record:', error);
        setError(error.message || 'Error deleting record');
        alert(`Error: ${error.message || 'Failed to delete record'}`);
      } finally {
        setLoading(false);
      }
    }
  };

  const exportToExcel = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/attendance/export');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to export data');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Attendance_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      alert('Data exported successfully.');
    } catch (error: any) {
      console.error('Error exporting to Excel:', error);
      setError(error.message || 'Error exporting data');
      alert(`Error: ${error.message || 'Failed to export data'}`);
    } finally {
      setLoading(false);
    }
  };

  const importFromExcel = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLoading(true);
      setError(null);
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch('/api/attendance/import', {
          method: 'POST',
          body: formData,
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to import data');
        }
        const importedData = await response.json();
        setAttendanceData(importedData);
        alert('Data imported successfully.');
      } catch (error: any) {
        console.error('Error importing data:', error);
        setError(error.message || 'Error importing data');
        alert(`Error: ${error.message || 'Failed to import data'}`);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSelectRecord = (id: number) => {
    setSelectedRecords(
      selectedRecords.includes(id)
        ? selectedRecords.filter((recordId) => recordId !== id)
        : [...selectedRecords, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedRecords.length === attendanceData.length) {
      setSelectedRecords([]);
    } else {
      const allIds = attendanceData.map((record) => record.ID!).filter((id): id is number => id !== undefined);
      setSelectedRecords(allIds);
    }
  };

  const deleteSelected = async () => {
    if (confirm(`Are you sure you want to delete ${selectedRecords.length} record(s)?`)) {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/attendance/bulk-delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: selectedRecords }),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to delete selected records');
        }
        setAttendanceData(attendanceData.filter((record) => !selectedRecords.includes(record.ID!)));
        setSelectedRecords([]);
        alert('Selected records deleted successfully.');
      } catch (error: any) {
        console.error('Error deleting selected records:', error);
        setError(error.message || 'Error deleting selected records');
        alert(`Error: ${error.message || 'Failed to delete selected records'}`);
      } finally {
        setLoading(false);
      }
    }
  };

  const filteredData = attendanceData.filter((record) =>
    Object.values(record).some(
      (value) =>
        value &&
        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Attendance Management</h1>

      {/* Loading Indicator */}
      {loading && (
        <div className="mb-4 p-2 bg-yellow-100 text-yellow-700 rounded">
          Loading...
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0">
        <div className="flex items-center space-x-4">
          <label htmlFor="date" className="font-medium">
            Select Date:
          </label>
          <input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="p-2 border rounded shadow"
          />
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => window.print()}
            className="p-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600 transition"
          >
            Print
          </button>
          <button
            onClick={exportToExcel}
            className="p-2 bg-green-500 text-white rounded shadow hover:bg-green-600 transition"
          >
            Export to Excel
          </button>
          <label className="p-2 bg-purple-500 text-white rounded shadow hover:bg-purple-600 transition cursor-pointer">
            Import from Excel
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={importFromExcel}
              className="hidden"
            />
          </label>
        </div>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 border rounded shadow w-full"
        />
      </div>

      <div className="mb-6 p-4 border rounded shadow bg-gray-50">
        <h2 className="text-xl font-bold mb-4">
          {editingRecord !== null ? 'Edit Record' : 'Add New Record'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="number"
            placeholder="User ID *"
            value={newRecord.USERID}
            onChange={(e) =>
              setNewRecord({ ...newRecord, USERID: parseInt(e.target.value) })
            }
            className="p-2 border rounded shadow w-full"
            required
          />
          <input
            type="datetime-local"
            placeholder="Check Time *"
            value={newRecord.CHECKTIME}
            onChange={(e) =>
              setNewRecord({ ...newRecord, CHECKTIME: e.target.value })
            }
            className="p-2 border rounded shadow w-full"
            required
          />
          <input
            type="text"
            placeholder="Check Type *"
            value={newRecord.CHECKTYPE}
            onChange={(e) =>
              setNewRecord({ ...newRecord, CHECKTYPE: e.target.value })
            }
            className="p-2 border rounded shadow w-full"
            required
          />
          <input
            type="text"
            placeholder="Verify Code"
            value={newRecord.VERIFYCODE}
            onChange={(e) =>
              setNewRecord({ ...newRecord, VERIFYCODE: e.target.value })
            }
            className="p-2 border rounded shadow w-full"
          />
          <input
            type="number"
            placeholder="Sensor ID"
            value={newRecord.SENSORID}
            onChange={(e) =>
              setNewRecord({ ...newRecord, SENSORID: parseInt(e.target.value) })
            }
            className="p-2 border rounded shadow w-full"
          />
          <input
            type="text"
            placeholder="Memo Info"
            value={newRecord.Memoinfo}
            onChange={(e) =>
              setNewRecord({ ...newRecord, Memoinfo: e.target.value })
            }
            className="p-2 border rounded shadow w-full"
          />
          <input
            type="text"
            placeholder="Work Code"
            value={newRecord.WorkCode}
            onChange={(e) =>
              setNewRecord({ ...newRecord, WorkCode: e.target.value })
            }
            className="p-2 border rounded shadow w-full"
          />
          <input
            type="text"
            placeholder="SN"
            value={newRecord.sn}
            onChange={(e) =>
              setNewRecord({ ...newRecord, sn: e.target.value })
            }
            className="p-2 border rounded shadow w-full"
          />
          <input
            type="text"
            placeholder="User Ext Fmt"
            value={newRecord.UserExtFmt}
            onChange={(e) =>
              setNewRecord({ ...newRecord, UserExtFmt: e.target.value })
            }
            className="p-2 border rounded shadow w-full"
          />
        </div>
        <div className="mt-4 flex space-x-2">
          <button
            onClick={saveRecord}
            className="p-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600 transition flex-1"
          >
            {editingRecord !== null ? 'Update' : 'Save'}
          </button>
          <button
            onClick={resetForm}
            className="p-2 bg-red-500 text-white rounded shadow hover:bg-red-600 transition flex-1"
          >
            Cancel
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="p-2 border">
                <input
                  type="checkbox"
                  checked={selectedRecords.length === attendanceData.length && attendanceData.length > 0}
                  onChange={handleSelectAll}
                />
              </th>
              <th className="p-2 border">ID</th>
              <th className="p-2 border">User ID</th>
              <th className="p-2 border">Check Time</th>
              <th className="p-2 border">Check Type</th>
              <th className="p-2 border">Verify Code</th>
              <th className="p-2 border">Sensor ID</th>
              <th className="p-2 border">Memo Info</th>
              <th className="p-2 border">Work Code</th>
              <th className="p-2 border">SN</th>
              <th className="p-2 border">User Ext Fmt</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="p-2 border text-center" colSpan={12}>
                  Loading data...
                </td>
              </tr>
            ) : filteredData.length > 0 ? (
              filteredData.map((record) => (
                <tr key={record.ID} className="border-b hover:bg-gray-50">
                  <td className="p-2 border text-center">
                    <input
                      type="checkbox"
                      checked={selectedRecords.includes(record.ID!)}
                      onChange={() => handleSelectRecord(record.ID!)}
                    />
                  </td>
                  <td className="p-2 border text-center">{record.ID}</td>
                  <td className="p-2 border text-center">{record.USERID}</td>
                  <td className="p-2 border">{new Date(record.CHECKTIME).toLocaleString()}</td>
                  <td className="p-2 border">{record.CHECKTYPE}</td>
                  <td className="p-2 border">{record.VERIFYCODE}</td>
                  <td className="p-2 border text-center">{record.SENSORID}</td>
                  <td className="p-2 border">{record.Memoinfo}</td>
                  <td className="p-2 border">{record.WorkCode}</td>
                  <td className="p-2 border">{record.sn}</td>
                  <td className="p-2 border">{record.UserExtFmt}</td>
                  <td className="p-2 border flex space-x-2">
                    <button
                      onClick={() => editRecord(record.ID!)}
                      className="p-1 bg-yellow-500 text-white rounded shadow hover:bg-yellow-600 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteRecord(record.ID!)}
                      className="p-1 bg-red-500 text-white rounded shadow hover:bg-red-600 transition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="p-2 border text-center" colSpan={12}>
                  No attendance records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedRecords.length > 0 && (
        <div className="mt-4 flex items-center space-x-2">
          <button
            onClick={handleSelectAll}
            className="p-2 bg-gray-500 text-white rounded shadow hover:bg-gray-600 transition"
          >
            {selectedRecords.length === attendanceData.length ? 'Deselect All' : 'Select All'}
          </button>
          <button
            onClick={deleteSelected}
            className="p-2 bg-red-500 text-white rounded shadow hover:bg-red-600 transition"
          >
            Delete Selected ({selectedRecords.length})
          </button>
        </div>
      )}
    </div>
  );
}

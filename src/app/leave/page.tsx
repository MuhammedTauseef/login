'use client';

import { useState } from 'react';
import { format } from 'date-fns';

const leaveData = [
  { id: 1, employeeCode: 'EMP001', name: 'Muhammad Tauseef', startDate: '2024-08-26', endDate: '2024-08-28', type: 'Annual', status: 'Approved' },
  { id: 2, employeeCode: 'EMP002', name: 'Muhammad sarfraz', startDate: '2024-08-30', endDate: '2024-08-30', type: 'Sick', status: 'Pending' },
  // Add more dummy data as needed
];

export default function LeavePage() {
  const [newLeave, setNewLeave] = useState({
    employeeCode: '',
    startDate: '',
    endDate: '',
    type: 'Annual',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle leave request submission
    console.log('Leave request submitted:', newLeave);
    // Reset form
    setNewLeave({ employeeCode: '', startDate: '', endDate: '', type: 'Annual' });
  };

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-4">Leave Management</h1>
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Employee Code"
            value={newLeave.employeeCode}
            onChange={(e) => setNewLeave({ ...newLeave, employeeCode: e.target.value })}
            className="p-2 border rounded"
            required
          />
          <select
            value={newLeave.type}
            onChange={(e) => setNewLeave({ ...newLeave, type: e.target.value })}
            className="p-2 border rounded"
            required
          >
            <option value="Annual">Annual</option>
            <option value="Sick">Sick</option>
            <option value="Casual">Casual</option>
          </select>
          <input
            type="date"
            value={newLeave.startDate}
            onChange={(e) => setNewLeave({ ...newLeave, startDate: e.target.value })}
            className="p-2 border rounded"
            required
          />
          <input
            type="date"
            value={newLeave.endDate}
            onChange={(e) => setNewLeave({ ...newLeave, endDate: e.target.value })}
            className="p-2 border rounded"
            required
          />
        </div>
        <button type="submit" className="mt-4 bg-blue-500 text-white p-2 rounded hover:bg-green-500">
          Submit Leave Request
        </button>
      </form>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="p-3 border">Employee Code</th>
              <th className="p-3 border">Name</th>
              <th className="p-3 border">Start Date</th>
              <th className="p-3 border">End Date</th>
              <th className="p-3 border">Type</th>
              <th className="p-3 border">Status</th>
            </tr>
          </thead>
          <tbody>
            {leaveData.map((leave) => (
              <tr key={leave.id}>
                <td className="p-3 border">{leave.employeeCode}</td>
                <td className="p-3 border">{leave.name}</td>
                <td className="p-3 border">{format(new Date(leave.startDate), 'dd MMM yyyy')}</td>
                <td className="p-3 border">{format(new Date(leave.endDate), 'dd MMM yyyy')}</td>
                <td className="p-3 border">{leave.type}</td>
                <td className="p-3 border">{leave.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
'use client';

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';

interface Leave {
  id: number;
  employee_code: string;
  name: string;
  start_date: string;
  end_date: string;
  type: 'Casual' | 'Leave with Full Pay (LFP)' | 'Medical Leave' | 'Hajj Leave' | 'Study Leave';
  status: string;
}

const LeavePage: React.FC = () => {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [newLeave, setNewLeave] = useState({
    employee_code: '',
    name: '',
    start_date: '',
    end_date: '',
    type: 'Casual' as const,
  });
  const [editingLeave, setEditingLeave] = useState<Leave | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchLeaves = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/leave');
      if (!response.ok) throw new Error('Failed to fetch leaves');
      const data = await response.json();
      setLeaves(data);
    } catch (err) {
      setError('Failed to fetch leaves. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (editingLeave) {
      setEditingLeave(prev => ({ ...prev, [name]: value }));
    } else {
      setNewLeave(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      if (editingLeave) {
        await handleUpdate();
      } else {
        const response = await fetch('/api/leave', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newLeave),
        });
        if (!response.ok) throw new Error('Failed to submit leave request');
        setSuccess('Leave request submitted successfully');
        setNewLeave({ employee_code: '', name: '', start_date: '', end_date: '', type: 'Casual' });
      }
      fetchLeaves();
    } catch (err) {
      setError('Failed to submit leave request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (leave: Leave) => {
    setEditingLeave(leave);
    setNewLeave(leave);
  };

  const handleUpdate = async () => {
    if (!editingLeave) return;
    try {
      const response = await fetch('/api/leave', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingLeave),
      });
      if (!response.ok) throw new Error('Failed to update leave request');
      setSuccess('Leave request updated successfully');
      setEditingLeave(null);
      setNewLeave({ employee_code: '', name: '', start_date: '', end_date: '', type: 'Casual' });
    } catch (err) {
      setError('Failed to update leave request. Please try again.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this leave request?')) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/leave?id=${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete leave request');
      setSuccess('Leave request deleted successfully');
      fetchLeaves();
    } catch (err) {
      setError('Failed to delete leave request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (id: number, status: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/leave', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      if (!response.ok) throw new Error('Failed to update leave status');
      setSuccess(`Leave request ${status.toLowerCase()} successfully`);
      fetchLeaves();
    } catch (err) {
      setError('Failed to update leave status. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Leave Management</h1>
      
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
      {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{success}</div>}
      
      <form onSubmit={handleSubmit} className="mb-8 bg-white shadow-md rounded px-8 pt-6 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            name="employee_code"
            value={editingLeave?.employee_code || newLeave.employee_code}
            onChange={handleInputChange}
            placeholder="Employee Code"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
          <input
            type="text"
            name="name"
            value={editingLeave?.name || newLeave.name}
            onChange={handleInputChange}
            placeholder="Name"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
          <input
            type="date"
            name="start_date"
            value={editingLeave?.start_date || newLeave.start_date}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
          <input
            type="date"
            name="end_date"
            value={editingLeave?.end_date || newLeave.end_date}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
          <select
            name="type"
            value={editingLeave?.type || newLeave.type}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          >
            <option value="Casual">Casual</option>
            <option value="Leave with Full Pay (LFP)">Leave with Full Pay (LFP)</option>
            <option value="Medical Leave">Medical Leave</option>
            <option value="Hajj Leave">Hajj Leave</option>
            <option value="Study Leave">Study Leave</option>
          </select>
        </div>
        <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4">
          {editingLeave ? 'Update Leave' : 'Submit Leave'}
        </button>
        {editingLeave && (
          <button type="button" onClick={() => {
            setEditingLeave(null);
            setNewLeave({ employee_code: '', name: '', start_date: '', end_date: '', type: 'Casual' });
          }} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mt-4 ml-4">
            Cancel Edit
          </button>
        )}
      </form>

      <h2 className="text-2xl font-semibold mb-4">Leave Requests</h2>

      {isLoading ? (
        <div className="text-center">Loading leave requests...</div>
      ) : (
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {leaves.map(leave => (
              <tr key={leave.id}>
                <td className="px-6 py-4 whitespace-nowrap">{leave.employee_code}</td>
                <td className="px-6 py-4 whitespace-nowrap">{leave.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{format(new Date(leave.start_date), 'MM/dd/yyyy')}</td>
                <td className="px-6 py-4 whitespace-nowrap">{format(new Date(leave.end_date), 'MM/dd/yyyy')}</td>
                <td className="px-6 py-4 whitespace-nowrap">{leave.type}</td>
                <td className="px-6 py-4 whitespace-nowrap">{leave.status}</td>
                <td className="px-6 py-4 whitespace-nowrap space-x-2">
                  <button onClick={() => handleEdit(leave)} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-xs">Edit</button>
                  <button onClick={() => handleDelete(leave.id)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-xs">Delete</button>
                  <button onClick={() => handleStatusChange(leave.id, 'Approved')} className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded text-xs">Approve</button>
                  <button onClick={() => handleStatusChange(leave.id, 'Rejected')} className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded text-xs">Reject</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default LeavePage;
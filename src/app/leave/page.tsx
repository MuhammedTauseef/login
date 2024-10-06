// src/app/leave/page.tsx 

'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Leave {
  LeaveId: number;
  LeaveName: string;
  MinUnit: number;
  Unit: number;
  RemaindProc: string;
  RemaindCount: number;
  ReportSymbol: string;
  Deduct: boolean;
  Color: string;
  Classify: string;
  Code: string;
  Status: string;
  CreatedAt: string;
  UpdatedAt: string;
}

interface LeaveFormState {
  LeaveName: string;
  MinUnit: string;
  Unit: string;
  RemaindProc: string;
  RemaindCount: string;
  ReportSymbol: string;
  Deduct: boolean;
  Color: string;
  Classify: string;
  Code: string;
}

const initialLeaveFormState: LeaveFormState = {
  LeaveName: '',
  MinUnit: '',
  Unit: '',
  RemaindProc: '',
  RemaindCount: '',
  ReportSymbol: '',
  Deduct: false,
  Color: '#FFFFFF',
  Classify: '',
  Code: '',
};

const LeavePage: React.FC = () => {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [formState, setFormState] = useState<LeaveFormState>(initialLeaveFormState);
  const [editingLeave, setEditingLeave] = useState<Leave | null>(null);
  const [selectedLeaves, setSelectedLeaves] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch all leaves
  const fetchLeaves = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/leave');
      setLeaves(response.data);
    } catch (err: any) {
      console.error('Error fetching leaves:', err);
      setError('Failed to fetch leaves. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  // Handle input changes with type guards
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const target = e.target;
    const name = target.name;

    let value: string | boolean;

    if (target instanceof HTMLInputElement && target.type === 'checkbox') {
      value = target.checked;
    } else {
      value = target.value;
    }

    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission for add/update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    try {
      // Validate number fields
      const minUnit = formState.MinUnit.trim() === '' ? 0 : parseInt(formState.MinUnit, 10);
      const unit = formState.Unit.trim() === '' ? 0 : parseInt(formState.Unit, 10);
      const remaindCount = formState.RemaindCount.trim() === '' ? 0 : parseInt(formState.RemaindCount, 10);

      const payload = {
        LeaveName: formState.LeaveName,
        MinUnit: minUnit,
        Unit: unit,
        RemaindProc: formState.RemaindProc,
        RemaindCount: remaindCount,
        ReportSymbol: formState.ReportSymbol,
        Deduct: formState.Deduct,
        Color: formState.Color,
        Classify: formState.Classify,
        Code: formState.Code,
      };

      if (editingLeave) {
        const updatedLeave = {
          ...editingLeave,
          ...payload,
        };
        const response = await axios.put('/api/leave', updatedLeave);
        console.log('Update Response:', response.data);
        setSuccess('Leave updated successfully');
        setEditingLeave(null);
        setFormState(initialLeaveFormState); // Reset form after update
      } else {
        const response = await axios.post('/api/leave', payload);
        console.log('Add Response:', response.data);
        setSuccess('Leave added successfully');
        setFormState(initialLeaveFormState);
      }
      fetchLeaves();
    } catch (err: any) {
      console.error('Error submitting leave:', err);
      setError(err.response?.data?.error || 'Operation failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle edit button click
  const handleEdit = (leave: Leave) => {
    setEditingLeave(leave);
    setFormState({
      LeaveName: leave.LeaveName,
      MinUnit: leave.MinUnit.toString(),
      Unit: leave.Unit.toString(),
      RemaindProc: leave.RemaindProc,
      RemaindCount: leave.RemaindCount.toString(),
      ReportSymbol: leave.ReportSymbol,
      Deduct: leave.Deduct,
      Color: leave.Color,
      Classify: leave.Classify,
      Code: leave.Code,
    });
    setError(null);
    setSuccess(null);
  };

  // Handle delete button click
  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this leave?')) return;
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await axios.delete(`/api/leave?id=${id}`);
      console.log('Delete Response:', response.data);
      setSuccess('Leave deleted successfully');
      fetchLeaves();
    } catch (err: any) {
      console.error('Error deleting leave:', err);
      setError(err.response?.data?.error || 'Delete failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedLeaves.length === 0) {
      alert('No leaves selected for deletion.');
      return;
    }
    if (!confirm('Are you sure you want to delete the selected leaves?')) return;
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    try {
      // Manually construct the URL with multiple 'id' query parameters
      const url = new URL('/api/leave', window.location.origin);
      selectedLeaves.forEach(id => url.searchParams.append('id', id.toString()));

      const response = await axios.delete(url.toString());

      console.log('Bulk Delete Response:', response.data);
      setSuccess('Selected leaves deleted successfully');
      setSelectedLeaves([]);
      fetchLeaves();
    } catch (err: any) {
      console.error('Error bulk deleting leaves:', err);
      setError(err.response?.data?.error || 'Bulk delete failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle bulk cancel
  const handleBulkCancel = async () => {
    if (selectedLeaves.length === 0) {
      alert('No leaves selected for cancellation.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await axios.patch('/api/leave', {
        action: 'bulk_cancel',
        ids: selectedLeaves,
        status: 'Cancelled',
      });

      console.log('Bulk Cancel Response:', response.data);
      setSuccess('Selected leaves cancelled successfully');
      setSelectedLeaves([]);
      fetchLeaves();
    } catch (err: any) {
      console.error('Error bulk cancelling leaves:', err);
      setError(err.response?.data?.error || 'Bulk cancel failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle individual status change
  const handleStatusChange = async (id: number, status: string) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await axios.patch('/api/leave', {
        action: 'update_status',
        ids: [id],
        status,
      });

      console.log('Status Change Response:', response.data);
      setSuccess(`Leave ${status.toLowerCase()} successfully`);
      fetchLeaves();
    } catch (err: any) {
      console.error(`Error updating leave status:`, err);
      setError(err.response?.data?.error || 'Status update failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle select all checkbox
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allIds = leaves.map((leave) => leave.LeaveId);
      setSelectedLeaves(allIds);
    } else {
      setSelectedLeaves([]);
    }
  };

  // Handle select one checkbox
  const handleSelectOne = (id: number) => {
    setSelectedLeaves((prev) =>
      prev.includes(id) ? prev.filter((leaveId) => leaveId !== id) : [...prev, id]
    );
  };

  // Handle export to XLSX
  const handleExport = async () => {
    try {
      const response = await axios.get('/api/leave', {
        params: { action: 'export' },
        responseType: 'blob', // Important for handling binary data
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `leaves_export_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      setSuccess('Leaves exported successfully');
    } catch (err: any) {
      console.error('Error exporting leaves:', err);
      setError('Export failed. Please try again.');
    }
  };

  // Handle file import for XLSX
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setError(null);
    setSuccess(null);
    console.log('Starting XLSX import:', file.name);
    try {
      const formData = new FormData();
      formData.append('file', file); // Ensure the key matches backend

      const response = await axios.post('/api/leave', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      console.log('Import Response:', response.data);

      if (response.status === 200) {
        setSuccess('Leaves imported successfully');
        fetchLeaves();
      } else {
        setError(response.data?.error || 'Import failed. Please try again.');
      }
    } catch (err: any) {
      console.error('Error importing leaves:', err);
      if (err.response && err.response.data && err.response.data.error) {
        setError(`Import failed: ${err.response.data.error}`);
      } else {
        setError('Import failed. Please try again.');
      }
    } finally {
      setImporting(false);
      e.target.value = ''; // Reset the file input
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Leave Management</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      {/* Import/Export Buttons */}
      <div className="mb-4 flex space-x-2">
        <button
          onClick={handleExport}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Export XLSX
        </button>
        <label className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded cursor-pointer">
          Import XLSX
          <input type="file" accept=".xlsx" onChange={handleImport} hidden />
        </label>
      </div>

      {/* Leave Form */}
      <form onSubmit={handleSubmit} className="mb-8 bg-white shadow-md rounded px-8 pt-6 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            name="LeaveName"
            value={formState.LeaveName}
            onChange={handleInputChange}
            placeholder="Leave Name"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
          <input
            type="number"
            name="MinUnit"
            value={formState.MinUnit}
            onChange={handleInputChange}
            placeholder="Minimum Unit"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            min={0}
          />
          <input
            type="number"
            name="Unit"
            value={formState.Unit}
            onChange={handleInputChange}
            placeholder="Unit"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            min={0}
          />
          <input
            type="text"
            name="RemaindProc"
            value={formState.RemaindProc}
            onChange={handleInputChange}
            placeholder="Remaind Proc"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
          <input
            type="number"
            name="RemaindCount"
            value={formState.RemaindCount}
            onChange={handleInputChange}
            placeholder="Remaind Count"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            min={0}
          />
          <input
            type="text"
            name="ReportSymbol"
            value={formState.ReportSymbol}
            onChange={handleInputChange}
            placeholder="Report Symbol"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
          <div className="flex items-center">
            <label className="mr-2">Deduct:</label>
            <input
              type="checkbox"
              name="Deduct"
              checked={formState.Deduct}
              onChange={handleInputChange}
              className="form-checkbox h-5 w-5 text-blue-600"
            />
          </div>
          <input
            type="color"
            name="Color"
            value={formState.Color}
            onChange={handleInputChange}
            className="w-full h-10 p-0 border-0"
          />
          <input
            type="text"
            name="Classify"
            value={formState.Classify}
            onChange={handleInputChange}
            placeholder="Classify"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
          <input
            type="text"
            name="Code"
            value={formState.Code}
            onChange={handleInputChange}
            placeholder="Code"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="mt-4">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            {editingLeave ? 'Update Leave' : 'Add Leave'}
          </button>
          {editingLeave && (
            <button
              type="button"
              onClick={() => {
                setEditingLeave(null);
                setFormState(initialLeaveFormState);
              }}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded ml-4"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      {/* Bulk Actions */}
      <div className="mb-4 flex space-x-2">
        <button
          onClick={handleBulkDelete}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Delete Selected
        </button>
        <button
          onClick={handleBulkCancel}
          className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"
        >
          Cancel Selected
        </button>
      </div>

      {/* Leave Table */}
      <h2 className="text-2xl font-semibold mb-4">Leave Records</h2>

      {isLoading ? (
        <div className="text-center">Loading leaves...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3">
                  <input
                    type="checkbox"
                    checked={selectedLeaves.length === leaves.length && leaves.length > 0}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Leave Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Min Unit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Remaind Proc
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Remaind Count
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Report Symbol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deduct
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Color
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Classify
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leaves.map((leave) => (
                <tr key={leave.LeaveId}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedLeaves.includes(leave.LeaveId)}
                      onChange={() => handleSelectOne(leave.LeaveId)}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{leave.LeaveName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{leave.MinUnit}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{leave.Unit}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{leave.RemaindProc}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{leave.RemaindCount}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{leave.ReportSymbol}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {leave.Deduct ? 'Yes' : 'No'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className="inline-block w-4 h-4 rounded-full"
                      style={{ backgroundColor: leave.Color }}
                    ></span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{leave.Classify}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{leave.Code}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{leave.Status}</td>
                  <td className="px-6 py-4 whitespace-nowrap space-x-2">
                    <button
                      onClick={() => handleEdit(leave)}
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-xs"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(leave.LeaveId)}
                      className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-xs"
                    >
                      Delete
                    </button>
                    {leave.Status !== 'Approved' && (
                      <button
                        onClick={() => handleStatusChange(leave.LeaveId, 'Approved')}
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded text-xs"
                      >
                        Approve
                      </button>
                    )}
                    {leave.Status !== 'Rejected' && (
                      <button
                        onClick={() => handleStatusChange(leave.LeaveId, 'Rejected')}
                        className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded text-xs"
                      >
                        Reject
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {importing && <div className="mt-4">Importing leaves...</div>}
    </div>
  );
};

export default LeavePage;

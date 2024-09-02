'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';

type EmployeeReport = {
  id: number;
  employeeName: string;
  employeeId: string;
  reportTitle: string;
  reportDescription: string;
  reportDate: string;
};

export default function EmployeeReportsPage() {
  const [reports, setReports] = useState<EmployeeReport[]>([]);
  const [newReport, setNewReport] = useState<EmployeeReport>({
    id: -1,
    employeeName: '',
    employeeId: '',
    reportTitle: '',
    reportDescription: '',
    reportDate: format(new Date(), 'yyyy-MM-dd'),
  });
  const [editingReport, setEditingReport] = useState<EmployeeReport | null>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await fetch('/api/reports');
      if (!res.ok) throw new Error('Failed to fetch reports');
      const data = await res.json();
      setReports(data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  const validateReport = (report: EmployeeReport) => {
    if (!report.employeeName || typeof report.employeeName !== 'string') {
      alert('Employee Name should be a string.');
      return false;
    }
    if (!report.employeeId || isNaN(Number(report.employeeId))) {
      alert('Employee ID should be a number.');
      return false;
    }
    if (!report.reportTitle || typeof report.reportTitle !== 'string') {
      alert('Report Title should be a string.');
      return false;
    }
    if (!report.reportDescription || typeof report.reportDescription !== 'string') {
      alert('Report Description should be a string.');
      return false;
    }
    return true;
  };

  const addOrUpdateReport = async () => {
    if (!validateReport(newReport)) return;

    try {
      if (editingReport) {
        const response = await fetch(`/api/reports?id=${editingReport.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newReport),
        });

        const result = await response.json();

        if (response.ok) {
          setReports(reports.map(report => (report.id === result.id ? result : report)));
          setEditingReport(null);
          setNewReport({
            id: -1,
            employeeName: '',
            employeeId: '',
            reportTitle: '',
            reportDescription: '',
            reportDate: format(new Date(), 'yyyy-MM-dd'),
          });
        } else {
          console.error('Failed to update report:', result);
        }
      } else {
        const response = await fetch('/api/reports', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newReport),
        });

        const result = await response.json();

        if (response.ok) {
          setReports([...reports, result]);
          setNewReport({
            id: -1,
            employeeName: '',
            employeeId: '',
            reportTitle: '',
            reportDescription: '',
            reportDate: format(new Date(), 'yyyy-MM-dd'),
          });
        } else {
          console.error('Failed to add report:', result);
        }
      }
    } catch (error) {
      console.error('Error adding/updating report:', error);
    }
  };

  const deleteReport = async (id: number) => {
    if (!confirm('Are you sure you want to delete this report? This action cannot be undone.')) return;

    try {
      const response = await fetch(`/api/reports?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setReports(reports.filter(report => report.id !== id));
      } else {
        console.error('Failed to delete report:', await response.json());
      }
    } catch (error) {
      console.error('Error deleting report:', error);
    }
  };

  const handleEdit = (report: EmployeeReport) => {
    setEditingReport(report);
    setNewReport(report);
  };

  const handleCancel = () => {
    setEditingReport(null);
    setNewReport({
      id: -1,
      employeeName: '',
      employeeId: '',
      reportTitle: '',
      reportDescription: '',
      reportDate: format(new Date(), 'yyyy-MM-dd'),
    });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">FGEHA Employee Reports</h1>

      {/* Add/Edit Report Form */}
      <div className="mb-4 p-4 border rounded shadow-lg bg-white">
        <h2 className="text-xl font-bold mb-2">{editingReport ? 'Edit Employee Report' : 'Add New Employee Report'}</h2>
        <input
          type="text"
          placeholder="Employee Name"
          value={newReport.employeeName}
          onChange={(e) => setNewReport({ ...newReport, employeeName: e.target.value })}
          className="p-2 mb-2 border rounded w-full"
        />
        <input
          type="text"
          placeholder="Employee ID"
          value={newReport.employeeId}
          onChange={(e) => setNewReport({ ...newReport, employeeId: e.target.value })}
          className="p-2 mb-2 border rounded w-full"
        />
        <input
          type="text"
          placeholder="Report Title"
          value={newReport.reportTitle}
          onChange={(e) => setNewReport({ ...newReport, reportTitle: e.target.value })}
          className="p-2 mb-2 border rounded w-full"
        />
        <textarea
          placeholder="Report Description"
          value={newReport.reportDescription}
          onChange={(e) => setNewReport({ ...newReport, reportDescription: e.target.value })}
          className="p-2 mb-2 border rounded w-full"
          rows={4}
        />
        <input
          type="date"
          value={newReport.reportDate}
          onChange={(e) => setNewReport({ ...newReport, reportDate: e.target.value })}
          className="p-2 mb-2 border rounded w-full"
        />
        <button
          onClick={addOrUpdateReport}
          className="p-2 bg-blue-500 text-white rounded w-full hover:bg-blue-600 transition"
        >
          {editingReport ? 'Update Report' : 'Add Report'}
        </button>
        {editingReport && (
          <button
            onClick={handleCancel}
            className="p-2 bg-gray-500 text-white rounded w-full mt-2 hover:bg-gray-600 transition"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Reports List */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-lg rounded border">
          <thead>
            <tr>
              <th className="p-3 border-b">Employee Name</th>
              <th className="p-3 border-b">Employee ID</th>
              <th className="p-3 border-b">Report Title</th>
              <th className="p-3 border-b">Description</th>
              <th className="p-3 border-b">Date</th>
              <th className="p-3 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report.id}>
                <td className="p-3 border-b">{report.employeeName}</td>
                <td className="p-3 border-b">{report.employeeId}</td>
                <td className="p-3 border-b">{report.reportTitle}</td>
                <td className="p-3 border-b">{report.reportDescription}</td>
                <td className="p-3 border-b">{format(new Date(report.reportDate), 'MMMM dd, yyyy')}</td>
                <td className="p-3 border-b">
                  <button
                    onClick={() => handleEdit(report)}
                    className="p-2 bg-yellow-500 text-white rounded mr-2 hover:bg-yellow-600 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteReport(report.id)}
                    className="p-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
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

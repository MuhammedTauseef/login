'use client';

import { useState } from 'react';
import { format } from 'date-fns';

type EmployeeReport = {
  id: number;
  employeeName: string;
  employeeId: string;
  reportTitle: string;
  reportDescription: string;
  reportDate: string;
};

const initialReports: EmployeeReport[] = [
  { id: 1, employeeName: 'Ahmed Ali', employeeId: 'FG001', reportTitle: 'Performance Evaluation', reportDescription: 'Annual performance review of Ahmed Ali.', reportDate: '2024-04-01' },
  { id: 2, employeeName: 'Sara Khan', employeeId: 'FG002', reportTitle: 'Project Involvement', reportDescription: 'Sara Khan\'s involvement in the Green City project.', reportDate: '2024-07-15' },
  // Add more reports as needed
];

export default function EmployeeReportsPage() {
  const [reports, setReports] = useState<EmployeeReport[]>(initialReports);
  const [newReport, setNewReport] = useState<EmployeeReport>({
    id: reports.length + 1,
    employeeName: '',
    employeeId: '',
    reportTitle: '',
    reportDescription: '',
    reportDate: format(new Date(), 'yyyy-MM-dd'),
  });

  const addReport = () => {
    if (newReport.employeeName && newReport.employeeId && newReport.reportTitle && newReport.reportDescription && newReport.reportDate) {
      setReports([...reports, { ...newReport, id: reports.length + 1 }]);
      setNewReport({
        id: reports.length + 2,
        employeeName: '',
        employeeId: '',
        reportTitle: '',
        reportDescription: '',
        reportDate: format(new Date(), 'yyyy-MM-dd'),
      });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">FGEHA Employee Reports</h1>

      {/* Add New Report Form */}
      <div className="mb-4 p-4 border rounded">
        <h2 className="text-xl font-bold mb-2">Add New Employee Report</h2>
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
          onClick={addReport}
          className="p-2 bg-blue-500 text-white rounded w-full"
        >
          Add Report
        </button>
      </div>

      {/* Reports List */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="p-3 border">Employee Name</th>
              <th className="p-3 border">Employee ID</th>
              <th className="p-3 border">Report Title</th>
              <th className="p-3 border">Description</th>
              <th className="p-3 border">Date</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report.id}>
                <td className="p-3 border">{report.employeeName}</td>
                <td className="p-3 border">{report.employeeId}</td>
                <td className="p-3 border">{report.reportTitle}</td>
                <td className="p-3 border">{report.reportDescription}</td>
                <td className="p-3 border">{format(new Date(report.reportDate), 'MMMM dd, yyyy')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

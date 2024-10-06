// components/PrintableContent.tsx
'use client';

import React, { forwardRef } from 'react';

const PrintableContent = forwardRef<HTMLDivElement>((props, ref) => {
  return (
    <div ref={ref} className="p-4">
      <h1 className="text-3xl font-bold mb-4">Attendance Report</h1>
      <p>This report provides detailed attendance information.</p>
      {/* Add more content as needed */}
      {/* Example Table */}
      <table className="min-w-full mt-4">
        <thead>
          <tr>
            <th className="border px-4 py-2">Employee ID</th>
            <th className="border px-4 py-2">Name</th>
            <th className="border px-4 py-2">Date</th>
            <th className="border px-4 py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {/* Populate with dynamic data as needed */}
          <tr>
            <td className="border px-4 py-2">E001</td>
            <td className="border px-4 py-2">John Doe</td>
            <td className="border px-4 py-2">2024-04-01</td>
            <td className="border px-4 py-2">Present</td>
          </tr>
          {/* Add more rows */}
        </tbody>
      </table>
    </div>
  );
});

export default PrintableContent;

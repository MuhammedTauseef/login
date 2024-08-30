'use client';

import { useState } from 'react';

type Wing = {
  id: number;
  name: string;
};

type Section = {
  id: number;
  name: string;
  wingId: number;
};

const initialWings: Wing[] = [
  { id: 1, name: 'Administration' },
  { id: 2, name: 'Finance' },
  { id: 3, name: 'Review' },
  // Add more wings as needed
];

const initialSections: Section[] = [
  { id: 1, name: 'HR', wingId: 1 },
  { id: 2, name: 'Procurement', wingId: 1 },
  { id: 3, name: 'Accounts', wingId: 2 },
  { id: 4, name: 'Budgeting', wingId: 2 },
  { id: 5, name: 'security', wingId: 3 },
  { id: 6, name: 'Electrical', wingId: 3 },
  // Add more sections as needed
];

export default function WingsSectionsPage() {
  const [wings, setWings] = useState<Wing[]>(initialWings);
  const [sections, setSections] = useState<Section[]>(initialSections);
  const [newWing, setNewWing] = useState<Wing>({ id: wings.length + 1, name: '' });
  const [newSection, setNewSection] = useState<Section>({ id: sections.length + 1, name: '', wingId: 1 });

  const addWing = () => {
    if (newWing.name) {
      setWings([...wings, { ...newWing, id: wings.length + 1 }]);
      setNewWing({ id: wings.length + 2, name: '' });
    }
  };

  const addSection = () => {
    if (newSection.name && newSection.wingId) {
      setSections([...sections, { ...newSection, id: sections.length + 1 }]);
      setNewSection({ id: sections.length + 2, name: '', wingId: 1 });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">FGEHA Wings & Sections</h1>

      {/* Add New Wing Form */}
      <div className="mb-4 p-4 border rounded">
        <h2 className="text-xl font-bold mb-2">Add New Wing</h2>
        <input
          type="text"
          placeholder="Wing Name"
          value={newWing.name}
          onChange={(e) => setNewWing({ ...newWing, name: e.target.value })}
          className="p-2 mb-2 border rounded w-full"
        />
        <button
          onClick={addWing}
          className="p-2 bg-blue-500 text-white rounded w-full"
        >
          Add Wing
        </button>
      </div>

      {/* Add New Section Form */}
      <div className="mb-4 p-4 border rounded">
        <h2 className="text-xl font-bold mb-2">Add New Section</h2>
        <input
          type="text"
          placeholder="Section Name"
          value={newSection.name}
          onChange={(e) => setNewSection({ ...newSection, name: e.target.value })}
          className="p-2 mb-2 border rounded w-full"
        />
        <select
          value={newSection.wingId}
          onChange={(e) => setNewSection({ ...newSection, wingId: Number(e.target.value) })}
          className="p-2 mb-2 border rounded w-full"
        >
          {wings.map((wing) => (
            <option key={wing.id} value={wing.id}>
              {wing.name}
            </option>
          ))}
        </select>
        <button
          onClick={addSection}
          className="p-2 bg-blue-500 text-white rounded w-full"
        >
          Add Section
        </button>
      </div>

      {/* Wings & Sections List */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="p-3 border">Wing</th>
              <th className="p-3 border">Section</th>
            </tr>
          </thead>
          <tbody>
            {wings.map((wing) => (
              <tr key={wing.id}>
                <td className="p-3 border font-bold">{wing.name}</td>
                <td className="p-3 border">
                  {sections
                    .filter((section) => section.wingId === wing.id)
                    .map((section) => (
                      <div key={section.id} className="mb-2">
                        {section.name}
                      </div>
                    ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

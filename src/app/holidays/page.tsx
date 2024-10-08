'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import * as XLSX from 'xlsx';

interface Holiday {
  HOLIDAYID: number;
  HOLIDAYNAME: string;
  HOLIDAYYEAR: number;
  HOLIDAYMONTH: number;
  HOLIDAYDAY: number;
  STARTTIME: string;
  DURATION: number;
  HOLIDAYTYPE: string;
  XINBIE: string;
  MINZU: string;
  DeptID: number;
  timezone: string;
}

export default function HolidaysPage() {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [newHoliday, setNewHoliday] = useState<Holiday>({
    HOLIDAYID: 0,
    HOLIDAYNAME: '',
    HOLIDAYYEAR: new Date().getFullYear(),
    HOLIDAYMONTH: new Date().getMonth() + 1,
    HOLIDAYDAY: new Date().getDate(),
    STARTTIME: '00:00:00',
    DURATION: 1,
    HOLIDAYTYPE: '',
    XINBIE: '',
    MINZU: '',
    DeptID: 0,
    timezone: '',
  });
  const [selectedHolidays, setSelectedHolidays] = useState<number[]>([]);
  const [editingHolidayId, setEditingHolidayId] = useState<number | null>(null);
  const [editedHoliday, setEditedHoliday] = useState<Holiday>(newHoliday);

  // Fetch holidays from the API
  const fetchHolidays = async () => {
    try {
      const res = await fetch('/api/holidays');
      if (!res.ok) {
        throw new Error('Failed to fetch holidays');
      }
      const data: Holiday[] = await res.json();
      setHolidays(data);
    } catch (error) {
      console.error('Error fetching holidays:', error);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  // Add a new holiday to the API
  const addHoliday = async () => {
    if (
      newHoliday.HOLIDAYID &&
      newHoliday.HOLIDAYNAME &&
      newHoliday.HOLIDAYYEAR &&
      newHoliday.HOLIDAYMONTH &&
      newHoliday.HOLIDAYDAY
    ) {
      try {
        const res = await fetch('/api/holidays', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newHoliday),
        });

        if (res.ok) {
          const insertedHoliday: Holiday = await res.json();
          setHolidays([...holidays, insertedHoliday]);
          setNewHoliday({
            HOLIDAYID: 0,
            HOLIDAYNAME: '',
            HOLIDAYYEAR: new Date().getFullYear(),
            HOLIDAYMONTH: new Date().getMonth() + 1,
            HOLIDAYDAY: new Date().getDate(),
            STARTTIME: '00:00:00',
            DURATION: 1,
            HOLIDAYTYPE: '',
            XINBIE: '',
            MINZU: '',
            DeptID: 0,
            timezone: '',
          });
        } else {
          const error = await res.json();
          console.error('Failed to add holiday:', error.message);
        }
      } catch (error) {
        console.error('Error adding holiday:', error);
      }
    } else {
      alert('Please fill in all required fields.');
    }
  };

  // Delete a holiday from the API
  const deleteHoliday = async (id: number) => {
    try {
      const res = await fetch(`/api/holidays/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        const result = await res.json();
        if (result.message) {
          console.log(result.message);
          setHolidays(holidays.filter((holiday) => holiday.HOLIDAYID !== id));
        } else if (result.error) {
          console.error('Failed to delete holiday:', result.error);
        }
      } else {
        const error = await res.json();
        console.error('Failed to delete holiday:', error.message);
      }
    } catch (error) {
      console.error('Error deleting holiday:', error);
    }
  };

  // Bulk delete holidays
  const bulkDeleteHolidays = async () => {
    if (selectedHolidays.length === 0) return;

    try {
      const res = await fetch('/api/holidays/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedHolidays }),
      });

      if (res.ok) {
        const result = await res.json();
        if (result.message) {
          console.log(result.message);
          setHolidays(
            holidays.filter((holiday) => !selectedHolidays.includes(holiday.HOLIDAYID))
          );
          setSelectedHolidays([]);
        } else if (result.error) {
          console.error('Failed to bulk delete holidays:', result.error);
        }
      } else {
        const error = await res.json();
        console.error('Failed to bulk delete holidays:', error.message);
      }
    } catch (error) {
      console.error('Error bulk deleting holidays:', error);
    }
  };

  // Update a holiday
  const updateHoliday = async (id: number) => {
    try {
      const res = await fetch(`/api/holidays/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedHoliday),
      });

      if (res.ok) {
        const updatedHoliday: Holiday = await res.json();
        setHolidays(
          holidays.map((holiday) =>
            holiday.HOLIDAYID === id ? updatedHoliday : holiday
          )
        );
        setEditingHolidayId(null);
        setEditedHoliday(newHoliday);
      } else {
        const error = await res.json();
        console.error('Failed to update holiday:', error.message);
      }
    } catch (error) {
      console.error('Error updating holiday:', error);
    }
  };

  // Handle checkbox change
  const handleCheckboxChange = (id: number) => {
    setSelectedHolidays((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((holidayId) => holidayId !== id)
        : [...prevSelected, id]
    );
  };

  // Handle select all change
  const handleSelectAll = () => {
    if (selectedHolidays.length === holidays.length) {
      setSelectedHolidays([]);
    } else {
      setSelectedHolidays(holidays.map((holiday) => holiday.HOLIDAYID));
    }
  };

  // Handle input changes
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    isEditMode = false
  ) => {
    const { name, value } = e.target;
    const parsedValue =
      name.startsWith('HOLIDAY') && name !== 'HOLIDAYNAME' ? Number(value) : value;
    if (isEditMode) {
      setEditedHoliday({ ...editedHoliday, [name]: parsedValue });
    } else {
      setNewHoliday({ ...newHoliday, [name]: parsedValue });
    }
  };

  // Handle edit button click
  const handleEditClick = (holiday: Holiday) => {
    setEditingHolidayId(holiday.HOLIDAYID);
    setEditedHoliday(holiday);
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingHolidayId(null);
    setEditedHoliday(newHoliday);
  };

  // Import from Excel
  const importFromExcel = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json<Holiday>(ws);

        // Send imported holidays to the API
        try {
          const res = await fetch('/api/holidays/bulk-import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });

          if (res.ok) {
            const message = await res.json();
            console.log(message.message);
            // Re-fetch holidays from the API
            fetchHolidays();
          } else {
            const error = await res.json();
            console.error('Failed to import holidays:', error.message);
          }
        } catch (error) {
          console.error('Error importing holidays:', error);
        }
      };
      reader.readAsBinaryString(file);
    }
  };

  // Export to Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(holidays);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Holidays');
    XLSX.writeFile(workbook, 'holidays.xlsx');
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">FGEHA Holidays</h1>

      {/* Add New Holiday Form */}
      <div className="mb-4 p-4 border rounded">
        <h2 className="text-xl font-bold mb-2">Add New Holiday</h2>
        <div className="grid grid-cols-2 gap-4">
          <input
            type="number"
            name="HOLIDAYID"
            placeholder="Holiday ID"
            value={newHoliday.HOLIDAYID}
            onChange={(e) => handleInputChange(e)}
            className="p-2 mb-2 border rounded w-full"
          />
          <input
            type="text"
            name="HOLIDAYNAME"
            placeholder="Holiday Name"
            value={newHoliday.HOLIDAYNAME}
            onChange={(e) => handleInputChange(e)}
            className="p-2 mb-2 border rounded w-full"
          />
          <input
            type="number"
            name="HOLIDAYYEAR"
            placeholder="Holiday Year"
            value={newHoliday.HOLIDAYYEAR}
            onChange={(e) => handleInputChange(e)}
            className="p-2 mb-2 border rounded w-full"
          />
          <input
            type="number"
            name="HOLIDAYMONTH"
            placeholder="Holiday Month"
            value={newHoliday.HOLIDAYMONTH}
            onChange={(e) => handleInputChange(e)}
            className="p-2 mb-2 border rounded w-full"
          />
          <input
            type="number"
            name="HOLIDAYDAY"
            placeholder="Holiday Day"
            value={newHoliday.HOLIDAYDAY}
            onChange={(e) => handleInputChange(e)}
            className="p-2 mb-2 border rounded w-full"
          />
          <input
            type="time"
            name="STARTTIME"
            placeholder="Start Time"
            value={newHoliday.STARTTIME}
            onChange={(e) => handleInputChange(e)}
            className="p-2 mb-2 border rounded w-full"
          />
          <input
            type="number"
            name="DURATION"
            placeholder="Duration"
            value={newHoliday.DURATION}
            onChange={(e) => handleInputChange(e)}
            className="p-2 mb-2 border rounded w-full"
          />
          <input
            type="text"
            name="HOLIDAYTYPE"
            placeholder="Holiday Type"
            value={newHoliday.HOLIDAYTYPE}
            onChange={(e) => handleInputChange(e)}
            className="p-2 mb-2 border rounded w-full"
          />
          <input
            type="text"
            name="XINBIE"
            placeholder="XINBIE"
            value={newHoliday.XINBIE}
            onChange={(e) => handleInputChange(e)}
            className="p-2 mb-2 border rounded w-full"
          />
          <input
            type="text"
            name="MINZU"
            placeholder="MINZU"
            value={newHoliday.MINZU}
            onChange={(e) => handleInputChange(e)}
            className="p-2 mb-2 border rounded w-full"
          />
          <input
            type="number"
            name="DeptID"
            placeholder="DeptID"
            value={newHoliday.DeptID}
            onChange={(e) => handleInputChange(e)}
            className="p-2 mb-2 border rounded w-full"
          />
          <input
            type="text"
            name="timezone"
            placeholder="Timezone"
            value={newHoliday.timezone}
            onChange={(e) => handleInputChange(e)}
            className="p-2 mb-2 border rounded w-full"
          />
        </div>
        <button
          onClick={addHoliday}
          className="p-2 bg-blue-500 text-white rounded w-full"
        >
          Add Holiday
        </button>
      </div>

      {/* Actions */}
      <div className="mb-4 flex space-x-2">
        <button
          onClick={bulkDeleteHolidays}
          disabled={selectedHolidays.length === 0}
          className="p-2 bg-red-500 text-white rounded disabled:opacity-50"
        >
          Delete Selected
        </button>
        <button
          onClick={() => setSelectedHolidays([])}
          disabled={selectedHolidays.length === 0}
          className="p-2 bg-gray-500 text-white rounded disabled:opacity-50"
        >
          Cancel Selection
        </button>
        <button
          onClick={exportToExcel}
          className="p-2 bg-green-500 text-white rounded"
        >
          Export to Excel
        </button>
        <label className="p-2 bg-yellow-500 text-white rounded cursor-pointer">
          Import from Excel
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={importFromExcel}
            className="hidden"
          />
        </label>
      </div>

      {/* Holiday List */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="p-3 border">
                <input
                  type="checkbox"
                  checked={selectedHolidays.length === holidays.length}
                  onChange={handleSelectAll}
                />
              </th>
              <th className="p-3 border">Holiday ID</th>
              <th className="p-3 border">Holiday Name</th>
              <th className="p-3 border">Holiday Year</th>
              <th className="p-3 border">Holiday Month</th>
              <th className="p-3 border">Holiday Day</th>
              <th className="p-3 border">Start Time</th>
              <th className="p-3 border">Duration</th>
              <th className="p-3 border">Holiday Type</th>
              <th className="p-3 border">XINBIE</th>
              <th className="p-3 border">MINZU</th>
              <th className="p-3 border">DeptID</th>
              <th className="p-3 border">Timezone</th>
              <th className="p-3 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {holidays.map((holiday) => (
              <tr key={holiday.HOLIDAYID}>
                <td className="p-3 border text-center">
                  <input
                    type="checkbox"
                    checked={selectedHolidays.includes(holiday.HOLIDAYID)}
                    onChange={() => handleCheckboxChange(holiday.HOLIDAYID)}
                  />
                </td>
                {editingHolidayId === holiday.HOLIDAYID ? (
                  <>
                    <td className="p-3 border">{holiday.HOLIDAYID}</td>
                    <td className="p-3 border">
                      <input
                        type="text"
                        name="HOLIDAYNAME"
                        value={editedHoliday.HOLIDAYNAME}
                        onChange={(e) => handleInputChange(e, true)}
                        className="p-2 border rounded w-full"
                      />
                    </td>
                    <td className="p-3 border">
                      <input
                        type="number"
                        name="HOLIDAYYEAR"
                        value={editedHoliday.HOLIDAYYEAR}
                        onChange={(e) => handleInputChange(e, true)}
                        className="p-2 border rounded w-full"
                      />
                    </td>
                    <td className="p-3 border">
                      <input
                        type="number"
                        name="HOLIDAYMONTH"
                        value={editedHoliday.HOLIDAYMONTH}
                        onChange={(e) => handleInputChange(e, true)}
                        className="p-2 border rounded w-full"
                      />
                    </td>
                    <td className="p-3 border">
                      <input
                        type="number"
                        name="HOLIDAYDAY"
                        value={editedHoliday.HOLIDAYDAY}
                        onChange={(e) => handleInputChange(e, true)}
                        className="p-2 border rounded w-full"
                      />
                    </td>
                    <td className="p-3 border">
                      <input
                        type="time"
                        name="STARTTIME"
                        value={editedHoliday.STARTTIME}
                        onChange={(e) => handleInputChange(e, true)}
                        className="p-2 border rounded w-full"
                      />
                    </td>
                    <td className="p-3 border">
                      <input
                        type="number"
                        name="DURATION"
                        value={editedHoliday.DURATION}
                        onChange={(e) => handleInputChange(e, true)}
                        className="p-2 border rounded w-full"
                      />
                    </td>
                    <td className="p-3 border">
                      <input
                        type="text"
                        name="HOLIDAYTYPE"
                        value={editedHoliday.HOLIDAYTYPE}
                        onChange={(e) => handleInputChange(e, true)}
                        className="p-2 border rounded w-full"
                      />
                    </td>
                    <td className="p-3 border">
                      <input
                        type="text"
                        name="XINBIE"
                        value={editedHoliday.XINBIE}
                        onChange={(e) => handleInputChange(e, true)}
                        className="p-2 border rounded w-full"
                      />
                    </td>
                    <td className="p-3 border">
                      <input
                        type="text"
                        name="MINZU"
                        value={editedHoliday.MINZU}
                        onChange={(e) => handleInputChange(e, true)}
                        className="p-2 border rounded w-full"
                      />
                    </td>
                    <td className="p-3 border">
                      <input
                        type="number"
                        name="DeptID"
                        value={editedHoliday.DeptID}
                        onChange={(e) => handleInputChange(e, true)}
                        className="p-2 border rounded w-full"
                      />
                    </td>
                    <td className="p-3 border">
                      <input
                        type="text"
                        name="timezone"
                        value={editedHoliday.timezone}
                        onChange={(e) => handleInputChange(e, true)}
                        className="p-2 border rounded w-full"
                      />
                    </td>
                    <td className="p-3 border">
                      <button
                        onClick={() => updateHoliday(holiday.HOLIDAYID)}
                        className="bg-green-500 text-white p-2 rounded mr-2"
                      >
                        Update
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="bg-gray-500 text-white p-2 rounded"
                      >
                        Cancel
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="p-3 border">{holiday.HOLIDAYID}</td>
                    <td className="p-3 border">{holiday.HOLIDAYNAME}</td>
                    <td className="p-3 border">{holiday.HOLIDAYYEAR}</td>
                    <td className="p-3 border">{holiday.HOLIDAYMONTH}</td>
                    <td className="p-3 border">{holiday.HOLIDAYDAY}</td>
                    <td className="p-3 border">{holiday.STARTTIME}</td>
                    <td className="p-3 border">{holiday.DURATION}</td>
                    <td className="p-3 border">{holiday.HOLIDAYTYPE}</td>
                    <td className="p-3 border">{holiday.XINBIE}</td>
                    <td className="p-3 border">{holiday.MINZU}</td>
                    <td className="p-3 border">{holiday.DeptID}</td>
                    <td className="p-3 border">{holiday.timezone}</td>
                    <td className="p-3 border">
                      <button
                        onClick={() => handleEditClick(holiday)}
                        className="bg-blue-500 text-white p-2 rounded mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteHoliday(holiday.HOLIDAYID)}
                        className="bg-red-500 text-white p-2 rounded"
                      >
                        Delete
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

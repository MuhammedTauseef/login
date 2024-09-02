'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';

interface Holiday {
  id: number;
  name: string;
  date: string;
}

export default function HolidaysPage() {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [newHoliday, setNewHoliday] = useState<Omit<Holiday, 'id'>>({
    name: '',
    date: format(new Date(), 'yyyy-MM-dd'),
  });

  // Fetch holidays from the API
  useEffect(() => {
    async function fetchHolidays() {
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
    }

    fetchHolidays();
  }, []);

  // Add a new holiday to the API
  const addHoliday = async () => {
    if (newHoliday.name && newHoliday.date) {
      try {
        const res = await fetch('/api/holidays', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newHoliday),
        });

        if (res.ok) {
          const newEntry: Holiday = await res.json();
          setHolidays([...holidays, newEntry]);
          setNewHoliday({ name: '', date: format(new Date(), 'yyyy-MM-dd') });
        } else {
          const error = await res.json();
          console.error('Failed to add holiday:', error.message);
        }
      } catch (error) {
        console.error('Error adding holiday:', error);
      }
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
          console.log(result.message); // Log success message if needed
          setHolidays(holidays.filter(holiday => holiday.id !== id));
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
  


  // Handle changes in the holiday name input field
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewHoliday({ ...newHoliday, name: e.target.value });
  };

  // Handle changes in the holiday date input field
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewHoliday({ ...newHoliday, date: e.target.value });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">FGEHA Holidays</h1>

      {/* Add New Holiday Form */}
      <div className="mb-4 p-4 border rounded">
        <h2 className="text-xl font-bold mb-2">Add New Holiday</h2>
        <input
          type="text"
          placeholder="Holiday Name"
          value={newHoliday.name}
          onChange={handleNameChange}
          className="p-2 mb-2 border rounded w-full"
        />
        <input
          type="date"
          value={newHoliday.date}
          onChange={handleDateChange}
          className="p-2 mb-2 border rounded w-full"
        />
        <button
          onClick={addHoliday}
          className="p-2 bg-blue-500 text-white rounded w-full"
        >
          Add Holiday
        </button>
      </div>

      {/* Holiday List */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="p-3 border">Holiday Name</th>
              <th className="p-3 border">Holiday Date</th>
              <th className="p-3 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {holidays.map((holiday) => (
              <tr key={holiday.id}>
                <td className="p-3 border">{holiday.name}</td>
                <td className="p-3 border">
                  {format(new Date(holiday.date), 'MMMM dd, yyyy')}
                </td>
                <td className="p-3 border">
                  <button
                    onClick={() => deleteHoliday(holiday.id)}
                    className="bg-red-500 text-white p-2 rounded"
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

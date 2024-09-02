'use client';

import { useEffect, useState } from 'react';

interface Employee {
  id?: number;
  name: string;
  code: string;
  designation: string;
  bps: number;
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [newEmployee, setNewEmployee] = useState<Employee>({
    name: '',
    code: '',
    designation: '',
    bps: 0,
  });
  const [editingEmployee, setEditingEmployee] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/employees');
      if (!response.ok) {
        throw new Error('Failed to fetch employees');
      }
      const data: Employee[] = await response.json();
      setEmployees(data);
    } catch (error) {
      setError('Error fetching employees. Please try again.');
      console.error('Error fetching employees:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateDashboard = async () => {
    try {
      await fetch('/api/dashboard/update', { method: 'POST' });
    } catch (error) {
      console.error('Error updating dashboard:', error);
    }
  };

  const validateForm = (): boolean => {
    const { name, code, designation, bps } = newEmployee;
    if (!name || !code || !designation || bps < 1) {
      setError('Please fill out all required fields.');
      return false;
    }
    return true;
  };

  const saveEmployee = async (): Promise<void> => {
    if (!validateForm()) return;

    try {
      const url = editingEmployee !== null ? `/api/employees?id=${editingEmployee}` : '/api/employees';
      const method = editingEmployee !== null ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newEmployee),
      });

      if (!response.ok) {
        throw new Error('Failed to save employee');
      }

      const savedEmployee: Employee = await response.json();

      if (editingEmployee !== null) {
        setEmployees(employees.map((employee) =>
          employee.id === editingEmployee ? savedEmployee : employee
        ));
      } else {
        setEmployees([...employees, savedEmployee]);
      }

      resetForm();
      await updateDashboard();
    } catch (error) {
      setError('Error saving employee. Please try again.');
      console.error('Error saving employee:', error);
    }
  };

  const resetForm = (): void => {
    setNewEmployee({
      name: '',
      code: '',
      designation: '',
      bps: 0,
    });
    setEditingEmployee(null);
    setError(null);
  };

  const editEmployee = (id: number): void => {
    const employee = employees.find((emp) => emp.id === id);
    if (employee) {
      setNewEmployee(employee);
      setEditingEmployee(id);
    }
  };

  const deleteEmployee = async (id: number): Promise<void> => {
    if (confirm('Are you sure you want to delete this employee?')) {
      try {
        const response = await fetch(`/api/employees?id=${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete employee');
        }

        setEmployees(employees.filter((employee) => employee.id !== id));
        await updateDashboard();
      } catch (error) {
        setError('Error deleting employee. Please try again.');
        console.error('Error deleting employee:', error);
      }
    }
  };

  const filteredEmployees = employees.filter(
    (employee) =>
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.designation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return <div className="text-center mt-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Employees</h1>
      </div>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      <input
        type="text"
        placeholder="Search by name, code, or designation"
        className="w-full p-2 mb-4 border rounded"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div className="mb-4 p-4 border rounded bg-gray-50">
        <h2 className="text-xl font-bold mb-2">
          {editingEmployee !== null ? 'Edit Employee' : 'Add New Employee'}
        </h2>
        <input
          type="text"
          placeholder="Name"
          value={newEmployee.name}
          onChange={(e) =>
            setNewEmployee({ ...newEmployee, name: e.target.value })
          }
          className="p-2 mb-2 border rounded w-full"
        />
        <input
          type="text"
          placeholder="Code"
          value={newEmployee.code}
          onChange={(e) =>
            setNewEmployee({ ...newEmployee, code: e.target.value })
          }
          className="p-2 mb-2 border rounded w-full"
        />
        <input
          type="text"
          placeholder="Designation"
          value={newEmployee.designation}
          onChange={(e) =>
            setNewEmployee({ ...newEmployee, designation: e.target.value })
          }
          className="p-2 mb-2 border rounded w-full"
        />
        <input
          type="number"
          placeholder="BPS"
          value={newEmployee.bps}
          onChange={(e) =>
            setNewEmployee({ ...newEmployee, bps: parseInt(e.target.value) })
          }
          className="p-2 mb-2 border rounded w-full"
        />
        <button
          onClick={saveEmployee}
          className="p-2 bg-blue-500 text-white rounded w-full hover:bg-blue-600 transition"
        >
          {editingEmployee !== null ? 'Update Employee' : 'Add Employee'}
        </button>
        {editingEmployee !== null && (
          <button
            onClick={resetForm}
            className="p-2 bg-gray-500 text-white rounded w-full mt-2 hover:bg-gray-600 transition"
          >
            Cancel Edit
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 border">Code</th>
              <th className="p-3 border">Name</th>
              <th className="p-3 border">Designation</th>
              <th className="p-3 border">BPS</th>
              <th className="p-3 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map((employee) => (
              <tr key={employee.id} className="hover:bg-gray-50">
                <td className="p-3 border">{employee.code}</td>
                <td className="p-3 border">{employee.name}</td>
                <td className="p-3 border">{employee.designation}</td>
                <td className="p-3 border">{employee.bps}</td>
                <td className="p-3 border">
                  <button
                    onClick={() => editEmployee(employee.id!)}
                    className="text-blue-500 hover:underline mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteEmployee(employee.id!)}
                    className="text-red-500 hover:underline mr-2"
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

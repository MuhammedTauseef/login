'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

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
    bps: 1,
  });
  const [editingEmployee, setEditingEmployee] = useState<number | null>(null);

  // Fetch employees data from API
  useEffect(() => {
    fetch('/api/employees')
      .then((response) => response.json())
      .then((data: Employee[]) => setEmployees(data))
      .catch((error) => console.error('Error fetching employees:', error));
  }, []);

  // Filter employees based on search term
  const filteredEmployees = employees.filter(
    (employee) =>
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.designation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Validate form data
  const validateForm = (): boolean => {
    const { name, code, designation, bps } = newEmployee;
    if (!name || !code || !designation || bps < 1) {
      alert('Please fill out all required fields.');
      return false;
    }
    return true;
  };

  // Save employee (add or update)
  const saveEmployee = (): void => {
    if (!validateForm()) return;

    if (editingEmployee !== null) {
      // Update existing employee
      fetch(`/api/employees?id=${editingEmployee}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newEmployee),
      })
        .then((response) => response.json())
        .then((updatedEmployee: Employee) => {
          setEmployees(
            employees.map((employee) =>
              employee.id === editingEmployee ? updatedEmployee : employee
            )
          );
          resetForm();
        })
        .catch((error) => console.error('Error updating employee:', error));
    } else {
      // Add new employee
      fetch('/api/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newEmployee),
      })
        .then((response) => response.json())
        .then((newEmployee: Employee) => {
          setEmployees([...employees, newEmployee]);
          resetForm();
        })
        .catch((error) => console.error('Error adding employee:', error));
    }
  };

  // Reset form after adding or updating
  const resetForm = (): void => {
    setNewEmployee({
      name: '',
      code: '',
      designation: '',
      bps: 1,
    });
    setEditingEmployee(null);
  };

  // Edit employee
  const editEmployee = (id: number): void => {
    const employee = employees.find((emp) => emp.id === id);
    if (employee) {
      setNewEmployee(employee);
      setEditingEmployee(id);
    }
  };

  // Delete employee
  const deleteEmployee = (id: number): void => {
    if (confirm('Are you sure you want to delete this employee?')) {
      fetch(`/api/employees?id=${id}`, {
        method: 'DELETE',
      })
        .then(() => {
          setEmployees(employees.filter((employee) => employee.id !== id));
        })
        .catch((error) => console.error('Error deleting employee:', error));
    }
  };

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-4">Employees</h1>
      <input
        type="text"
        placeholder="Search by name, code, or designation"
        className="w-full p-2 mb-4 border rounded"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div className="mb-4 p-4 border rounded">
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
          className="p-2 bg-blue-500 text-white rounded w-full"
        >
          {editingEmployee !== null ? 'Update Employee' : 'Add Employee'}
        </button>
        {editingEmployee !== null && (
          <button
            onClick={resetForm}
            className="p-2 bg-gray-500 text-white rounded w-full mt-2"
          >
            Cancel Edit
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
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
              <tr key={employee.id}>
                <td className="p-3 border">{employee.code}</td>
                <td className="p-3 border">{employee.name}</td>
                <td className="p-3 border">{employee.designation}</td>
                <td className="p-3 border">{employee.bps}</td>
                <td className="p-3 border">
                  <button
                    onClick={() => editEmployee(employee.id!)}
                    className="text-blue-500 hover:underline"
                  >
                    Edit
                  </button>
                  {' | '}
                  <button
                    onClick={() => deleteEmployee(employee.id!)}
                    className="text-red-500 hover:underline"
                  >
                    Delete
                  </button>
                  {' | '}
                  <Link href={`/employees/${employee.id}`} className="text-primary hover:underline">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// src/pages/EmployeesPage.tsx

'use client';

import { useEffect, useState, useRef } from 'react';
import jsPDF from 'jspdf'; // For PDF generation
import 'jspdf-autotable'; // For table formatting in PDF
import * as XLSX from 'xlsx'; // For Excel file handling

function EmployeesPage() {
  // State variables
  const [employees, setEmployees] = useState([]);
  const [newEmployee, setNewEmployee] = useState({});
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // Define the fields to display and edit (excluding USERID from editable fields)
  const employeeFields = [
    'USERID', // Displayed but read-only
    'Badgenumber',
    'SSN',
    'Name',
    'Gender',
    'TITLE',
    'PAGER',
    'BIRTHDAY',
    'HIREDDAY',
    'street',
    'CITY',
    'STATE',
    'ZIP',
    'OPHONE',
    'FPHONE',
    'VERIFICATIONMETHOD',
    'DEFAULTDEPTID',
    'SECURITYFLAGS',
    'ATT',
    'INLATE',
    'OUTEARLY',
    'OVERTIME',
    'SEP',
    'HOLIDAY',
    'MINZU',
    'PASSWORD',
    'LUNCHDURATION',
    'Notes',
    'privilege',
    'InheritDeptSch',
    'InheritDeptSchClass',
    'AutoSchPlan',
    'MinAutoSchInterval',
    'RegisterOT',
    'InheritDeptRule',
    'EMPRIVILEGE',
    'CardNo',
    'FaceGroup',
    'AccGroup',
    'UseAccGroupTZ',
    'VerifyCode',
    'Expires',
    'ValidCount',
    'ValidTimeBegin',
    'ValidTimeEnd',
    'TimeZone1',
    'TimeZone2',
    'TimeZone3',
    'Pin1',
  ];

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Fetch employees from the backend
  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/employees');
      if (!response.ok) {
        throw new Error('Failed to fetch employees');
      }
      const data = await response.json();
      setEmployees(data);
    } catch (error) {
      setError('Error fetching employees. Please try again.');
      console.error('Error fetching employees:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Save employee (add or update)
  const saveEmployee = async () => {
    if (!validateForm()) return;

    try {
      const url =
        editingEmployee !== null
          ? `/api/employees?id=${editingEmployee}`
          : '/api/employees';
      const method = editingEmployee !== null ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newEmployee),
      });

      const responseData = await response.json();

      if (!response.ok) {
        setError(responseData.error || 'Failed to save employee');
        return;
      }

      const savedEmployee = responseData;

      if (editingEmployee !== null) {
        setEmployees(
          employees.map((employee) =>
            employee.USERID === editingEmployee ? savedEmployee : employee
          )
        );
      } else {
        setEmployees([...employees, savedEmployee]);
      }

      resetForm();
    } catch (error) {
      setError(`Error saving employee: ${error.message}`);
      console.error('Error saving employee:', error);
    }
  };

  // Validate form inputs
  const validateForm = () => {
    const requiredFields = ['Badgenumber', 'Name', 'Gender', 'TITLE']; // Excluded USERID
    for (const field of requiredFields) {
      if (!newEmployee[field]) {
        setError(`Please fill out the ${field} field.`);
        return false;
      }
    }
    return true;
  };

  // Reset form to initial state
  const resetForm = () => {
    const emptyEmployee = {};
    employeeFields.forEach((field) => {
      emptyEmployee[field] = '';
    });
    setNewEmployee(emptyEmployee);
    setEditingEmployee(null);
    setError(null);
  };

  // Edit an existing employee
  const editEmployee = (id) => {
    const employee = employees.find((emp) => emp.USERID === id);
    if (employee) {
      setNewEmployee(employee);
      setEditingEmployee(id);
    }
  };

  // Delete an employee
  const deleteEmployee = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        const response = await fetch(`/api/employees?id=${id}`, {
          method: 'DELETE',
        });

        const responseData = await response.json();

        if (!response.ok) {
          setError(responseData.error || 'Failed to delete employee');
          return;
        }

        setEmployees(employees.filter((employee) => employee.USERID !== id));
        setSelectedEmployees(
          selectedEmployees.filter((employeeId) => employeeId !== id)
        );
      } catch (error) {
        setError(`Error deleting employee: ${error.message}`);
        console.error('Error deleting employee:', error);
      }
    }
  };

  // Bulk delete employees
  const bulkDeleteEmployees = async () => {
    if (selectedEmployees.length === 0) {
      alert('No employees selected for deletion.');
      return;
    }

    if (
      window.confirm(
        `Are you sure you want to delete ${selectedEmployees.length} employees?`
      )
    ) {
      try {
        const response = await fetch('/api/employees', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ids: selectedEmployees }),
        });

        const responseData = await response.json();

        if (!response.ok) {
          setError(responseData.error || 'Failed to delete employees');
          return;
        }

        setEmployees(
          employees.filter(
            (employee) => !selectedEmployees.includes(employee.USERID)
          )
        );
        setSelectedEmployees([]);
        setSelectAll(false);
      } catch (error) {
        setError(`Error deleting employees: ${error.message}`);
        console.error('Error deleting employees:', error);
      }
    }
  };

  // Cancel selection
  const cancelSelection = () => {
    setSelectedEmployees([]);
    setSelectAll(false);
  };

  // Handle checkbox change for individual rows
  const handleCheckboxChange = (id) => {
    if (selectedEmployees.includes(id)) {
      setSelectedEmployees(
        selectedEmployees.filter((employeeId) => employeeId !== id)
      );
    } else {
      setSelectedEmployees([...selectedEmployees, id]);
    }
  };

  // Handle select all checkbox
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(employees.map((employee) => employee.USERID));
    }
    setSelectAll(!selectAll);
  };

  // Filter employees based on search term
  const filteredEmployees = employees.filter((employee) => {
    const term = searchTerm.toLowerCase();
    return employeeFields.some((field) =>
      employee[field]?.toString().toLowerCase().includes(term)
    );
  });

  // Handle file upload for importing employees (Excel)
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheet = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheet];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

      try {
        const response = await fetch('/api/employees/import', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(jsonData),
        });

        // Check if response is JSON
        let responseData;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          responseData = await response.json();
        } else {
          // Handle non-JSON response
          const textData = await response.text();
          throw new Error(`Unexpected response format: ${textData}`);
        }

        if (!response.ok) {
          setError(responseData.error || 'Failed to import employees');
          return;
        }

        await fetchEmployees();
        alert('Employees imported successfully');
      } catch (error) {
        setError(`Error importing employees: ${error.message}`);
        console.error('Error importing employees:', error);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Export employees to Excel
  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(employees);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Employees');
    XLSX.writeFile(workbook, 'employees.xlsx');
  };

  // Export employees to PDF
  const exportPDF = () => {
    if (employees.length === 0) {
      alert('No employees to export.');
      return;
    }

    const doc = new jsPDF();
    const columns = employeeFields;
    const rows = employees.map((employee) =>
      columns.map((col) => employee[col])
    );

    doc.autoTable({
      head: [columns],
      body: rows,
    });
    doc.save('employees.pdf');
  };

  // Add animations to buttons using Tailwind CSS
  const buttonClass =
    'p-2 rounded text-white transition duration-300 ease-in-out transform hover:scale-105';

  if (isLoading) {
    return <div className="text-center mt-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      {/* Header and action buttons */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-4">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">Employees</h1>
        <div className="flex flex-wrap">
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            accept=".xlsx, .xls"
            onChange={handleFileUpload}
          />
          <button
            onClick={() => fileInputRef.current.click()}
            className={`${buttonClass} bg-yellow-500 mr-2 mb-2 hover:bg-yellow-600`}
          >
            Import Excel
          </button>
          <button
            onClick={exportExcel}
            className={`${buttonClass} bg-blue-500 mr-2 mb-2 hover:bg-blue-600`}
          >
            Export Excel
          </button>
          <button
            onClick={exportPDF}
            className={`${buttonClass} bg-red-500 mr-2 mb-2 hover:bg-red-600`}
          >
            Export PDF
          </button>
          {selectedEmployees.length > 0 && (
            <>
              <button
                onClick={bulkDeleteEmployees}
                className={`${buttonClass} bg-red-600 mr-2 mb-2 hover:bg-red-700`}
              >
                Delete Selected
              </button>
              <button
                onClick={cancelSelection}
                className={`${buttonClass} bg-gray-500 mr-2 mb-2 hover:bg-gray-600`}
              >
                Cancel Selection
              </button>
            </>
          )}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Search input */}
      <input
        type="text"
        placeholder="Search by any field"
        className="w-full p-2 mb-4 border rounded"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* Form for adding/editing employees */}
      <div className="mb-4 p-4 border rounded bg-gray-50">
        <h2 className="text-xl font-bold mb-2">
          {editingEmployee !== null ? 'Edit Employee' : 'Add New Employee'}
        </h2>
        {/* Input fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-screen overflow-y-auto">
          {/* Dynamically generate input fields for all properties */}
          {employeeFields.map((key) => {
            if (key === 'USERID') {
              // Make USERID read-only
              return (
                <div key={key} className="flex flex-col">
                  <label htmlFor={key} className="mb-1 font-medium">
                    {key}
                  </label>
                  <input
                    id={key}
                    type="text"
                    placeholder={key}
                    value={newEmployee[key] || ''}
                    readOnly // Make USERID read-only
                    className="p-2 border rounded w-full bg-gray-100"
                  />
                </div>
              );
            } else if (key === 'Notes') {
              return (
                <div key={key} className="flex flex-col">
                  <label htmlFor={key} className="mb-1 font-medium">
                    {key}
                  </label>
                  <textarea
                    id={key}
                    placeholder={key}
                    value={newEmployee[key] || ''}
                    onChange={(e) =>
                      setNewEmployee((prevState) => ({
                        ...prevState,
                        [key]: e.target.value,
                      }))
                    }
                    className="p-2 border rounded w-full"
                    rows="3"
                  />
                </div>
              );
            } else if (
              key === 'BIRTHDAY' ||
              key === 'HIREDDAY' ||
              key === 'Expires' ||
              key === 'ValidTimeBegin' ||
              key === 'ValidTimeEnd'
            ) {
              return (
                <div key={key} className="flex flex-col">
                  <label htmlFor={key} className="mb-1 font-medium">
                    {key}
                  </label>
                  <input
                    id={key}
                    type="date"
                    placeholder={key}
                    value={newEmployee[key] || ''}
                    onChange={(e) =>
                      setNewEmployee((prevState) => ({
                        ...prevState,
                        [key]: e.target.value,
                      }))
                    }
                    className="p-2 border rounded w-full"
                  />
                </div>
              );
            } else if (key === 'Gender') {
              return (
                <div key={key} className="flex flex-col">
                  <label htmlFor={key} className="mb-1 font-medium">
                    Gender
                  </label>
                  <select
                    id={key}
                    value={newEmployee[key] || ''}
                    onChange={(e) =>
                      setNewEmployee((prevState) => ({
                        ...prevState,
                        [key]: e.target.value,
                      }))
                    }
                    className="p-2 border rounded w-full"
                  >
                    <option value="">Select Gender *</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              );
            } else if (
              [
                'VERIFICATIONMETHOD',
                'DEFAULTDEPTID',
                'SECURITYFLAGS',
                'ATT',
                'INLATE',
                'OUTEARLY',
                'OVERTIME',
                'SEP',
                'HOLIDAY',
                'MINZU',
                'LUNCHDURATION',
                'ValidCount',
                'TimeZone1',
                'TimeZone2',
                'TimeZone3',
              ].includes(key)
            ) {
              return (
                <div key={key} className="flex flex-col">
                  <label htmlFor={key} className="mb-1 font-medium">
                    {key}
                  </label>
                  <input
                    id={key}
                    type="number"
                    placeholder={key}
                    value={newEmployee[key] || ''}
                    onChange={(e) =>
                      setNewEmployee((prevState) => ({
                        ...prevState,
                        [key]: e.target.value,
                      }))
                    }
                    className="p-2 border rounded w-full"
                  />
                </div>
              );
            } else if (key === 'PASSWORD') {
              return (
                <div key={key} className="flex flex-col">
                  <label htmlFor={key} className="mb-1 font-medium">
                    {key}
                  </label>
                  <input
                    id={key}
                    type="password"
                    placeholder={key}
                    value={newEmployee[key] || ''}
                    onChange={(e) =>
                      setNewEmployee((prevState) => ({
                        ...prevState,
                        [key]: e.target.value,
                      }))
                    }
                    className="p-2 border rounded w-full"
                  />
                </div>
              );
            } else {
              return (
                <div key={key} className="flex flex-col">
                  <label htmlFor={key} className="mb-1 font-medium">
                    {key}
                  </label>
                  <input
                    id={key}
                    type="text"
                    placeholder={key}
                    value={newEmployee[key] || ''}
                    onChange={(e) =>
                      setNewEmployee((prevState) => ({
                        ...prevState,
                        [key]: e.target.value,
                      }))
                    }
                    className="p-2 border rounded w-full"
                  />
                </div>
              );
            }
          })}
        </div>

        {/* Save and Cancel buttons */}
        <div className="mt-4 flex flex-col sm:flex-row sm:space-x-4">
          <button
            onClick={saveEmployee}
            className={`${buttonClass} bg-blue-500 flex-1 mb-2 sm:mb-0 hover:bg-blue-600`}
          >
            {editingEmployee !== null ? 'Update Employee' : 'Add Employee'}
          </button>
          {editingEmployee !== null && (
            <button
              onClick={resetForm}
              className={`${buttonClass} bg-gray-500 flex-1 hover:bg-gray-600`}
            >
              Cancel Edit
            </button>
          )}
        </div>
      </div>

      {/* Employee table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 border">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                />
              </th>
              {/* Table headers */}
              {employeeFields.map((key) => (
                <th key={key} className="p-3 border">
                  {key}
                </th>
              ))}
              <th className="p-3 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map((employee) => (
              <tr key={employee.USERID} className="hover:bg-gray-50">
                <td className="p-3 border">
                  <input
                    type="checkbox"
                    checked={selectedEmployees.includes(employee.USERID)}
                    onChange={() => handleCheckboxChange(employee.USERID)}
                  />
                </td>
                {employeeFields.map((key) => (
                  <td key={key} className="p-3 border">
                    {employee[key]}
                  </td>
                ))}
                <td className="p-3 border">
                  <button
                    onClick={() => editEmployee(employee.USERID)}
                    className="text-blue-500 hover:underline mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteEmployee(employee.USERID)}
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

export default EmployeesPage;

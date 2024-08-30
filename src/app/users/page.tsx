'use client';

import { useState } from 'react';

type User = {
  id: number;
  name: string;
  employeeId: string;
  email: string;
  role: string;
};

const initialUsers: User[] = [
  { id: 1, name: 'Ahmed Ali', employeeId: 'FG001', email: 'ahmed.ali@fgeha.gov.pk', role: 'Administrator' },
  { id: 2, name: 'Sara Khan', employeeId: 'FG002', email: 'sara.khan@fgeha.gov.pk', role: 'Manager' },
  { id: 3, name: 'Zain Malik', employeeId: 'FG003', email: 'zain.malik@fgeha.gov.pk', role: 'Engineer' },
  // Add more users as needed
];

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [newUser, setNewUser] = useState<User>({
    id: users.length + 1,
    name: '',
    employeeId: '',
    email: '',
    role: 'Employee',
  });

  const addUser = () => {
    if (newUser.name && newUser.employeeId && newUser.email && newUser.role) {
      setUsers([...users, { ...newUser, id: users.length + 1 }]);
      setNewUser({ id: users.length + 2, name: '', employeeId: '', email: '', role: 'Employee' });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">FGEHA User Management</h1>

      {/* Add New User Form */}
      <div className="mb-4 p-4 border rounded">
        <h2 className="text-xl font-bold mb-2">Add New User</h2>
        <input
          type="text"
          placeholder="Name"
          value={newUser.name}
          onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
          className="p-2 mb-2 border rounded w-full"
        />
        <input
          type="text"
          placeholder="Employee ID"
          value={newUser.employeeId}
          onChange={(e) => setNewUser({ ...newUser, employeeId: e.target.value })}
          className="p-2 mb-2 border rounded w-full"
        />
        <input
          type="email"
          placeholder="Email"
          value={newUser.email}
          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
          className="p-2 mb-2 border rounded w-full"
        />
        <select
          value={newUser.role}
          onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
          className="p-2 mb-2 border rounded w-full"
        >
          <option value="Administrator">Administrator</option>
          <option value="Manager">Manager</option>
          <option value="Engineer">Engineer</option>
          <option value="Employee">Employee</option>
        </select>
        <button
          onClick={addUser}
          className="p-2 bg-blue-500 text-white rounded w-full"
        >
          Add User
        </button>
      </div>

      {/* Users List */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="p-3 border">Name</th>
              <th className="p-3 border">Employee ID</th>
              <th className="p-3 border">Email</th>
              <th className="p-3 border">Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td className="p-3 border">{user.name}</td>
                <td className="p-3 border">{user.employeeId}</td>
                <td className="p-3 border">{user.email}</td>
                <td className="p-3 border">{user.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

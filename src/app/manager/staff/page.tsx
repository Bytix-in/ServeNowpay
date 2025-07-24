"use client";

import { useState } from "react";

interface Staff {
  id: number;
  name: string;
  phone: string;
  role: string;
  status: string;
  created: string;
}

export default function ManagerStaffPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [form, setForm] = useState({ name: "", phone: "", role: "Waiter" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddStaff = () => {
    if (!form.name || !form.phone) return;
    setStaff([
      ...staff,
      {
        ...form,
        id: staff.length + 1,
        status: "Active",
        created: new Date().toLocaleDateString(),
      },
    ]);
    setForm({ name: "", phone: "", role: "Waiter" });
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
        <span className="text-3xl">+</span> Staff Management
      </h1>
      <p className="text-gray-500 mb-8">
        Add and manage your restaurant staff (Waiters & Cooks)
      </p>
      <div className="max-w-2xl mb-8 bg-white rounded-xl shadow p-8 border">
        <h2 className="text-lg font-semibold mb-6">Add New Staff</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Full Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
            placeholder="Enter full name"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Phone Number</label>
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
            placeholder="Enter phone number"
          />
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">Role</label>
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option>Waiter</option>
            <option>Cook</option>
          </select>
        </div>
        <button
          className="w-full bg-black text-white py-2 rounded hover:bg-gray-900 transition"
          onClick={handleAddStaff}
        >
          + Add Staff
        </button>
      </div>
      <div className="max-w-4xl bg-white rounded-xl shadow p-8 border">
        <h2 className="text-lg font-semibold mb-6">Current Staff</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-2 text-left font-medium">Name</th>
                <th className="px-4 py-2 text-left font-medium">Phone</th>
                <th className="px-4 py-2 text-left font-medium">Role</th>
                <th className="px-4 py-2 text-left font-medium">Staff ID</th>
                <th className="px-4 py-2 text-left font-medium">Status</th>
                <th className="px-4 py-2 text-left font-medium">Created</th>
                <th className="px-4 py-2 text-left font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {staff.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-gray-400 py-8">
                    No staff added yet.
                  </td>
                </tr>
              ) : (
                staff.map((s, i) => (
                  <tr key={i} className="border-b">
                    <td className="px-4 py-2">{s.name}</td>
                    <td className="px-4 py-2">{s.phone}</td>
                    <td className="px-4 py-2">{s.role}</td>
                    <td className="px-4 py-2">{s.id}</td>
                    <td className="px-4 py-2">{s.status}</td>
                    <td className="px-4 py-2">{s.created}</td>
                    <td className="px-4 py-2">-</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 
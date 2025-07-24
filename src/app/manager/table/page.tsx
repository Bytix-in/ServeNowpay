"use client";

import { Table } from "lucide-react";
import { useState } from "react";

export default function TableManagementPage() {
  const [tableNumber, setTableNumber] = useState("");
  // No backend, so no tables
  const tables = [];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-1">
          <Table className="w-7 h-7 text-gray-700" />
          <h1 className="text-2xl font-bold">Table Setup</h1>
        </div>
        <p className="text-gray-500 mb-8">Configure and manage your restaurant tables</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Add New Table Form */}
          <div className="bg-white rounded-xl shadow p-8 border">
            <h2 className="text-lg font-semibold mb-6">Add New Table</h2>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">Table Number</label>
              <input
                name="tableNumber"
                value={tableNumber}
                onChange={e => setTableNumber(e.target.value)}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Enter table number"
              />
            </div>
            <button
              className="w-full bg-black text-white py-2 rounded hover:bg-gray-900 transition font-semibold text-lg flex items-center justify-center gap-2"
              type="button"
            >
              + Add Table
            </button>
          </div>
          {/* Restaurant Tables (Empty State) */}
          <div className="bg-white rounded-xl shadow p-8 border flex flex-col items-center justify-center min-h-[300px]">
            <h2 className="text-lg font-semibold mb-6 w-full text-left">Restaurant Tables (0)</h2>
            <Table className="w-16 h-16 text-gray-200 mb-4" />
            <p className="text-gray-400 text-lg mb-2">No tables added yet</p>
            <p className="text-gray-400 mb-2">Add your first table to get started</p>
          </div>
        </div>
      </div>
    </div>
  );
} 
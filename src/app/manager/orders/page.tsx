"use client";

import { useState } from "react";

const statusCards = [
  {
    label: "Pending",
    count: 0,
    color: "text-yellow-500",
    bg: "bg-yellow-50",
    icon: "⏳",
  },
  {
    label: "Preparing",
    count: 0,
    color: "text-blue-500",
    bg: "bg-blue-50",
    icon: "👨‍🍳",
  },
  {
    label: "Ready",
    count: 0,
    color: "text-green-500",
    bg: "bg-green-50",
    icon: "✅",
  },
  {
    label: "Completed",
    count: 0,
    color: "text-gray-500",
    bg: "bg-gray-100",
    icon: "📦",
  },
];

export default function OrdersManagementPage() {
  const [orders] = useState([]); // Replace with real data if needed

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
        <span className="text-3xl">📋</span> Orders Management
      </h1>
      <p className="text-gray-500 mb-8">
        Track and manage customer orders from your menu
      </p>
      <button className="mb-6 bg-black text-white px-6 py-2 rounded font-semibold hover:bg-gray-900 transition shadow">
        + Add Order
      </button>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {statusCards.map((card) => (
          <div
            key={card.label}
            className={`rounded-xl shadow p-6 flex flex-col items-center border transition hover:scale-105 hover:shadow-lg ${card.bg}`}
          >
            <span className={`text-3xl mb-2 ${card.color}`}>{card.icon}</span>
            <span className="text-gray-700 font-semibold">{card.label}</span>
            <span className="text-2xl font-bold mt-2">{card.count}</span>
          </div>
        ))}
      </div>
      <div className="max-w-4xl bg-white rounded-xl shadow p-8 border mx-auto">
        <h2 className="text-lg font-semibold mb-6">All Orders ({orders.length})</h2>
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <span className="text-6xl mb-4">🗒️</span>
            <p className="text-lg font-semibold mb-2">No orders yet</p>
            <p className="text-gray-500 mb-6">
              Orders will appear here when customers place them through your menu
            </p>
            <div className="bg-gray-50 rounded-lg p-6 w-full max-w-xl">
              <h3 className="font-semibold mb-2">Order Management Features:</h3>
              <ul className="text-gray-700 space-y-1 text-sm">
                <li>✔️ Real-time order notifications</li>
                <li>✔️ Order status tracking</li>
                <li>✔️ Customer details and preferences</li>
                <li>✔️ Payment processing simulation</li>
              </ul>
            </div>
          </div>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-2 text-left font-medium">Order ID</th>
                <th className="px-4 py-2 text-left font-medium">Customer</th>
                <th className="px-4 py-2 text-left font-medium">Status</th>
                <th className="px-4 py-2 text-left font-medium">Total</th>
                <th className="px-4 py-2 text-left font-medium">Date</th>
                <th className="px-4 py-2 text-left font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {/* Map your orders here */}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
} 
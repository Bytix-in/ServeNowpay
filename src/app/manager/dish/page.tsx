"use client";

import { Utensils } from "lucide-react";
import { useState } from "react";

export default function DishManagementPage() {
  const [form, setForm] = useState({
    name: "",
    image: "",
    type: "",
    price: "",
    ingredients: "",
    prepTime: "",
    tags: "",
  });

  // No backend, so no menu items
  const menuItems = [];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-1">
          <Utensils className="w-7 h-7 text-gray-700" />
          <h1 className="text-2xl font-bold">Dish Management</h1>
        </div>
        <p className="text-gray-500 mb-8">Add and manage your restaurant's menu items</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Add New Dish Form */}
          <div className="bg-white rounded-xl shadow p-8 border">
            <h2 className="text-lg font-semibold mb-6">Add New Dish</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Dish Name <span className="text-red-500">*</span></label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Enter dish name"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Image URL (optional)</label>
              <input
                name="image"
                value={form.image}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Dish Type <span className="text-red-500">*</span></label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="">Select dish type</option>
                <option value="Starter">Starter</option>
                <option value="Main Course">Main Course</option>
                <option value="Dessert">Dessert</option>
                <option value="Beverage">Beverage</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Price ($) <span className="text-red-500">*</span></label>
              <input
                name="price"
                value={form.price}
                onChange={handleChange}
                type="number"
                min="0"
                step="0.01"
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="0.00"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Ingredients (optional)</label>
              <input
                name="ingredients"
                value={form.ingredients}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="List ingredients"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Prep Time (minutes) <span className="text-red-500">*</span></label>
              <input
                name="prepTime"
                value={form.prepTime}
                onChange={handleChange}
                type="number"
                min="0"
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="0"
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">Tags (optional)</label>
              <input
                name="tags"
                value={form.tags}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Special Today, Most Ordered"
              />
              <p className="text-xs text-gray-400 mt-1">Separate multiple tags with commas</p>
            </div>
            <button
              className="w-full bg-black text-white py-2 rounded hover:bg-gray-900 transition font-semibold text-lg flex items-center justify-center gap-2"
              type="button"
            >
              + Add Dish
            </button>
          </div>
          {/* Menu Items (Empty State) */}
          <div className="bg-white rounded-xl shadow p-8 border flex flex-col items-center justify-center min-h-[400px]">
            <h2 className="text-lg font-semibold mb-6 w-full text-left">Menu Items (0)</h2>
            <Utensils className="w-16 h-16 text-gray-200 mb-4" />
            <p className="text-gray-400 text-lg mb-2">No dishes added yet</p>
            <p className="text-gray-400 mb-2">Add your first menu item to get started</p>
          </div>
        </div>
      </div>
    </div>
  );
} 
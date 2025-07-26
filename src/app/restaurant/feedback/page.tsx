"use client";

import { MessageSquare } from "lucide-react";

export default function FeedbackPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-1">
          <MessageSquare className="w-7 h-7 text-gray-700" />
          <h1 className="text-2xl font-bold">Feedback</h1>
        </div>
        <p className="text-gray-500 mb-8">View and manage customer feedback for your restaurant</p>
        <div className="bg-white rounded-xl shadow p-8 border">
          <h2 className="text-lg font-semibold mb-6">Customer Feedback</h2>
          <div className="flex flex-col items-center justify-center min-h-[200px]">
            <MessageSquare className="w-16 h-16 text-gray-200 mb-4" />
            <p className="text-gray-400 text-lg mb-2">No feedback yet</p>
            <p className="text-gray-400 mb-2">Customer feedback will appear here</p>
          </div>
        </div>
      </div>
    </div>
  );
} 
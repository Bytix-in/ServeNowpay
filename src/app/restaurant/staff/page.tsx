"use client";

import { useState, useEffect } from "react";
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Trash2, Edit, UserPlus, Eye, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { useRestaurant } from '@/hooks/useRestaurant'

interface Staff {
  id: string;
  name: string;
  phone: string;
  role: string;
  status: string;
  email: string | null;
  username: string | null;
  password_hash: string | null;
  is_active: boolean;
  is_online?: boolean;
  last_login_at?: string;
  session_token?: string | null;
  created_at: string;
  updated_at: string;
}

const staffSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  role: z.enum(['waiter', 'cook', 'cashier', 'manager', 'cleaner']),
  email: z.string().min(1, 'Email is required').email('Invalid email'),
})

type StaffFormData = z.infer<typeof staffSchema>

export default function RestaurantStaffPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [lastAddedCredentials, setLastAddedCredentials] = useState<{username: string, password: string} | null>(null);
  const [staffOnlineStatus, setStaffOnlineStatus] = useState<{[key: string]: boolean}>({});
  const { restaurant } = useRestaurant();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<StaffFormData>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      name: '',
      phone: '',
      role: 'waiter',
      email: ''
    }
  })

  // Edit form
  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    formState: { errors: editErrors }
  } = useForm<StaffFormData>({
    resolver: zodResolver(staffSchema)
  })

  // Fetch staff online status
  const fetchStaffOnlineStatus = async () => {
    if (!restaurant?.id) return;

    try {
      const response = await fetch(`/api/staff/session?restaurant_id=${restaurant.id}`);
      const data = await response.json();

      if (response.ok && data.data) {
        const statusMap: {[key: string]: boolean} = {};
        data.data.forEach((staff: any) => {
          statusMap[staff.id] = staff.is_online || false;
        });
        setStaffOnlineStatus(statusMap);
      }
    } catch (err) {
      console.error('Error fetching staff online status:', err);
    }
  };

  // Fetch staff data
  const fetchStaff = async () => {
    if (!restaurant?.id) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/staff?restaurant_id=${restaurant.id}`);
      const data = await response.json();

      if (response.ok) {
        setStaff(data.data || []);
        // Also fetch online status
        await fetchStaffOnlineStatus();
      } else {
        setError(data.error || 'Failed to fetch staff');
      }
    } catch (err) {
      setError('Failed to fetch staff');
      console.error('Error fetching staff:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load staff on component mount
  useEffect(() => {
    fetchStaff();
  }, [restaurant?.id]);

  // Periodically refresh online status
  useEffect(() => {
    if (!restaurant?.id) return;

    const interval = setInterval(() => {
      fetchStaffOnlineStatus();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [restaurant?.id]);

  // Add new staff member
  const handleAddStaff = async (data: StaffFormData) => {
    if (!restaurant?.id) return;

    try {
      setSubmitting(true);
      setError(null);
      // Clear previous credentials when starting new submission
      setLastAddedCredentials(null);

      const response = await fetch('/api/staff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          restaurant_id: restaurant.id,
          ...data
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setStaff(prev => [result.data, ...prev]);
        reset();
        
        // Store credentials to display in sidebar
        if (result.credentials) {
          setLastAddedCredentials(result.credentials);
        }
      } else {
        setError(result.error || 'Failed to add staff member');
      }
    } catch (err) {
      setError('Failed to add staff member');
      console.error('Error adding staff:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Delete staff member
  const handleDeleteStaff = async (staffId: string) => {
    if (!confirm('Are you sure you want to delete this staff member?')) return;

    try {
      const response = await fetch(`/api/staff?id=${staffId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (response.ok) {
        setStaff(prev => prev.filter(s => s.id !== staffId));
        alert('Staff member deleted successfully!');
      } else {
        alert(result.error || 'Failed to delete staff member');
      }
    } catch (err) {
      alert('Failed to delete staff member');
      console.error('Error deleting staff:', err);
    }
  };

  // Toggle staff status
  const handleToggleStatus = async (staffId: string, currentStatus: boolean) => {
    try {
      const response = await fetch('/api/staff', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: staffId,
          is_active: !currentStatus,
          status: !currentStatus ? 'active' : 'inactive'
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setStaff(prev => prev.map(s => 
          s.id === staffId 
            ? { ...s, is_active: !currentStatus, status: !currentStatus ? 'active' : 'inactive' }
            : s
        ));
      } else {
        alert(result.error || 'Failed to update staff status');
      }
    } catch (err) {
      alert('Failed to update staff status');
      console.error('Error updating staff status:', err);
    }
  };

  // View staff details
  const handleViewDetails = (staffMember: Staff) => {
    setSelectedStaff(staffMember);
    setShowDetailsModal(true);
  };

  // Close details modal
  const handleCloseDetails = () => {
    setSelectedStaff(null);
    setShowDetailsModal(false);
  };

  // Open edit modal
  const handleEditStaff = (staffMember: Staff) => {
    setEditingStaff(staffMember);
    resetEdit({
      name: staffMember.name,
      phone: staffMember.phone,
      role: staffMember.role as any,
      email: staffMember.email || ''
    });
    setShowEditModal(true);
  };

  // Close edit modal
  const handleCloseEdit = () => {
    setEditingStaff(null);
    setShowEditModal(false);
    resetEdit();
  };

  // Update staff member
  const handleUpdateStaff = async (data: StaffFormData) => {
    if (!editingStaff) return;

    try {
      setEditSubmitting(true);
      setError(null);

      const response = await fetch('/api/staff', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingStaff.id,
          ...data
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setStaff(prev => prev.map(s => 
          s.id === editingStaff.id ? result.data : s
        ));
        handleCloseEdit();
        alert('Staff member updated successfully!');
      } else {
        setError(result.error || 'Failed to update staff member');
      }
    } catch (err) {
      setError('Failed to update staff member');
      console.error('Error updating staff:', err);
    } finally {
      setEditSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
          <span className="ml-2 text-gray-600">Loading staff...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
        <UserPlus className="w-6 h-6" />
        Staff Management
      </h1>
      <p className="text-gray-500 mb-8">
        Add and manage your restaurant staff (Waiters & Cooks)
      </p>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Add New Staff Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Add New Staff Form */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow p-8 border">
          <h2 className="text-lg font-semibold mb-6">Add New Staff</h2>
          
          <form onSubmit={handleSubmit(handleAddStaff)} className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Enter full name"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              {...register('phone')}
              placeholder="Enter phone number"
              className={errors.phone ? 'border-red-500' : ''}
            />
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="role">Role</Label>
            <select
              id="role"
              {...register('role')}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="waiter">Waiter</option>
              <option value="cook">Cook</option>
              <option value="cashier">Cashier</option>
              <option value="manager">Manager</option>
              <option value="cleaner">Cleaner</option>
            </select>
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="Enter email address"
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>



          <Button
            type="submit"
            disabled={submitting}
            className="w-full bg-black hover:bg-gray-800 text-white"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding Staff...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Add Staff
              </>
            )}
          </Button>
        </form>
        </div>

        {/* Credentials Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow p-6 border sticky top-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Staff Login Credentials</h3>
            
            {lastAddedCredentials ? (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm font-medium text-green-800">New Staff Added Successfully!</span>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Username</label>
                      <div className="mt-1 flex items-center justify-between bg-white border rounded-md px-3 py-2">
                        <span className="font-mono text-sm text-gray-900">{lastAddedCredentials.username}</span>
                        <button
                          onClick={() => navigator.clipboard.writeText(lastAddedCredentials.username)}
                          className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Password</label>
                      <div className="mt-1 flex items-center justify-between bg-white border rounded-md px-3 py-2">
                        <span className="font-mono text-sm text-gray-900">{lastAddedCredentials.password}</span>
                        <button
                          onClick={() => navigator.clipboard.writeText(lastAddedCredentials.password)}
                          className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-3 border-t border-green-200">
                    <p className="text-xs text-green-700">
                      Share these credentials with the staff member. They can login at the staff portal.
                    </p>
                    <button
                      onClick={() => setLastAddedCredentials(null)}
                      className="mt-2 text-xs text-green-600 hover:text-green-700 font-medium"
                    >
                      Clear credentials
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserPlus className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500 mb-2">No recent credentials</p>
                <p className="text-xs text-gray-400">
                  Add a new staff member to see their login credentials here
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Current Staff Table */}
      <div className="bg-white rounded-xl shadow border">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">Current Staff ({staff.length})</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left font-medium text-gray-900">Name</th>
                <th className="px-6 py-3 text-left font-medium text-gray-900">Phone</th>
                <th className="px-6 py-3 text-left font-medium text-gray-900">Role</th>
                <th className="px-6 py-3 text-left font-medium text-gray-900">Email</th>
                <th className="px-6 py-3 text-left font-medium text-gray-900">Status</th>
                <th className="px-6 py-3 text-left font-medium text-gray-900">Online</th>
                <th className="px-6 py-3 text-left font-medium text-gray-900">Created</th>
                <th className="px-6 py-3 text-left font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {staff.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center text-gray-400 py-12">
                    <UserPlus className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No staff added yet.</p>
                    <p className="text-sm">Add your first staff member using the form above.</p>
                  </td>
                </tr>
              ) : (
                staff.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{s.name}</td>
                    <td className="px-6 py-4 text-gray-600">{s.phone}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                        {s.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{s.email || '-'}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleStatus(s.id, s.is_active)}
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          s.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {s.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div 
                          className={`w-3 h-3 rounded-full ${
                            staffOnlineStatus[s.id] ? 'bg-green-500' : 'bg-gray-400'
                          }`}
                          title={staffOnlineStatus[s.id] ? 'Online' : 'Offline'}
                        ></div>
                        <span className="text-xs text-gray-500">
                          {staffOnlineStatus[s.id] ? 'Online' : 'Offline'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(s.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => handleViewDetails(s)}
                          size="sm"
                          variant="outline"
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleEditStaff(s)}
                          size="sm"
                          variant="outline"
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleDeleteStaff(s.id)}
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Staff Details Modal */}
      {showDetailsModal && selectedStaff && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Staff Details</h2>
              <Button
                onClick={handleCloseDetails}
                variant="outline"
                size="sm"
                className="p-1"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <UserPlus className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{selectedStaff.name}</h3>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 capitalize">
                  {selectedStaff.role}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-500">Staff ID</span>
                  <span className="text-sm text-gray-900 font-mono">{selectedStaff.id.slice(0, 8)}...</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-500">Phone Number</span>
                  <span className="text-sm text-gray-900">{selectedStaff.phone}</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-500">Email</span>
                  <span className="text-sm text-gray-900">{selectedStaff.email || 'Not provided'}</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-500">Status</span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    selectedStaff.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedStaff.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-500">Date Added</span>
                  <span className="text-sm text-gray-900">
                    {new Date(selectedStaff.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-500">Username</span>
                  <span className="text-sm text-gray-900 font-mono">
                    {selectedStaff.username || 'Not set'}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-500">Login Status</span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    selectedStaff.username
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedStaff.username ? 'Can Login' : 'No Login'}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-500">Online Status</span>
                  <div className="flex items-center gap-2">
                    <div 
                      className={`w-3 h-3 rounded-full ${
                        staffOnlineStatus[selectedStaff.id] ? 'bg-green-500' : 'bg-gray-400'
                      }`}
                    ></div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      staffOnlineStatus[selectedStaff.id]
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {staffOnlineStatus[selectedStaff.id] ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-500">Last Updated</span>
                  <span className="text-sm text-gray-900">
                    {new Date(selectedStaff.updated_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t bg-gray-50 flex gap-3">
              <Button
                onClick={() => {
                  handleEditStaff(selectedStaff);
                  handleCloseDetails();
                }}
                variant="outline"
                className="flex-1 text-green-600 hover:text-green-700 hover:bg-green-50"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button
                onClick={() => handleToggleStatus(selectedStaff.id, selectedStaff.is_active)}
                variant="outline"
                className="flex-1"
              >
                {selectedStaff.is_active ? 'Deactivate' : 'Activate'}
              </Button>
              <Button
                onClick={() => {
                  handleDeleteStaff(selectedStaff.id);
                  handleCloseDetails();
                }}
                variant="outline"
                className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Staff Modal */}
      {showEditModal && editingStaff && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Edit Staff Member</h2>
              <Button
                onClick={handleCloseEdit}
                variant="outline"
                size="sm"
                className="p-1"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <form onSubmit={handleSubmitEdit(handleUpdateStaff)} className="space-y-4">
                <div>
                  <Label htmlFor="edit-name">Full Name</Label>
                  <Input
                    id="edit-name"
                    {...registerEdit('name')}
                    placeholder="Enter full name"
                    className={editErrors.name ? 'border-red-500' : ''}
                  />
                  {editErrors.name && (
                    <p className="text-red-500 text-sm mt-1">{editErrors.name.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="edit-phone">Phone Number</Label>
                  <Input
                    id="edit-phone"
                    {...registerEdit('phone')}
                    placeholder="Enter phone number"
                    className={editErrors.phone ? 'border-red-500' : ''}
                  />
                  {editErrors.phone && (
                    <p className="text-red-500 text-sm mt-1">{editErrors.phone.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="edit-role">Role</Label>
                  <select
                    id="edit-role"
                    {...registerEdit('role')}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="waiter">Waiter</option>
                    <option value="cook">Cook</option>
                    <option value="cashier">Cashier</option>
                    <option value="manager">Manager</option>
                    <option value="cleaner">Cleaner</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    {...registerEdit('email')}
                    placeholder="Enter email address"
                    className={editErrors.email ? 'border-red-500' : ''}
                  />
                  {editErrors.email && (
                    <p className="text-red-500 text-sm mt-1">{editErrors.email.message}</p>
                  )}
                </div>

                {/* Modal Footer */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    onClick={handleCloseEdit}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={editSubmitting}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    {editSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Edit className="mr-2 h-4 w-4" />
                        Update Staff
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
// File: src/pages/UserManagement.js
import React, { useState, useEffect } from 'react';
import { PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';

const ListUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [showUserDetails, setShowUserDetails] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  
  const roleOptions = ['All', 'Admin', 'Customer', 'Staff'];
  
  useEffect(() => {
    // Fetch users
    const fetchUsers = async () => {
      try {
        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock data
        const mockUsers = [
          {
            id: 1,
            name: 'John Doe',
            email: 'john.doe@example.com',
            phone: '(555) 123-4567',
            role: 'Customer',
            status: 'Active',
            joined: '2024-10-05',
            address: '123 Main St, New York, NY 10001',
            orders: 12,
            lastLogin: '2025-02-28T14:30:00',
            totalSpent: 1250.99
          },
          {
            id: 2,
            name: 'Jane Smith',
            email: 'jane.smith@example.com',
            phone: '(555) 987-6543',
            role: 'Admin',
            status: 'Active',
            joined: '2023-05-12',
            address: '456 Oak Ave, Boston, MA 02108',
            orders: 0,
            lastLogin: '2025-03-01T09:15:00',
            totalSpent: 0
          },
          {
            id: 3,
            name: 'Robert Johnson',
            email: 'robert.johnson@example.com',
            phone: '(555) 456-7890',
            role: 'Customer',
            status: 'Inactive',
            joined: '2024-01-23',
            address: '789 Pine Blvd, Chicago, IL 60601',
            orders: 5,
            lastLogin: '2025-01-15T11:45:00',
            totalSpent: 489.50
          },
          {
            id: 4,
            name: 'Sarah Wilson',
            email: 'sarah.wilson@example.com',
            phone: '(555) 789-0123',
            role: 'Staff',
            status: 'Active',
            joined: '2024-07-30',
            address: '321 Maple Dr, Seattle, WA 98101',
            orders: 0,
            lastLogin: '2025-02-27T16:20:00',
            totalSpent: 0
          },
          {
            id: 5,
            name: 'Michael Brown',
            email: 'michael.brown@example.com',
            phone: '(555) 321-6547',
            role: 'Customer',
            status: 'Active',
            joined: '2024-11-15',
            address: '654 Cedar Ln, Miami, FL 33101',
            orders: 7,
            lastLogin: '2025-02-26T10:05:00',
            totalSpent: 752.33
          },
          {
            id: 6,
            name: 'Emily Davis',
            email: 'emily.davis@example.com',
            phone: '(555) 654-9870',
            role: 'Customer',
            status: 'Active',
            joined: '2024-08-05',
            address: '987 Birch Rd, Denver, CO 80201',
            orders: 3,
            lastLogin: '2025-02-20T13:40:00',
            totalSpent: 219.75
          },
          {
            id: 7,
            name: 'David Miller',
            email: 'david.miller@example.com',
            phone: '(555) 234-5678',
            role: 'Customer',
            status: 'Inactive',
            joined: '2023-12-18',
            address: '543 Elm St, San Francisco, CA 94105',
            orders: 2,
            lastLogin: '2024-11-05T09:30:00',
            totalSpent: 149.98
          }
        ];
        
        setUsers(mockUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, []);
  
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  const updateUserStatus = (userId, newStatus) => {
    setUsers(
      users.map(user => 
        user.id === userId ? { ...user, status: newStatus } : user
      )
    );
    // In a real app, you would make an API call here
  };
  
  const updateUserRole = (userId, newRole) => {
    setUsers(
      users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      )
    );
    // In a real app, you would make an API call here
  };
  
  const deleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(user => user.id !== userId));
      // In a real app, you would make an API call here
    }
  };
  
  const saveEditedUser = () => {
    if (editingUser) {
      setUsers(
        users.map(user => 
          user.id === editingUser.id ? { ...editingUser } : user
        )
      );
      setEditingUser(null);
      // In a real app, you would make an API call here
    }
  };
  
  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'Admin':
        return 'bg-purple-100 text-purple-800';
      case 'Staff':
        return 'bg-blue-100 text-blue-800';
      case 'Customer':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone.includes(searchQuery);
    
    const matchesRole = roleFilter === '' || roleFilter === 'All' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });
  
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    
    if (aValue < bValue) {
      return sortDirection === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortDirection === 'asc' ? 1 : -1;
    }
    return 0;
  });
  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const formatDateTime = (dateTimeString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateTimeString).toLocaleString(undefined, options);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">User Management</h2>
        <div className="text-sm text-gray-500">
          Total Users: {users.length}
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full md:w-48 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Roles</option>
            {roleOptions.map(role => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Loading users...</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('id')}
                >
                  ID
                  {sortField === 'id' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('name')}
                >
                  Name
                  {sortField === 'name' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('email')}
                >
                  Email
                  {sortField === 'email' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('role')}
                >
                  Role
                  {sortField === 'role' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('status')}
                >
                  Status
                  {sortField === 'status' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('joined')}
                >
                  Joined
                  {sortField === 'joined' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedUsers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                sortedUsers.map(user => (
                  <React.Fragment key={user.id}>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap font-medium">
                        {user.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs ${getRoleBadgeClass(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(user.status)}`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {formatDate(user.joined)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => setShowUserDetails(showUserDetails === user.id ? null : user.id)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                          title="View Details"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => setEditingUser(user)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                          title="Edit User"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => deleteUser(user.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete User"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                    
                    {showUserDetails === user.id && (
                      <tr>
                        <td colSpan="7" className="px-6 py-4 bg-gray-50">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                              <h4 className="font-medium text-sm mb-2">Contact Information</h4>
                              <p className="text-sm"><span className="font-medium">Name:</span> {user.name}</p>
                              <p className="text-sm"><span className="font-medium">Email:</span> {user.email}</p>
                              <p className="text-sm"><span className="font-medium">Phone:</span> {user.phone}</p>
                              <p className="text-sm"><span className="font-medium">Address:</span> {user.address}</p>
                            </div>
                            <div>
                              <h4 className="font-medium text-sm mb-2">Account Details</h4>
                              <p className="text-sm"><span className="font-medium">Role:</span> {user.role}</p>
                              <p className="text-sm"><span className="font-medium">Status:</span> {user.status}</p>
                              <p className="text-sm"><span className="font-medium">Joined:</span> {formatDate(user.joined)}</p>
                              <p className="text-sm"><span className="font-medium">Last Login:</span> {formatDateTime(user.lastLogin)}</p>
                            </div>
                            <div>
                              <h4 className="font-medium text-sm mb-2">Shopping Information</h4>
                              <p className="text-sm"><span className="font-medium">Total Orders:</span> {user.orders}</p>
                              <p className="text-sm"><span className="font-medium">Total Spent:</span> ${user.totalSpent.toFixed(2)}</p>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-sm mb-2">Quick Actions</h4>
                            <div className="flex flex-wrap gap-2">
                              <div>
                                <span className="text-xs mr-2">Status:</span>
                                <button
                                  onClick={() => updateUserStatus(user.id, 'Active')}
                                  className={`px-3 py-1 text-xs rounded mr-1 ${
                                    user.status === 'Active'
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                  }`}
                                >
                                  Active
                                </button>
                                <button
                                  onClick={() => updateUserStatus(user.id, 'Inactive')}
                                  className={`px-3 py-1 text-xs rounded ${
                                    user.status === 'Inactive'
                                      ? 'bg-red-100 text-red-800'
                                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                  }`}
                                >
                                  Inactive
                                </button>
                              </div>
                              
                              <div className="ml-4">
                                <span className="text-xs mr-2">Role:</span>
                                {roleOptions.filter(role => role !== 'All').map(role => (
                                  <button
                                    key={role}
                                    onClick={() => updateUserRole(user.id, role)}
                                    className={`px-3 py-1 text-xs rounded mr-1 ${
                                      user.role === role
                                        ? getRoleBadgeClass(role)
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                  >
                                    {role}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-xl font-semibold mb-4">Edit User</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={editingUser.phone}
                  onChange={(e) => setEditingUser({...editingUser, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {roleOptions.filter(role => role !== 'All').map(role => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={editingUser.status}
                  onChange={(e) => setEditingUser({...editingUser, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input
                type="text"
                value={editingUser.address}
                onChange={(e) => setEditingUser({...editingUser, address: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex justify-end mt-6 gap-3">
              <button
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={saveEditedUser}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListUsers;
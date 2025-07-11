import React, { useState, useEffect, useContext } from "react";
import { PencilIcon, TrashIcon, EyeIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import { ShopContext } from "../../context/ShopContext";

const ListUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [showUserDetails, setShowUserDetails] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const token = localStorage.getItem("token");
  const {backend_url}= useContext(ShopContext);

  // Updated to match the mongoose model roles
  const roleOptions = ["All", "SuperAdmin", "Admin", "Customer"];

  // API base URL
  const API_BASE_URL = `${backend_url}/v1`;

  // Setup axios instance with default headers
  const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get("/customers");
      setUsers(response.data);
      setErrorMessage("");
    } catch (error) {
      console.error("Error fetching users:", error);
      setErrorMessage("Failed to load users. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const updateUserStatus = async (userId, newStatus) => {
    try {
      const userToUpdate = users.find((user) => user._id === userId);
      if (!userToUpdate) return;

      // Find user by email first since the update endpoint uses email
      const updatedUser = { ...userToUpdate, status: newStatus };

      // Make API call to update the user
      await api.put(`/user/${userToUpdate.email}`, { status: newStatus });

      // Update local state
      setUsers(
        users.map((user) =>
          user._id === userId ? { ...user, status: newStatus } : user
        )
      );
      setSuccessMessage(`User status updated to ${newStatus}`);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error updating user status:", error);
      setErrorMessage("Failed to update user status. Please try again.");
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      const userToUpdate = users.find((user) => user._id === userId);
      if (!userToUpdate) return;

      // Different endpoints based on the role change
      if (newRole === "Admin" && userToUpdate.role === "Customer") {
        // Promote Customer to Admin
        await api.post("/make-admin", { email: userToUpdate.email });
      } else if (newRole === "Customer" && userToUpdate.role === "Admin") {
        // Demote Admin to Customer
        await api.post("/demote-admin", { email: userToUpdate.email });
      } else {
        // Use the normal update endpoint for other role changes
        await api.put(`/user/${userToUpdate.email}`, { role: newRole });
      }

      // Update local state
      setUsers(
        users.map((user) =>
          user._id === userId ? { ...user, role: newRole } : user
        )
      );
      setSuccessMessage(`User role updated to ${newRole}`);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error updating user role:", error);
      setErrorMessage("Failed to update user role. Please try again.");
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };
  const deleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const userToDelete = users.find((user) => user._id === userId);
        if (!userToDelete) return;

        // Since there's no delete endpoint in your API, you might want to implement
        // a soft delete by updating the user status to "Inactive" or similar
        await api.put(`/user/${userToDelete.email}`, { status: "Inactive" });

        // Update local state (either remove or mark as inactive)
        setUsers(users.filter((user) => user._id !== userId));
        setSuccessMessage("User successfully deleted");
        setTimeout(() => setSuccessMessage(""), 3000);
      } catch (error) {
        console.error("Error deleting user:", error);
        setErrorMessage("Failed to delete user. Please try again.");
        setTimeout(() => setErrorMessage(""), 3000);
      }
    }
  };

  const saveEditedUser = async () => {
    if (editingUser) {
      try {
        const { _id, ...userDataToUpdate } = editingUser;

        // If password field is empty, remove it from the update data
        if (!userDataToUpdate.password) {
          delete userDataToUpdate.password;
        } else {
          // Note: The backend should handle password hashing
          // This is just sending the plain password to the backend
        }

        // Make API call to update the user
        await api.put(`/user/${editingUser.email}`, userDataToUpdate);

        // Update local state
        setUsers(
          users.map((user) =>
            user._id === editingUser._id ? { ...editingUser } : user
          )
        );
        setEditingUser(null);
        setSuccessMessage("User updated successfully");
        setTimeout(() => setSuccessMessage(""), 3000);
      } catch (error) {
        console.error("Error saving user:", error);
        setErrorMessage("Failed to save user changes. Please try again.");
        setTimeout(() => setErrorMessage(""), 3000);
      }
    }
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case "SuperAdmin":
        return "bg-red-100 text-red-800";
      case "Admin":
        return "bg-purple-100 text-purple-800";
      case "Customer":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "Inactive":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole =
      roleFilter === "" || roleFilter === "All" || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];

    if (typeof aValue === "string") {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (aValue < bValue) {
      return sortDirection === "asc" ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortDirection === "asc" ? 1 : -1;
    }
    return 0;
  });

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return "N/A";
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateTimeString).toLocaleString(undefined, options);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Notification Messages */}
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 rounded">
          {errorMessage}
        </div>
      )}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 text-green-800 rounded">
          {successMessage}
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">User Management</h2>
        <div className="text-sm text-gray-500">Total Users: {users.length}</div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by name or email..."
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
            {roleOptions.map((role) => (
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
                  onClick={() => handleSort("_id")}
                >
                  ID
                  {sortField === "_id" && (
                    <span className="ml-1">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("name")}
                >
                  Name
                  {sortField === "name" && (
                    <span className="ml-1">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("email")}
                >
                  Email
                  {sortField === "email" && (
                    <span className="ml-1">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("role")}
                >
                  Role
                  {sortField === "role" && (
                    <span className="ml-1">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("status")}
                >
                  Status
                  {sortField === "status" && (
                    <span className="ml-1">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("joined")}
                >
                  Joined
                  {sortField === "joined" && (
                    <span className="ml-1">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
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
                  <td
                    colSpan="7"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No users found
                  </td>
                </tr>
              ) : (
                sortedUsers.map((user) => (
                  <React.Fragment key={user._id}>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap font-medium">
                        {user._id.substring(0, 8)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${getRoleBadgeClass(
                            user.role
                          )}`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(
                            user.status
                          )}`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {formatDate(user.joined)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() =>
                            setShowUserDetails(
                              showUserDetails === user._id ? null : user._id
                            )
                          }
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
                          onClick={() => deleteUser(user._id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete User"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>

                    {showUserDetails === user._id && (
                      <tr>
                        <td colSpan="7" className="px-6 py-4 bg-gray-50">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <h4 className="font-medium text-sm mb-2">
                                User Information
                              </h4>
                              <p className="text-sm">
                                <span className="font-medium">ID:</span>{" "}
                                {user._id}
                              </p>
                              <p className="text-sm">
                                <span className="font-medium">Name:</span>{" "}
                                {user.name}
                              </p>
                              <p className="text-sm">
                                <span className="font-medium">Email:</span>{" "}
                                {user.email}
                              </p>
                            </div>
                            <div>
                              <h4 className="font-medium text-sm mb-2">
                                Account Details
                              </h4>
                              <p className="text-sm">
                                <span className="font-medium">Role:</span>{" "}
                                {user.role}
                              </p>
                              <p className="text-sm">
                                <span className="font-medium">Status:</span>{" "}
                                {user.status}
                              </p>
                              <p className="text-sm">
                                <span className="font-medium">Joined:</span>{" "}
                                {formatDate(user.joined)}
                              </p>
                              <p className="text-sm">
                                <span className="font-medium">Last Login:</span>{" "}
                                {formatDateTime(user.lastLogin)}
                              </p>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium text-sm mb-2">
                              Quick Actions
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              <div>
                                <span className="text-xs mr-2">Status:</span>
                                <button
                                  onClick={() =>
                                    updateUserStatus(user._id, "Active")
                                  }
                                  className={`px-3 py-1 text-xs rounded mr-1 ${
                                    user.status === "Active"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                  }`}
                                >
                                  Active
                                </button>
                                <button
                                  onClick={() =>
                                    updateUserStatus(user._id, "Inactive")
                                  }
                                  className={`px-3 py-1 text-xs rounded ${
                                    user.status === "Inactive"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                  }`}
                                >
                                  Inactive
                                </button>
                              </div>

                              <div className="ml-4">
                                <span className="text-xs mr-2">Role:</span>
                                {/* Only show valid role transitions */}
                                {user.role === "Customer" && (
                                  <button
                                    onClick={() =>
                                      updateUserRole(user._id, "Admin")
                                    }
                                    className="px-3 py-1 text-xs rounded mr-1 bg-gray-200 text-gray-700 hover:bg-gray-300"
                                  >
                                    Make Admin
                                  </button>
                                )}
                                {user.role === "Admin" && (
                                  <>
                                    <button
                                      onClick={() =>
                                        updateUserRole(user._id, "Customer")
                                      }
                                      className="px-3 py-1 text-xs rounded mr-1 bg-gray-200 text-gray-700 hover:bg-gray-300"
                                    >
                                      Demote to Customer
                                    </button>
                                    {/* <button
                                      onClick={() =>
                                        updateUserRole(user._id, "SuperAdmin")
                                      }
                                      className="px-3 py-1 text-xs rounded mr-1 bg-gray-200 text-gray-700 hover:bg-gray-300"
                                    >
                                      Make SuperAdmin
                                    </button> */}
                                  </>
                                )}
                                {/* Display current role */}
                                <span
                                  className={`px-3 py-1 text-xs rounded ml-2 ${getRoleBadgeClass(
                                    user.role
                                  )}`}
                                >
                                  Current: {user.role}
                                </span>
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
        <div className="fixed inset-0  bg-opacity-100 flex items-center justify-center z-50">
          <div className="bg-gray-100 rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-xl font-semibold mb-4">Edit User</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={editingUser.name || ""}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={editingUser.email || ""}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={editingUser.role || ""}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, role: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {roleOptions
                    .filter((role) => role !== "All")
                    .map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={editingUser.status || ""}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, status: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Leave blank to keep current password"
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, password: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
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

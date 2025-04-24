import React, { useState, useEffect } from 'react';
import { EyeIcon, TrashIcon, InboxIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

const AdminMessagesPage = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [emailFilter, setEmailFilter] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [showMessageDetails, setShowMessageDetails] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const token = localStorage.getItem("token");
  
  // API base URL
  const API_BASE_URL = 'http://localhost:3001/v1';
  
  // Setup axios instance with default headers
  const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  });
  
  const fetchAllMessages = async () => {
    try {
      setLoading(true);
      const response = await api.get("/all");
      setMessages(response.data);
      setErrorMessage('');
    } catch (error) {
      console.error('Error fetching messages:', error);
      setErrorMessage('Failed to load messages. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchMessagesByEmail = async (email) => {
    if (!email) {
      fetchAllMessages();
      return;
    }
    
    try {
      setLoading(true);
      const response = await api.get(`/msg/${email}`);
      setMessages(response.data);
      setErrorMessage('');
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setMessages([]);
      } else {
        console.error('Error fetching messages by email:', error);
        setErrorMessage('Failed to load messages. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchAllMessages();
  }, []);
  
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection(field === 'createdAt' ? 'desc' : 'asc');
    }
  };
  
  const deleteMessage = async (messageId) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        // Assuming you have an endpoint to delete messages
        // If not, you'll need to implement a different approach
        await api.delete(`/message/${messageId}`);
        
        // Update local state
        setMessages(messages.filter(msg => msg._id !== messageId));
        setSuccessMessage('Message successfully deleted');
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (error) {
        console.error('Error deleting message:', error);
        setErrorMessage('Failed to delete message. Please try again.');
        setTimeout(() => setErrorMessage(''), 3000);
      }
    }
  };
  
  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchMessagesByEmail(emailFilter);
  };
  
  const resetFilter = () => {
    setEmailFilter('');
    fetchAllMessages();
  };
  
  const filteredMessages = messages.filter(message => {
    const matchesSearch = 
      message.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      message.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.msg?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });
  
  const sortedMessages = [...filteredMessages].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    if (sortField === 'createdAt') {
      return sortDirection === 'asc' 
        ? new Date(aValue) - new Date(bValue) 
        : new Date(bValue) - new Date(aValue);
    }
    
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
  
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
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
        <h2 className="text-2xl font-semibold">Message Management</h2>
        <div className="text-sm text-gray-500">
          Total Messages: {messages.length}
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by name, email or message content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <form onSubmit={handleFilterSubmit} className="flex">
          <input
            type="email"
            placeholder="Filter by email..."
            value={emailFilter}
            onChange={(e) => setEmailFilter(e.target.value)}
            className="w-full md:w-48 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 border-l-0 rounded-r-md"
          >
            Filter
          </button>
          {emailFilter && (
            <button
              type="button"
              onClick={resetFilter}
              className="ml-2 bg-gray-200 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-300"
            >
              Clear
            </button>
          )}
        </form>
      </div>
      
      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Loading messages...</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('_id')}
                >
                  ID
                  {sortField === '_id' && (
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
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Message
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('createdAt')}
                >
                  Date
                  {sortField === 'createdAt' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedMessages.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    No messages found
                  </td>
                </tr>
              ) : (
                sortedMessages.map(message => (
                  <React.Fragment key={message._id}>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap font-medium">
                        {message._id.substring(0, 8)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {message.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {message.email}
                      </td>
                      <td className="px-6 py-4">
                        <div className="truncate max-w-xs">
                          {message.msg.length > 50 
                            ? `${message.msg.substring(0, 50)}...` 
                            : message.msg}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {formatDateTime(message.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => setShowMessageDetails(showMessageDetails === message._id ? null : message._id)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                          title="View Details"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => deleteMessage(message._id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Message"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                    
                    {showMessageDetails === message._id && (
                      <tr>
                        <td colSpan="6" className="px-6 py-4 bg-gray-50">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <h4 className="font-medium text-sm mb-2">Sender Information</h4>
                              <p className="text-sm"><span className="font-medium">Name:</span> {message.name}</p>
                              <p className="text-sm"><span className="font-medium">Email:</span> {message.email}</p>
                            </div>
                            <div>
                              <h4 className="font-medium text-sm mb-2">Message Details</h4>
                              <p className="text-sm"><span className="font-medium">Created:</span> {formatDateTime(message.createdAt)}</p>
                              <p className="text-sm"><span className="font-medium">ID:</span> {message._id}</p>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-sm mb-2">Message Content</h4>
                            <div className="bg-white p-4 rounded border text-sm whitespace-pre-wrap">
                              {message.msg}
                            </div>
                          </div>
                          
                          <div className="mt-4 flex gap-2">
                            <button
                              onClick={() => {
                                window.location.href = `mailto:${message.email}?subject=Re: Your Message&body=Dear ${message.name},%0D%0A%0D%0AThank you for your message.`;
                              }}
                              className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded hover:bg-green-200 flex items-center"
                            >
                              <InboxIcon className="h-4 w-4 mr-1" />
                              Reply via Email
                            </button>
                            <button
                              onClick={() => deleteMessage(message._id)}
                              className="px-3 py-1 bg-red-100 text-red-800 text-xs rounded hover:bg-red-200 flex items-center"
                            >
                              <TrashIcon className="h-4 w-4 mr-1" />
                              Delete Message
                            </button>
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
    </div>
  );
};

export default AdminMessagesPage;
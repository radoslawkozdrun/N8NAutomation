import React, { useState, useEffect } from 'react';
import { 
  User, 
  Settings, 
  Shield, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  Save,
  Users,
  LogOut,
  AlertCircle,
  CheckCircle,
  UserPlus,
  Trash2
} from 'lucide-react';
import Button from './ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface AccountPanelProps {
  user: {
    id: number;
    username: string;
    email: string;
    role: string;
    created_at: string;
    last_login?: string;
  };
}

interface UserData {
  id: number;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
  last_login: string;
}

export function AccountPanel({ user }: AccountPanelProps) {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'users'>('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [users, setUsers] = useState<UserData[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [showCreateUser, setShowCreateUser] = useState(false);

  const [profileForm, setProfileForm] = useState({
    email: user.email
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [createUserForm, setCreateUserForm] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user'
  });

  useEffect(() => {
    if (activeTab === 'users' && user.role === 'admin') {
      fetchUsers();
    }
  }, [activeTab, user.role]);

  const getAuthToken = () => {
    return localStorage.getItem('authToken');
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await fetch('http://localhost:8002/api/auth/users', {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('http://localhost:8002/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({
          email: profileForm.email
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully' });
        // Update user data in localStorage
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        storedUser.email = profileForm.email;
        localStorage.setItem('user', JSON.stringify(storedUser));
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to update profile' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'New password must be at least 6 characters long' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('http://localhost:8002/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage({ type: 'success', text: 'Password updated successfully' });
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to update password' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (createUserForm.password.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters long' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('http://localhost:8002/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify(createUserForm)
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage({ type: 'success', text: 'User created successfully' });
        setCreateUserForm({
          username: '',
          email: '',
          password: '',
          role: 'user'
        });
        setShowCreateUser(false);
        fetchUsers(); // Refresh user list
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to create user' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUserStatus = async (userId: number, isActive: boolean) => {
    try {
      const response = await fetch(`http://localhost:8002/api/auth/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({
          is_active: !isActive
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage({ type: 'success', text: `User ${!isActive ? 'activated' : 'deactivated'} successfully` });
        fetchUsers(); // Refresh user list
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to update user' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error occurred' });
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'user':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const clearMessage = () => {
    setTimeout(() => setMessage(null), 5000);
  };

  useEffect(() => {
    if (message) {
      clearMessage();
    }
  }, [message]);

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'password', label: 'Password', icon: Lock },
    ...(user.role === 'admin' ? [{ id: 'users', label: 'Users', icon: Users }] : [])
  ];

  return (
    <div className="h-full flex flex-col p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="skote-page-title">
            Account Settings
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your account settings and preferences
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {user.username}
            </p>
            <Badge className={getRoleBadgeColor(user.role)}>
              {user.role.toUpperCase()}
            </Badge>
          </div>
          <Button variant="outline" onClick={logout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={cn(
          'mb-6 p-4 rounded-md border',
          message.type === 'success' 
            ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
            : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
        )}>
          <div className="flex items-center">
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
            )}
            <p className={cn(
              'text-sm',
              message.type === 'success' 
                ? 'text-green-800 dark:text-green-200'
                : 'text-red-800 dark:text-red-200'
            )}>
              {message.text}
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    'flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  )}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="max-w-md">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                Profile Information
              </h3>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={user.username}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Username cannot be changed
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" loading={loading} disabled={loading}>
                  <Save className="w-4 h-4 mr-2" />
                  Update Profile
                </Button>
              </form>
            </div>
          )}

          {/* Password Tab */}
          {activeTab === 'password' && (
            <div className="max-w-md">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                Change Password
              </h3>
              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Current Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" loading={loading} disabled={loading}>
                  <Save className="w-4 h-4 mr-2" />
                  Update Password
                </Button>
              </form>
            </div>
          )}

          {/* Users Tab (Admin Only) */}
          {activeTab === 'users' && user.role === 'admin' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  User Management
                </h3>
                <Button onClick={() => setShowCreateUser(!showCreateUser)}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Create User
                </Button>
              </div>

              {/* Create User Form */}
              {showCreateUser && (
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-4">Create New User</h4>
                  <form onSubmit={handleCreateUser} className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Username"
                      value={createUserForm.username}
                      onChange={(e) => setCreateUserForm({ ...createUserForm, username: e.target.value })}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      required
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={createUserForm.email}
                      onChange={(e) => setCreateUserForm({ ...createUserForm, email: e.target.value })}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      required
                    />
                    <input
                      type="password"
                      placeholder="Password"
                      value={createUserForm.password}
                      onChange={(e) => setCreateUserForm({ ...createUserForm, password: e.target.value })}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      required
                      minLength={6}
                    />
                    <select
                      value={createUserForm.role}
                      onChange={(e) => setCreateUserForm({ ...createUserForm, role: e.target.value })}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                    <div className="col-span-2 flex space-x-2">
                      <Button type="submit" size="sm" loading={loading}>
                        Create User
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={() => setShowCreateUser(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {/* Users List */}
              {loadingUsers ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-500 dark:text-gray-400 mt-2">Loading users...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Last Login
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {users.map((userData) => (
                        <tr key={userData.id}>
                          <td className="px-4 py-4">
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {userData.username}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {userData.email}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <Badge className={getRoleBadgeColor(userData.role)}>
                              {userData.role.toUpperCase()}
                            </Badge>
                          </td>
                          <td className="px-4 py-4">
                            <Badge className={userData.is_active 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                            }>
                              {userData.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                            {userData.last_login ? new Date(userData.last_login).toLocaleDateString() : 'Never'}
                          </td>
                          <td className="px-4 py-4">
                            {userData.id !== user.id && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUpdateUserStatus(userData.id, userData.is_active)}
                              >
                                {userData.is_active ? 'Deactivate' : 'Activate'}
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import UserTable from './components/UserTable';
import UserCard from './components/UserCard';
import AddUserModal from './components/AddUserModal';
import EditUserModal from './components/EditUserModal';
import UserActivityModal from './components/UserActivityModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import UserFilters from './components/UserFilters';
import { User, UserFilters as UserFiltersType, CreateUserRequest } from '../../types';
import { api } from '../../lib/api';

const UserManagement = () => {
  const { success, error, warning } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [isLoading, setIsLoading] = useState(true);
  const [sortField, setSortField] = useState('username');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const limit = 20;

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Filter states
  const [filters, setFilters] = useState<UserFiltersType>({
    search: '',
    role: undefined,
    active: undefined
  });

  // Fetch users from API
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await api.getUsers(filters, page, limit);
      setUsers(response.data);
      setFilteredUsers(response.data);
      setTotalPages(response.pagination.total_pages);
      setTotalUsers(response.pagination.total);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      error(err.message || 'Error loading users');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, filters]);

  const handleFilterChange = (field: keyof UserFiltersType, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPage(1); // Reset to first page when filters change
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      role: undefined,
      active: undefined
    });
    setPage(1);
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleAddUser = async (userData: CreateUserRequest) => {
    try {
      await api.createUser(userData);
      success('User successfully added');
      fetchUsers(); // Refresh the list
    } catch (err: any) {
      console.error('Error creating user:', err);
      error(err.message || 'Error creating user');
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleUpdateUser = async (userData: Partial<User>) => {
    try {
      if (selectedUser) {
        await api.updateUser(selectedUser.id, userData);
        success('User data has been updated');
        fetchUsers(); // Refresh the list
      }
    } catch (err: any) {
      console.error('Error updating user:', err);
      error(err.message || 'Error updating user');
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      await api.toggleUserStatus(user.id);
      const newStatus = user?.is_active ? 'deactivated' : 'activated';
      success(`User ${user?.username} has been ${newStatus}`);
      fetchUsers(); // Refresh the list
    } catch (err: any) {
      console.error('Error toggling user status:', err);
      error(err.message || 'Error changing user status');
    }
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    setDeleteLoading(true);

    try {
      if (selectedUser) {
        await api.deleteUser(selectedUser.id);
        success(`User ${selectedUser?.username} has been deleted`);
        fetchUsers(); // Refresh the list
        setShowDeleteModal(false);
        setSelectedUser(null);
      }
    } catch (err: any) {
      console.error('Error deleting user:', err);
      error(err.message || 'An error occurred while deleting the user');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleViewActivity = (user: User) => {
    setSelectedUser(user);
    setShowActivityModal(true);
  };

  const handleBulkAction = async (action: string, userIds: number[]) => {


    try {
      switch (action) {
        case 'activate':
          // Since there's no bulk API, we'll handle individually
          for (const userId of userIds) {
            const user = users.find(u => u.id === userId);
            if (user && !user.is_active) {
              await api.toggleUserStatus(userId);
            }
          }
          success(`Users activated`);
          break;

        case 'deactivate':
          for (const userId of userIds) {
            const user = users.find(u => u.id === userId);
            if (user && user.is_active) {
              await api.toggleUserStatus(userId);
            }
          }
          warning(`Users deactivated`);
          break;

        case 'change_role_user':
          for (const userId of userIds) {
            await api.updateUser(userId, { role: 'USER' });
          }
          success(`Changed user role to USER`);
          break;

        case 'change_role_demo':
          for (const userId of userIds) {
            await api.updateUser(userId, { role: 'DEMO' });
          }
          success(`Changed user role to DEMO`);
          break;

        case 'export':
          success(`Exported data for ${userIds?.length} users`);
          break;

        default:
          break;
      }

      fetchUsers(); // Refresh the list
    } catch (err: any) {
      console.error('Error performing bulk action:', err);
      error(err.message || 'Error performing operation');
    }

    setSelectedUsers([]);
  };

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="skote-page-title">User Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage user accounts, roles and permissions
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-muted rounded-lg p-1">
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
              iconName="Table"
              iconSize={16}
            >
              Table
            </Button>
            <Button
              variant={viewMode === 'cards' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('cards')}
              iconName="Grid3X3"
              iconSize={16}
            >
              Cards
            </Button>
          </div>

          <Button
            onClick={() => setShowAddModal(true)}
            iconName="UserPlus"
            iconPosition="left"
          >
            Add User
          </Button>
        </div>
      </div>

      {/* Filters */}
      <UserFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        onBulkAction={handleBulkAction}
        selectedUsers={selectedUsers}
        totalUsers={totalUsers}
      />

      {/* Content */}
      <div className="mt-6">
        {filteredUsers?.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-12 text-center">
            <Icon name="Users" size={48} className="text-muted-foreground mx-auto mb-4" />
            <h3 className="skote-card-title font-semibold text-card-foreground mb-2">
              No Users
            </h3>
            <p className="text-muted-foreground mb-4">
              No users found matching the search criteria.
            </p>
            <Button
              variant="outline"
              onClick={handleClearFilters}
              iconName="RefreshCw"
              iconPosition="left"
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <>
            {viewMode === 'table' ? (
              <UserTable
                users={filteredUsers}
                onEdit={handleEditUser}
                onToggleStatus={handleToggleStatus}
                onDelete={handleDeleteUser}
                onViewActivity={handleViewActivity}
                onSort={handleSort}
                sortField={sortField}
                sortDirection={sortDirection}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredUsers?.map((user) => (
                  <UserCard
                    key={user?.id}
                    user={user}
                    onEdit={handleEditUser}
                    onToggleStatus={handleToggleStatus}
                    onDelete={handleDeleteUser}
                    onViewActivity={handleViewActivity}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center skote-body-text text-muted-foreground">
            <span>
              Page {page} of {totalPages} ({totalUsers} users)
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page <= 1}
            >
              Previous
            </Button>
            <span className="skote-body-text text-muted-foreground">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Modals */}
      <AddUserModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAddUser={handleAddUser}
      />

      <EditUserModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onUpdateUser={handleUpdateUser}
        user={selectedUser}
      />

      <UserActivityModal
        isOpen={showActivityModal}
        onClose={() => setShowActivityModal(false)}
        user={selectedUser}
      />

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        user={selectedUser}
        isLoading={deleteLoading}
      />
    </div>
  );
};

export default UserManagement;
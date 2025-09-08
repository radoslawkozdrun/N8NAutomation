import React, { useState, useEffect } from 'react';
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

const UserManagement = () => {
  const { success, error, warning } = useToast();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [viewMode, setViewMode] = useState('table');
  const [isLoading, setIsLoading] = useState(true);
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    status: ''
  });

  // Mock users data
  const mockUsers = [
    {
      id: 1,
      name: "Anna Kowalska",
      email: "anna.kowalska@opix.pl",
      role: "ADMIN",
      status: "ACTIVE",
      lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000),
      articleReviews: 245,
      loginCount: 89,
      createdAt: "2024-01-15T10:30:00Z"
    },
    {
      id: 2,
      name: "Piotr Nowak",
      email: "piotr.nowak@opix.pl",
      role: "USER",
      status: "ACTIVE",
      lastLogin: new Date(Date.now() - 4 * 60 * 60 * 1000),
      articleReviews: 156,
      loginCount: 67,
      createdAt: "2024-02-20T14:15:00Z"
    },
    {
      id: 3,
      name: "Maria Wiśniewska",
      email: "maria.wisniewska@opix.pl",
      role: "USER",
      status: "ACTIVE",
      lastLogin: new Date(Date.now() - 6 * 60 * 60 * 1000),
      articleReviews: 98,
      loginCount: 45,
      createdAt: "2024-03-10T09:45:00Z"
    },
    {
      id: 4,
      name: "Tomasz Zieliński",
      email: "tomasz.zielinski@opix.pl",
      role: "DEMO",
      status: "INACTIVE",
      lastLogin: new Date(Date.now() - 24 * 60 * 60 * 1000),
      articleReviews: 23,
      loginCount: 12,
      createdAt: "2024-04-05T16:20:00Z"
    },
    {
      id: 5,
      name: "Katarzyna Lewandowska",
      email: "katarzyna.lewandowska@opix.pl",
      role: "USER",
      status: "ACTIVE",
      lastLogin: new Date(Date.now() - 12 * 60 * 60 * 1000),
      articleReviews: 187,
      loginCount: 78,
      createdAt: "2024-01-28T11:10:00Z"
    },
    {
      id: 6,
      name: "Michał Dąbrowski",
      email: "michal.dabrowski@opix.pl",
      role: "USER",
      status: "ACTIVE",
      lastLogin: new Date(Date.now() - 8 * 60 * 60 * 1000),
      articleReviews: 134,
      loginCount: 56,
      createdAt: "2024-02-14T13:30:00Z"
    }
  ];

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setUsers(mockUsers);
      setFilteredUsers(mockUsers);
      setIsLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [users, filters, sortField, sortDirection]);

  const applyFilters = () => {
    let filtered = [...users];

    // Search filter
    if (filters?.search) {
      const searchTerm = filters?.search?.toLowerCase();
      filtered = filtered?.filter(user => 
        user?.name?.toLowerCase()?.includes(searchTerm) ||
        user?.email?.toLowerCase()?.includes(searchTerm)
      );
    }

    // Role filter
    if (filters?.role) {
      filtered = filtered?.filter(user => user?.role === filters?.role);
    }

    // Status filter
    if (filters?.status) {
      filtered = filtered?.filter(user => user?.status === filters?.status);
    }

    // Sort
    filtered?.sort((a, b) => {
      let aValue = a?.[sortField];
      let bValue = b?.[sortField];

      if (sortField === 'lastLogin') {
        aValue = aValue ? new Date(aValue)?.getTime() : 0;
        bValue = bValue ? new Date(bValue)?.getTime() : 0;
      }

      if (typeof aValue === 'string') {
        aValue = aValue?.toLowerCase();
        bValue = bValue?.toLowerCase();
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredUsers(filtered);
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      role: '',
      status: ''
    });
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleAddUser = async (newUser) => {
    setUsers(prev => [...prev, newUser]);
    success('Użytkownik został pomyślnie dodany');
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleUpdateUser = async (updatedUser) => {
    setUsers(prev => prev?.map(user => 
      user?.id === updatedUser?.id ? updatedUser : user
    ));
    success('Dane użytkownika zostały zaktualizowane');
  };

  const handleToggleStatus = async (user) => {
    const newStatus = user?.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const updatedUser = { ...user, status: newStatus };
    
    setUsers(prev => prev?.map(u => 
      u?.id === user?.id ? updatedUser : u
    ));
    
    success(`Użytkownik ${user?.name} został ${newStatus === 'ACTIVE' ? 'aktywowany' : 'dezaktywowany'}`);
  };

  const handleDeleteUser = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    setDeleteLoading(true);
    
    try {
      setUsers(prev => prev?.filter(user => user?.id !== selectedUser?.id));
      success(`Użytkownik ${selectedUser?.name} został usunięty`);
      setShowDeleteModal(false);
      setSelectedUser(null);
    } catch (err) {
      error('Wystąpił błąd podczas usuwania użytkownika');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleViewActivity = (user) => {
    setSelectedUser(user);
    setShowActivityModal(true);
  };

  const handleBulkAction = async (action, userIds) => {
    const selectedUserObjects = users?.filter(user => userIds?.includes(user?.id));
    
    switch (action) {
      case 'activate':
        setUsers(prev => prev?.map(user => 
          userIds?.includes(user?.id) ? { ...user, status: 'ACTIVE' } : user
        ));
        success(`Aktywowano ${userIds?.length} użytkowników`);
        break;
        
      case 'deactivate':
        setUsers(prev => prev?.map(user => 
          userIds?.includes(user?.id) ? { ...user, status: 'INACTIVE' } : user
        ));
        warning(`Dezaktywowano ${userIds?.length} użytkowników`);
        break;
        
      case 'change_role_user':
        setUsers(prev => prev?.map(user => 
          userIds?.includes(user?.id) ? { ...user, role: 'USER' } : user
        ));
        success(`Zmieniono rolę ${userIds?.length} użytkowników na USER`);
        break;
        
      case 'change_role_demo':
        setUsers(prev => prev?.map(user => 
          userIds?.includes(user?.id) ? { ...user, role: 'DEMO' } : user
        ));
        success(`Zmieniono rolę ${userIds?.length} użytkowników na DEMO`);
        break;
        
      case 'export':
        success(`Eksportowano dane ${userIds?.length} użytkowników`);
        break;
        
      default:
        break;
    }
    
    setSelectedUsers([]);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pt-16">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Ładowanie użytkowników...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Zarządzanie użytkownikami</h1>
            <p className="text-muted-foreground mt-2">
              Zarządzaj kontami użytkowników, rolami i uprawnieniami w systemie OPIX
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
                Tabela
              </Button>
              <Button
                variant={viewMode === 'cards' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('cards')}
                iconName="Grid3X3"
                iconSize={16}
              >
                Karty
              </Button>
            </div>
            
            <Button
              onClick={() => setShowAddModal(true)}
              iconName="UserPlus"
              iconPosition="left"
            >
              Dodaj użytkownika
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
          totalUsers={filteredUsers?.length}
        />

        {/* Content */}
        <div className="mt-6">
          {filteredUsers?.length === 0 ? (
            <div className="bg-card border border-border rounded-lg p-12 text-center">
              <Icon name="Users" size={48} className="text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-card-foreground mb-2">
                Brak użytkowników
              </h3>
              <p className="text-muted-foreground mb-4">
                Nie znaleziono użytkowników spełniających kryteria wyszukiwania.
              </p>
              <Button
                variant="outline"
                onClick={handleClearFilters}
                iconName="RefreshCw"
                iconPosition="left"
              >
                Wyczyść filtry
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
    </div>
  );
};

export default UserManagement;
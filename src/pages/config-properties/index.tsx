import React, { useState, useEffect } from 'react';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import ConfigPropertyTable from './components/ConfigPropertyTable';
import AddConfigPropertyModal from './components/AddConfigPropertyModal';
import EditConfigPropertyModal from './components/EditConfigPropertyModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import ConfigPropertyFilters from './components/ConfigPropertyFilters';
import { ConfigProperty, ConfigPropertyFilters as ConfigPropertyFiltersType, CreateConfigPropertyRequest, UpdateConfigPropertyRequest } from '../../types';
import { api } from '../../lib/api';

const ConfigPropertiesManagement = () => {
  const { success, error, warning } = useToast();
  const [configProperties, setConfigProperties] = useState<ConfigProperty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortField, setSortField] = useState('key');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProperties, setTotalProperties] = useState(0);
  const limit = 20;

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<ConfigProperty | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Filter states
  const [filters, setFilters] = useState<ConfigPropertyFiltersType>({
    search: '',
    data_type: undefined,
    is_active: undefined,
    is_encrypted: undefined
  });

  // Fetch config properties from API
  const fetchConfigProperties = async () => {
    setIsLoading(true);
    try {
      const response = await api.getConfigProperties(filters, page, limit);
      setConfigProperties(response.data);
      setTotalPages(response.pagination.total_pages);
      setTotalProperties(response.pagination.total);
    } catch (err: any) {
      console.error('Error fetching config properties:', err);
      error(err.message || 'Error loading configuration properties');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigProperties();
  }, [page, filters]);

  const handleFilterChange = (field: string, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPage(1); // Reset to first page when filters change
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      data_type: undefined,
      is_active: undefined,
      is_encrypted: undefined
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

  const handleAddProperty = async (propertyData: CreateConfigPropertyRequest) => {
    try {
      await api.createConfigProperty(propertyData);
      success('Configuration property successfully added');
      fetchConfigProperties(); // Refresh the list
    } catch (err: any) {
      console.error('Error creating config property:', err);
      error(err.message || 'Error creating configuration property');
    }
  };

  const handleEditProperty = (property: ConfigProperty) => {
    setSelectedProperty(property);
    setShowEditModal(true);
  };

  const handleUpdateProperty = async (propertyData: UpdateConfigPropertyRequest) => {
    try {
      if (selectedProperty) {
        await api.updateConfigProperty(selectedProperty.id, propertyData);
        success('Configuration property updated successfully');
        setShowEditModal(false); // Close modal on success
        setSelectedProperty(null); // Clear selected property
        fetchConfigProperties(); // Refresh the list
      }
    } catch (err: any) {
      console.error('Error updating config property:', err);
      error(err.message || 'Error updating configuration property');
      throw err; // Re-throw to let modal handle errors
    }
  };

  const handleToggleStatus = async (property: ConfigProperty) => {
    try {
      await api.toggleConfigPropertyStatus(property.id);
      const newStatus = property?.is_active ? 'deactivated' : 'activated';
      success(`Property ${property?.key} has been ${newStatus}`);
      fetchConfigProperties(); // Refresh the list
    } catch (err: any) {
      console.error('Error toggling config property status:', err);
      error(err.message || 'Error changing property status');
    }
  };

  const handleDeleteProperty = (property: ConfigProperty) => {
    setSelectedProperty(property);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    setDeleteLoading(true);

    try {
      if (selectedProperty) {
        await api.deleteConfigProperty(selectedProperty.id);
        success(`Property ${selectedProperty?.key} has been deleted`);
        fetchConfigProperties(); // Refresh the list
        setShowDeleteModal(false);
        setSelectedProperty(null);
      }
    } catch (err: any) {
      console.error('Error deleting config property:', err);
      error(err.message || 'An error occurred while deleting the property');
    } finally {
      setDeleteLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pt-16">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading configuration properties...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="skote-page-title">Configuration Management</h1>
            <p className="text-muted-foreground mt-2">
              Manage application configuration properties
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              onClick={() => setShowAddModal(true)}
              iconName="Plus"
              iconPosition="left"
            >
              Add Property
            </Button>
          </div>
        </div>

        {/* Filters */}
        <ConfigPropertyFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          totalProperties={totalProperties}
        />

        {/* Content */}
        <div className="mt-6">
          {configProperties?.length === 0 ? (
            <div className="bg-card border border-border rounded-lg p-12 text-center">
              <Icon name="Settings" size={48} className="text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-card-foreground mb-2">
                No Configuration Properties
              </h3>
              <p className="text-muted-foreground mb-4">
                No configuration properties found matching the search criteria.
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
            <ConfigPropertyTable
              properties={configProperties}
              onEdit={handleEditProperty}
              onToggleStatus={handleToggleStatus}
              onDelete={handleDeleteProperty}
              onSort={handleSort}
              sortField={sortField}
              sortDirection={sortDirection}
            />
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center text-sm text-muted-foreground">
              <span>
                Page {page} of {totalPages} ({totalProperties} properties)
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
              <span className="text-sm text-muted-foreground">
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
        <AddConfigPropertyModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onAddProperty={handleAddProperty}
        />

        <EditConfigPropertyModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleUpdateProperty}
          configProperty={selectedProperty}
        />

        <DeleteConfirmModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleConfirmDelete}
          property={selectedProperty}
          isLoading={deleteLoading}
        />
    </div>
  );
};

export default ConfigPropertiesManagement;
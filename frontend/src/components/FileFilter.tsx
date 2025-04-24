import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface FileFilterProps {
  onFilterChange: (filters: {
    search?: string;
    fileType?: string;
    minSize?: number;
    maxSize?: number;
    startDate?: string;
    endDate?: string;
    isReference?: boolean;
    minReferenceCount?: number;
    maxReferenceCount?: number;
  }) => void;
}

export const FileFilter: React.FC<FileFilterProps> = ({ onFilterChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [hasActiveFilters, setHasActiveFilters] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    fileType: '',
    minSize: '',
    maxSize: '',
    startDate: '',
    endDate: '',
    isReference: '',
    minReferenceCount: '',
    maxReferenceCount: '',
  });

  // Effect to update hasActiveFilters when activeFilters changes
  useEffect(() => {
    setHasActiveFilters(activeFilters.length > 0);
  }, [activeFilters]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFilters(prev => ({
      ...prev,
      search: value
    }));
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleApplyFilters();
    }
  };

  const handleApplyFilters = async () => {
    const processedFilters: any = {};
    const newActiveFilters: string[] = [];

    // Process each filter type
    if (filters.fileType) {
      processedFilters.fileType = filters.fileType;
      newActiveFilters.push('fileType');
    }

    if (filters.startDate) {
      processedFilters.startDate = filters.startDate;
      newActiveFilters.push('startDate');
    }

    if (filters.endDate) {
      processedFilters.endDate = filters.endDate;
      newActiveFilters.push('endDate');
    }

    if (filters.minSize) {
      processedFilters.minSize = Number(filters.minSize);
      newActiveFilters.push('minSize');
    }

    if (filters.maxSize) {
      processedFilters.maxSize = Number(filters.maxSize);
      newActiveFilters.push('maxSize');
    }

    if (filters.minReferenceCount) {
      processedFilters.minReferenceCount = Number(filters.minReferenceCount);
      newActiveFilters.push('minReferenceCount');
    }

    if (filters.maxReferenceCount) {
      processedFilters.maxReferenceCount = Number(filters.maxReferenceCount);
      newActiveFilters.push('maxReferenceCount');
    }

    if (filters.search) {
      processedFilters.search = filters.search;
      newActiveFilters.push('search');
    }

    if (filters.isReference) {
      processedFilters.isReference = filters.isReference === 'true';
      newActiveFilters.push('isReference');
    }

    if (newActiveFilters.length > 0) {
      // Update active filters first
      await new Promise<void>(resolve => {
        setActiveFilters(newActiveFilters);
        resolve();
      });

      // Then update hasActiveFilters
      setHasActiveFilters(true);

      // Then trigger filter change
      onFilterChange(processedFilters);

      // Finally close the panel
      setIsExpanded(false);
    }
  };

  const handleClearFilters = () => {
    const emptyFilters = {
      search: '',
      fileType: '',
      minSize: '',
      maxSize: '',
      startDate: '',
      endDate: '',
      isReference: '',
      minReferenceCount: '',
      maxReferenceCount: '',
    };
    
    setFilters(emptyFilters);
    setActiveFilters([]);
    setHasActiveFilters(false);
    onFilterChange({});
  };

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6 relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <FunnelIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            <h3 className="ml-2 text-lg font-medium leading-6 text-gray-900">Filters</h3>
          </div>
          <div className="flex items-center gap-3">
            {hasActiveFilters && !isExpanded && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              >
                <XMarkIcon className="h-4 w-4 mr-1" />
                Clear Filters
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              {isExpanded ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>
        </div>

        <div className="mt-4">
          <div className="relative rounded-md shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleSearch}
              onKeyUp={handleKeyUp}
              className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
              placeholder="Search files..."
            />
          </div>
        </div>

        {isExpanded && (
          <>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label htmlFor="fileType" className="block text-sm font-medium text-gray-700">
                  File Type
                </label>
                <select
                  id="fileType"
                  name="fileType"
                  value={filters.fileType}
                  onChange={handleInputChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                >
                  <option value="">All Types</option>
                  <option value="image/png">PNG Image</option>
                  <option value="image/jpeg">JPEG Image</option>
                  <option value="text/plain">Text File</option>
                  <option value="application/pdf">PDF Document</option>
                  <option value="application/msword">Word Document</option>
                  <option value="application/vnd.openxmlformats-officedocument.wordprocessingml.document">DOCX Document</option>
                </select>
              </div>

              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                  Start Date
                </label>
                <input
                  type="date"
                  name="startDate"
                  id="startDate"
                  value={filters.startDate}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                  End Date
                </label>
                <input
                  type="date"
                  name="endDate"
                  id="endDate"
                  value={filters.endDate}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="minSize" className="block text-sm font-medium text-gray-700">
                  Min Size (KB)
                </label>
                <input
                  type="number"
                  name="minSize"
                  id="minSize"
                  value={filters.minSize}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="maxSize" className="block text-sm font-medium text-gray-700">
                  Max Size (KB)
                </label>
                <input
                  type="number"
                  name="maxSize"
                  id="maxSize"
                  value={filters.maxSize}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="isReference" className="block text-sm font-medium text-gray-700">
                  Reference Status
                </label>
                <select
                  id="isReference"
                  name="isReference"
                  value={filters.isReference}
                  onChange={handleInputChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                >
                  <option value="">All Files</option>
                  <option value="true">References Only</option>
                  <option value="false">Original Files Only</option>
                </select>
              </div>

              <div>
                <label htmlFor="minReferenceCount" className="block text-sm font-medium text-gray-700">
                  Min References
                </label>
                <input
                  type="number"
                  name="minReferenceCount"
                  id="minReferenceCount"
                  value={filters.minReferenceCount}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="maxReferenceCount" className="block text-sm font-medium text-gray-700">
                  Max References
                </label>
                <input
                  type="number"
                  name="maxReferenceCount"
                  id="maxReferenceCount"
                  value={filters.maxReferenceCount}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleClearFilters}
                className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              >
                Clear Filters
              </button>
              <button
                type="button"
                onClick={handleApplyFilters}
                className="inline-flex items-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
              >
                Apply Filters
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}; 
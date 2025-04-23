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
  const [showClearButton, setShowClearButton] = useState(false);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    console.log('Input Changed:', name, value);
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleApplyFilters = () => {
    const processedFilters: any = {};

    // Process each filter only if it has a value
    if (filters.search?.trim()) {
      processedFilters.search = filters.search.trim();
    }
    if (filters.fileType?.trim()) {
      processedFilters.fileType = filters.fileType;
    }
    if (filters.startDate?.trim()) {
      processedFilters.startDate = filters.startDate;
    }
    if (filters.endDate?.trim()) {
      processedFilters.endDate = filters.endDate;
    }
    if (filters.minSize?.toString().trim()) {
      processedFilters.minSize = Number(filters.minSize);
    }
    if (filters.maxSize?.toString().trim()) {
      processedFilters.maxSize = Number(filters.maxSize);
    }
    if (filters.isReference?.trim()) {
      processedFilters.isReference = filters.isReference === 'true';
    }
    if (filters.minReferenceCount?.toString().trim()) {
      processedFilters.minReferenceCount = Number(filters.minReferenceCount);
    }
    if (filters.maxReferenceCount?.toString().trim()) {
      processedFilters.maxReferenceCount = Number(filters.maxReferenceCount);
    }

    // Check if any filters are applied
    const hasFilters = Object.keys(processedFilters).length > 0;
    console.log('Applied Filters:', processedFilters);
    console.log('Has Filters:', hasFilters);
    
    // Update state
    setShowClearButton(hasFilters);
    onFilterChange(processedFilters);
    setIsExpanded(false);
  };

  const handleClearFilters = () => {
    console.log('Clearing Filters');
    // Reset all filters
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
    setShowClearButton(false);
    onFilterChange({});
  };

  // Add useEffect to log state changes
  useEffect(() => {
    console.log('Show Clear Button:', showClearButton);
    console.log('Current Filters:', filters);
  }, [showClearButton, filters]);

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6 relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <FunnelIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            <h3 className="ml-2 text-lg font-medium leading-6 text-gray-900">Filters</h3>
          </div>
          <div className="flex items-center gap-3">
            {showClearButton && !isExpanded && (
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
              onClick={() => {
                setIsExpanded(!isExpanded);
                // Don't hide the clear button when opening/closing panel
                // if there are active filters
                if (isExpanded) {
                  const hasActiveFilters = Object.values(filters).some(value => 
                    value !== '' && value !== undefined && value !== null
                  );
                  setShowClearButton(hasActiveFilters);
                }
              }}
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
              onChange={handleInputChange}
              onKeyUp={(e) => {
                if (e.key === 'Enter') {
                  handleApplyFilters();
                }
              }}
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
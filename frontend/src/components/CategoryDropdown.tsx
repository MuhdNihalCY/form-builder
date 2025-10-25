import React, { useState, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchCategories, createCategory, initializeDefaultCategories } from '../store/slices/categorySlice';
import { Category } from '../types';
import { ChevronDownIcon, PlusIcon } from '@heroicons/react/24/outline';
import { RootState } from '../store';

interface CategoryDropdownProps {
  value: string;
  onChange: (categoryName: string) => void;
  placeholder?: string;
  className?: string;
}

const CategoryDropdown: React.FC<CategoryDropdownProps> = ({
  value,
  onChange,
  placeholder = "Select category",
  className = ""
}) => {
  const dispatch = useAppDispatch();
  const { categories, loading } = useAppSelector((state: RootState) => state.categories);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#3B82F6');
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    console.log('CategoryDropdown: categories.length =', categories.length);
    console.log('CategoryDropdown: categories =', categories);
    
    if (categories.length === 0) {
      console.log('CategoryDropdown: Fetching categories...');
      dispatch(fetchCategories()).then((result) => {
        console.log('CategoryDropdown: Fetch result =', result);
        // Check if the fetch was successful but returned empty array
        if (result.type === 'categories/fetchCategories/fulfilled' && 
            (result.payload as { categories: Category[] }).categories.length === 0) {
          console.log('CategoryDropdown: No categories found, initializing defaults...');
          // Initialize default categories if none exist
          dispatch(initializeDefaultCategories());
        } else if (result.type === 'categories/fetchCategories/rejected') {
          console.log('CategoryDropdown: Fetch failed, initializing defaults...');
          // If fetch fails, try to initialize default categories
          dispatch(initializeDefaultCategories());
        }
      });
    }
  }, [dispatch, categories.length]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowCreateForm(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const filteredCategories = categories.filter((category: Category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCategorySelect = (category: Category) => {
    onChange(category.name);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    try {
      await dispatch(createCategory({
        name: newCategoryName.trim(),
        color: newCategoryColor
      })).unwrap();
      
      onChange(newCategoryName.trim());
      setNewCategoryName('');
      setNewCategoryColor('#3B82F6');
      setShowCreateForm(false);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to create category:', error);
    }
  };

  const selectedCategory = categories.find((cat: Category) => cat.name === value);

  const predefinedColors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
  ];

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md bg-white text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <div className="flex items-center space-x-2">
          {selectedCategory && (
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: selectedCategory.color }}
            />
          )}
          <span className={selectedCategory ? 'text-gray-900' : 'text-gray-500'}>
            {selectedCategory ? selectedCategory.name : placeholder}
          </span>
        </div>
        <ChevronDownIcon className="h-4 w-4 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          {/* Search input */}
          <div className="p-2 border-b border-gray-200">
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search categories..."
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Categories list */}
          <div className="max-h-48 overflow-y-auto">
            {loading ? (
              <div className="p-3 text-center text-gray-500">Loading...</div>
            ) : filteredCategories.length > 0 ? (
              filteredCategories.map((category: Category) => (
                <button
                  key={category._id}
                  type="button"
                  onClick={() => handleCategorySelect(category)}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="text-sm text-gray-900">{category.name}</span>
                  {category.taskCount > 0 && (
                    <span className="text-xs text-gray-500 ml-auto">
                      {category.taskCount}
                    </span>
                  )}
                </button>
              ))
            ) : (
              <div className="p-3 text-center text-gray-500 text-sm">
                No categories found
              </div>
            )}
          </div>

          {/* Create new category */}
          {!showCreateForm ? (
            <div className="border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowCreateForm(true)}
                className="w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
              >
                <PlusIcon className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">Create new category</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleCreateCategory} className="border-t border-gray-200 p-3">
              <div className="space-y-2">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Category name"
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  autoFocus
                />
                
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">Color:</span>
                  <div className="flex space-x-1">
                    {predefinedColors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setNewCategoryColor(color)}
                        className={`w-6 h-6 rounded-full border-2 ${
                          newCategoryColor === color ? 'border-gray-800' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    type="submit"
                    className="flex-1 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      setNewCategoryName('');
                      setNewCategoryColor('#3B82F6');
                    }}
                    className="px-2 py-1 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default CategoryDropdown;

import React, { useState, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchCategories, initializeDefaultCategories } from '../store/slices/categorySlice';
import { Category } from '../types';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
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
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (categories.length === 0) {
      dispatch(fetchCategories()).then((result) => {
        if (result.type === 'categories/fetchCategories/fulfilled') {
          const cats = (result.payload as any).categories || [];
          if (cats.length === 0) {
            dispatch(initializeDefaultCategories());
          }
        }
      });
    }
  }, [dispatch, categories.length]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
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

  const selectedCategory = categories.find((cat: Category) => cat.name === value);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 text-left border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between"
      >
        <div className="flex items-center space-x-2">
          {selectedCategory && (
            <div
              className="w-4 h-4 rounded-full flex-shrink-0"
              style={{ backgroundColor: selectedCategory.color }}
            />
          )}
          <span className={selectedCategory ? 'text-gray-900' : 'text-gray-400'}>
            {selectedCategory?.name || placeholder}
          </span>
        </div>
        <ChevronDownIcon className="h-5 w-5 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          <div className="p-2">
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search categories..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="max-h-48 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
              </div>
            ) : filteredCategories.length > 0 ? (
              filteredCategories.map((category: Category) => (
                <button
                  key={category._id}
                  type="button"
                  onClick={() => handleCategorySelect(category)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center space-x-2"
                >
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="text-gray-900">{category.name}</span>
                </button>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">
                No categories found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryDropdown;
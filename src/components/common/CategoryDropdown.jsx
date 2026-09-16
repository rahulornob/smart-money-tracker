import React, { useState, useRef, useEffect } from 'react';
import { IconLayoutGrid, IconSelector, IconCheck, IconSearch, IconX } from '@tabler/icons-react';
import CategoryIcon from './CategoryIcon';
import { useModalAnimation } from '../../hooks/useModalAnimation';

export default function CategoryDropdown({
  categories = [],
  selectedId = '',
  onChange,
  label = 'Category',
  required = true,
  placeholder = 'Choose',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const { shouldRender: shouldRenderMenu, isClosing: isMenuClosing } = useModalAnimation(isOpen, 200);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  const selectedCategory = categories.find((c) => c.id === selectedId);

  // Close dropdown on outside click or escape key
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  const handleSelect = (category) => {
    onChange(category.id);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div className="form-group category-dropdown-container" ref={dropdownRef}>
      {label && (
        <label className="category-field-label">
          {label} {required && <span className="text-rose">*</span>}
        </label>
      )}

      {/* Trigger Button - Matches user reference screenshot exactly */}
      <button
        type="button"
        className={`category-dropdown-trigger ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="trigger-left-content">
          {selectedCategory ? (
            <div
              className="selected-cat-icon-wrap"
              style={{ backgroundColor: `${selectedCategory.color}22` }}
            >
              <CategoryIcon
                iconName={selectedCategory.icon}
                size={16}
                color={selectedCategory.color}
              />
            </div>
          ) : (
            <IconLayoutGrid size={18} className="trigger-placeholder-icon" stroke={1.6} />
          )}

          <span className={`trigger-text ${selectedCategory ? 'has-value' : 'placeholder'}`}>
            {selectedCategory ? selectedCategory.name : placeholder}
          </span>
        </div>

        <IconSelector size={16} className="trigger-selector-icon" stroke={1.6} />
      </button>

      {/* Floating Dropdown Menu */}
      {shouldRenderMenu && (
        <div className={`category-dropdown-menu ${isMenuClosing ? 'is-closing' : ''}`} role="listbox">
          {/* Quick Search */}
          <div className="cat-dropdown-search-box">
            <IconSearch size={14} className="cat-search-icon" stroke={1.8} />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="cat-dropdown-search-input"
            />
            {searchQuery && (
              <button
                type="button"
                className="btn-clear-search"
                onClick={() => setSearchQuery('')}
              >
                <IconX size={13} stroke={2} />
              </button>
            )}
          </div>

          {/* Categories List */}
          <div className="cat-dropdown-items-list">
            {filteredCategories.length === 0 ? (
              <div className="cat-dropdown-no-results">
                No matching category found
              </div>
            ) : (
              filteredCategories.map((cat) => {
                const isSelected = selectedId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(cat)}
                    className={`cat-dropdown-item ${isSelected ? 'selected' : ''}`}
                  >
                    <div
                      className="cat-dropdown-icon-pill"
                      style={{ backgroundColor: `${cat.color}20` }}
                    >
                      <CategoryIcon iconName={cat.icon} size={15} color={cat.color} />
                    </div>
                    <span className="cat-dropdown-name">{cat.name}</span>
                    {isSelected && (
                      <IconCheck
                        size={15}
                        className="cat-dropdown-check text-phantom-purple"
                        stroke={2.5}
                      />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}


import React from 'react';

interface DropdownProps {
  label: string;
  options: readonly string[];
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  id: string;
}

const Dropdown: React.FC<DropdownProps> = ({ label, options, value, onChange, id }) => {
  return (
    <div className="w-full">
      <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-1">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={onChange}
        className="block w-full pl-3 pr-10 py-2 text-base bg-white text-black border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm"
      >
        <option value="">Select {label.toLowerCase()}...</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Dropdown;

import React from 'react';

export default function Select({
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder = 'Select an option',
}) {
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-bold mb-1 text-gray-700"
        >
          {label}
        </label>
      )}
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

import React, { useState, useCallback, memo } from 'react';

const datePresets = [
  { label: 'Today', value: 'today' },
  { label: 'Week', value: 'week' },
  { label: 'Month', value: 'month' },
  { label: 'Year', value: 'year' },
  { label: 'Custom', value: 'custom' },
];

const modules = [
  'All',
  'Course',
  'Lesson',
  'Enrollment',
  'Attendance',
  'Certificate',
  'Donation',
  'Expense',
  'Campaign',
  'Profile',
  'Authentication',
];

const actions = [
  'All',
  'Create',
  'Update',
  'Delete',
  'Approve',
  'Issue',
  'Enroll',
  'Complete',
  'Login',
  'Logout',
];

const successOptions = ['All', 'Success', 'Failed'];

function PresetButton({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
        active
          ? 'bg-blue-600 text-white shadow-sm'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
      }`}
    >
      {label}
    </button>
  );
}

function FilterDropdown({ label, value, options, onChange }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

function AuditFilters({ filters: externalFilters = {}, onChange, onFilterChange }) {
  const [datePreset, setDatePreset] = useState(externalFilters.datePreset || 'today');
  const [module, setModule] = useState('All');
  const [action, setAction] = useState('All');
  const [success, setSuccess] = useState('All');
  const [search, setSearch] = useState('');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const emitChange = useCallback(
    (updates) => {
      const payload = { datePreset, module, action, success, search, customStart, customEnd, ...updates };
      if (onFilterChange) onFilterChange(payload);
      if (onChange) onChange(payload);
    },
    [datePreset, module, action, success, search, customStart, customEnd, onFilterChange, onChange]
  );

  const handleDatePreset = useCallback(
    (preset) => {
      setDatePreset(preset);
      emitChange({ datePreset: preset });
    },
    [emitChange]
  );

  const handleModule = useCallback(
    (val) => {
      setModule(val);
      emitChange({ module: val });
    },
    [emitChange]
  );

  const handleAction = useCallback(
    (val) => {
      setAction(val);
      emitChange({ action: val });
    },
    [emitChange]
  );

  const handleSuccess = useCallback(
    (val) => {
      setSuccess(val);
      emitChange({ success: val });
    },
    [emitChange]
  );

  const handleSearch = useCallback(
    (e) => {
      const val = e.target.value;
      setSearch(val);
      emitChange({ search: val });
    },
    [emitChange]
  );

  const handleCustomStart = useCallback(
    (e) => {
      const val = e.target.value;
      setCustomStart(val);
      emitChange({ customStart: val });
    },
    [emitChange]
  );

  const handleCustomEnd = useCallback(
    (e) => {
      const val = e.target.value;
      setCustomEnd(val);
      emitChange({ customEnd: val });
    },
    [emitChange]
  );

  const handleClear = useCallback(() => {
    setDatePreset('today');
    setModule('All');
    setAction('All');
    setSuccess('All');
    setSearch('');
    setCustomStart('');
    setCustomEnd('');
    const payload = {
      datePreset: 'today',
      module: 'All',
      action: 'All',
      success: 'All',
      search: '',
      customStart: '',
      customEnd: '',
    };
    if (onFilterChange) onFilterChange(payload);
    if (onChange) onChange(payload);
  }, [onFilterChange, onChange]);

  return (
    <div className="w-full space-y-4 p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mr-1">
          Date:
        </span>
        {datePresets.map((p) => (
          <PresetButton
            key={p.value}
            label={p.label}
            active={datePreset === p.value}
            onClick={() => handleDatePreset(p.value)}
          />
        ))}
      </div>

      {datePreset === 'custom' && (
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">From</label>
            <input
              type="date"
              value={customStart}
              onChange={handleCustomStart}
              className="px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">To</label>
            <input
              type="date"
              value={customEnd}
              onChange={handleCustomEnd}
              className="px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <FilterDropdown label="Module" value={module} options={modules} onChange={handleModule} />
        <FilterDropdown label="Action" value={action} options={actions} onChange={handleAction} />
        <FilterDropdown label="Status" value={success} options={successOptions} onChange={handleSuccess} />
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Search
          </label>
          <input
            type="text"
            value={search}
            onChange={handleSearch}
            placeholder="User or description..."
            className="px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleClear}
          className="px-4 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 border border-red-300 dark:border-red-700 rounded-md hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
}

export default memo(AuditFilters);

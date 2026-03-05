import { Select } from 'antd';
import React from 'react';

function CountrySelector({ value, onChange }: { value?: string; onChange?: (value?: string) => void }) {
  return (
    <Select value={value} onChange={onChange} style={{ width: '100%', maxWidth: 300 }} placeholder="Filter by country">
      {[
        { value: 'GH', label: 'Ghana' },
        { value: 'NG', label: 'Nigeria' },
        { value: 'KE', label: 'Kenya' },
      ].map((option) => (
        <Select.Option key={option.value} value={option.value}>
          {option.label}
        </Select.Option>
      ))}
    </Select>
  );
}

export default CountrySelector;

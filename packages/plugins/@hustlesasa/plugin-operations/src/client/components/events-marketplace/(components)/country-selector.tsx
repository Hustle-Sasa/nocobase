import React from 'react';
import { useRequest } from '@nocobase/client';
import { Select } from 'antd';

function CountrySelector({
  value,
  env,
  onChange,
}: {
  value?: string;
  env?: string;
  onChange?: (value?: string) => void;
}) {
  const { data: { data: countries } = { countries: [] }, loading } = useRequest<{
    data: { alphaCode: string; name: string }[];
  }>(
    {
      url: 'operations:countryList',
      params: { env },
    },
    { refreshDeps: [env] },
  );

  return (
    <Select
      allowClear
      value={value}
      onChange={onChange}
      style={{ width: '100%', maxWidth: 300 }}
      placeholder="Filter by country"
      loading={loading}
    >
      {countries?.map((option) => (
        <Select.Option key={option.alphaCode} value={option.alphaCode}>
          {option.name}
        </Select.Option>
      ))}
    </Select>
  );
}

export default CountrySelector;

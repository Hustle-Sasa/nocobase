import React from 'react';
import { Select } from 'antd';

import { type SupportEnvironment } from './use-environment-settings';

function EnvironmentSelector({
  value,
  onChange,
}: {
  value: SupportEnvironment;
  onChange: (value: SupportEnvironment) => void;
}) {
  return (
    <Select value={value} onChange={onChange} style={{ width: 140 }}>
      <Select.Option value="staging">Staging</Select.Option>
      <Select.Option value="production">Production</Select.Option>
    </Select>
  );
}

export default EnvironmentSelector;

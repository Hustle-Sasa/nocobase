import React from 'react';
import { Select, Tag } from 'antd';

import { type EMEnvironment } from './use-em-settings';

function EnvironmentSelector({ value, onChange }: { value: EMEnvironment; onChange: (value: EMEnvironment) => void }) {
  return (
    <Select value={value} onChange={onChange} style={{ width: 140 }}>
      <Select.Option value="staging">Staging</Select.Option>
      <Select.Option value="production">Production</Select.Option>
    </Select>
  );
}

export default EnvironmentSelector;

import React from 'react';

const ENV_KEY = 'support_environment';

export type SupportEnvironment = 'production' | 'staging';

export function useEnvironmentSettings() {
  const [environment, setEnvironmentState] = React.useState<SupportEnvironment>(() => {
    if (typeof window === 'undefined') return 'staging';
    return (localStorage.getItem(ENV_KEY) as SupportEnvironment) || 'staging';
  });

  const setEnvironment = React.useCallback((value: SupportEnvironment) => {
    localStorage.setItem(ENV_KEY, value);
    setEnvironmentState(value);
  }, []);

  return { environment, setEnvironment };
}

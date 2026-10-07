import React from 'react';

const ENV_KEY = 'support_environment';

export type SupportEnvironment = 'production' | 'staging';

export function useEnvironmentSettings(defaultEnvironment: SupportEnvironment = 'staging') {
  const [environment, setEnvironmentState] = React.useState<SupportEnvironment>(() => {
    if (typeof window === 'undefined') return defaultEnvironment;
    return (localStorage.getItem(ENV_KEY) as SupportEnvironment) || defaultEnvironment;
  });

  const setEnvironment = React.useCallback((value: SupportEnvironment) => {
    localStorage.setItem(ENV_KEY, value);
    setEnvironmentState(value);
  }, []);

  return { environment, setEnvironment };
}

// Lets nested components (e.g. order detail tabs) read the environment chosen on the page
export const EnvironmentContext = React.createContext<SupportEnvironment>('production');

export const useEnvironment = () => React.useContext(EnvironmentContext);

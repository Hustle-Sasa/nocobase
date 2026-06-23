import React from 'react';

const EM_COUNTRY_KEY = 'em_country';
const EM_ENV_KEY = 'em_environment';

export type EMEnvironment = 'production' | 'staging';

export function useEMSettings() {
  const [country, setCountryState] = React.useState<string | undefined>(() => {
    if (typeof window === 'undefined') return 'KE';
    return localStorage.getItem(EM_COUNTRY_KEY) || 'KE';
  });

  const [environment, setEnvironmentState] = React.useState<EMEnvironment>(() => {
    if (typeof window === 'undefined') return 'staging';
    return (localStorage.getItem(EM_ENV_KEY) as EMEnvironment) || 'staging';
  });

  const setCountry = React.useCallback((value?: string) => {
    if (value) {
      localStorage.setItem(EM_COUNTRY_KEY, value);
    } else {
      localStorage.removeItem(EM_COUNTRY_KEY);
    }
    setCountryState(value);
  }, []);

  const setEnvironment = React.useCallback((value: EMEnvironment) => {
    localStorage.setItem(EM_ENV_KEY, value);
    setEnvironmentState(value);
  }, []);

  return { country, setCountry, environment, setEnvironment };
}

import React from 'react';
import { PoweredBy, css, useSystemSettings } from '@nocobase/client';
import { AuthenticatorsContextProvider } from '@nocobase/plugin-auth/client';
import { Outlet } from 'react-router-dom';
import { Row, Typography } from 'antd';

function AuthLayout() {
  const { data } = useSystemSettings();

  return (
    <Row
      style={{
        height: '100%',
        backgroundImage:
          'linear-gradient(194.96deg,rgba(211,72,117,.15) -57.83%,rgba(232,86,46,.15) 21.08%,rgba(0,204,153,.15))',
      }}
    >
      <div
        style={{
          maxWidth: 460,
          margin: '0 auto',
          paddingTop: '20vh',
          width: '100%',
          paddingRight: 16,
          paddingLeft: 16,
        }}
      >
        <div
          className={css`
            text-align: center;
            margin-bottom: 32px;
          `}
        >
          <h1>{data?.data?.title}</h1>

          <Typography.Title level={5}>Welcome Back!</Typography.Title>
          <Typography.Paragraph>Please sign in to continue</Typography.Paragraph>
        </div>

        <AuthenticatorsContextProvider>
          <Outlet />
        </AuthenticatorsContextProvider>

        <div
          className={css`
            position: absolute;
            bottom: 24px;
            width: 100%;
            left: 0;
            text-align: center;
          `}
        >
          <PoweredBy />
        </div>
      </div>
    </Row>
  );
}

export default AuthLayout;

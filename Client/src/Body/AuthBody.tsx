import React from 'react';
import { Outlet } from 'react-router-dom';

const AuthBody = () => {
  return (
    <div>
      <Outlet />
    </div>
  );
}

export default AuthBody;

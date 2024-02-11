import React from 'react';
import Navigation from './NavigationComponent';

const LayoutComponent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      <main>{children}</main>
    </>
  );
};

export default LayoutComponent;

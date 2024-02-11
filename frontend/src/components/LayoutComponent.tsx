import React from 'react';
import Navigation from './NavigationComponent';

const LayoutComponent: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <div className='font-sans'>
      <main>{children}</main>
    </div>
  );
};

export default LayoutComponent;

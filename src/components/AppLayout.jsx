import React, { memo } from 'react';

const AppLayout = memo(({ children }) => {
  return (
    <div className="flex h-screen bg-background">
      {/* <Sidebar /> */}
      <div className="flex-1 w-0 overflow-auto">{children}</div>
    </div>
  );
});

AppLayout.displayName = 'AppLayout';

export default AppLayout;

import React, { memo } from 'react';

// Memoized loading component for better performance
const PageLoader = memo(() => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <div className="text-center">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <div className="absolute top-0 left-0 w-12 h-12 border-4 border-transparent border-t-primary rounded-full animate-ping"></div>
      </div>
      <p className="text-default-500 mt-4 text-sm font-medium">Loading...</p>
    </div>
  </div>
));

PageLoader.displayName = 'PageLoader';

export default PageLoader;

import NavigationComponent from '../NavigationComponent';

// Add build identifier from env
const BUILD_IDENTIFIER = process.env.NEXT_PUBLIC_BUILD_IDENTIFIER;

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <NavigationComponent />
      <main className="flex-grow">
        {children}
      </main>
      
      {/* Build identifier for desktop - fixed to bottom left */}
      <div className="fixed bottom-2 left-2 hidden sm:block z-50">
        <div className="text-xs text-gray-500 bg-base-100 px-2 py-1 rounded-md shadow-sm">
          Build: {BUILD_IDENTIFIER}
        </div>
      </div>
    </div>
  );
};

export default Layout; 
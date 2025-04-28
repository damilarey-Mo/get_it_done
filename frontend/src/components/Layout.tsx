import React from 'react';
import { Link } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold text-primary-600">Get It Done</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Link to="/login" className="btn btn-outline">Log in</Link>
            <Link to="/signup" className="btn btn-primary">Sign up</Link>
          </div>
        </nav>
      </header>

      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>

      <footer className="bg-gray-50 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-gray-600">&copy; 2024 Get It Done. All rights reserved.</p>
            </div>
            <div className="flex space-x-6">
              <Link to="/privacy" className="text-gray-600 hover:text-gray-900">Privacy Policy</Link>
              <Link to="/terms" className="text-gray-600 hover:text-gray-900">Terms of Service</Link>
              <Link to="/contact" className="text-gray-600 hover:text-gray-900">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout; 
import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/common/SEO';

const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 animate-fade-in">
      <SEO title="Page Not Found" description="The page you're looking for doesn't exist." noIndex />
      <h1 className="font-heading text-9xl font-bold text-gray-200 mb-4">404</h1>
      <h2 className="text-2xl font-bold text-deep-forest mb-2">Page Not Found</h2>
      <p className="text-gray-500 mb-8 max-w-md">The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.</p>
      <Link to="/" className="btn-primary">Return to Home</Link>
    </div>
  );
};

export default NotFoundPage;

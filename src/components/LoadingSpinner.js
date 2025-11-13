import React from 'react';
import { Loader } from 'lucide-react';

const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Loader className="w-12 h-12 animate-spin text-pink-400 mx-auto mb-4" />
        <p className="text-gray-600">Loading products...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
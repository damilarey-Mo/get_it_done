import React from 'react';

const Home: React.FC = () => {
  return (
    <div className="text-center">
      <h1 className="heading-1 mb-4">Welcome to Get It Done</h1>
      <p className="text-body mb-8">
        Your trusted platform for local errands, courier services, and deliveries.
      </p>
      <div className="flex justify-center space-x-4">
        <button className="btn btn-primary">Get Started</button>
        <button className="btn btn-outline">Learn More</button>
      </div>
    </div>
  );
};

export default Home; 
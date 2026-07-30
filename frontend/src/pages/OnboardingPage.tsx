import React from 'react';
import { Navigate } from 'react-router-dom';

export const OnboardingPage: React.FC = () => {
  return <Navigate to="/create-bazar" replace />;
};

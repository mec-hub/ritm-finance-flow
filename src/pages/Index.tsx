
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  // Immediately redirect to dashboard with no delay
  useEffect(() => {
    navigate('/dashboard');
  }, [navigate]);

  // This won't be shown due to immediate redirect
  return null;
};

export default Index;

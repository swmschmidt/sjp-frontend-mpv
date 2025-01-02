import { useEffect } from 'react';
import axios from 'axios';

const PageTracker = () => {
  useEffect(() => {
    const sendPageView = async () => {
      try {
        await axios.post('https://flask-app-rough-glitter-6700.fly.dev/track_page', { page: window.location.href });
      } catch (error) {
        console.error('Error sending page view:', error);
      }
    };

    sendPageView();
  }, []);

  return null;
};

export default PageTracker;

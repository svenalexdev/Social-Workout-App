import React from 'react';
import { me } from './auth';

const checkAuth = async () => {
  const localStorage_userID = localStorage.getItem('userId');
  try {
    //waiting for token if token not available send message to login
    const user = await me();

    const userId = user._id;

    if (!localStorage_userID) {
      localStorage.setItem('userId', userId);
    }

    return true;
  } catch (error) {
    console.log('Please login');
    return false;
  }
};

export default checkAuth;

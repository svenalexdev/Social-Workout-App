import React from 'react';
import { me } from './auth';
import { setCookie, getCookie } from '../utils/cookieUtils';

const checkAuth = async () => {
  const cookie_userID = getCookie('userId');
  try {
    //waiting for token if token not available send message to login
    const user = await me();

    const userId = user._id;

    if (!cookie_userID) {
      setCookie('userId', userId);
    }

    return true;
  } catch (error) {
    console.log('Please login');
    return false;
  }
};

export default checkAuth;

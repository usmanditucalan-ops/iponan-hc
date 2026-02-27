import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

import Constants from 'expo-constants';
import { Platform } from 'react-native';

const getBaseUrl = () => {
  if (Platform.OS === 'web') return 'http://localhost:3001/api';
  
  const debuggerHost = Constants.expoConfig?.hostUri;
  const localhost = debuggerHost?.split(':')[0];

  if (!localhost) {
    // Fallback for simulators or if hostUri is null
    return Platform.OS === 'android' ? 'http://10.0.2.2:3001/api' : 'http://localhost:3001/api';
  }

  // Return the IP address of the machine running Expo
  return `http://${localhost}:3001/api`;
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;

import axios from 'axios';

import { config } from '../constants/config';

let mobileToken: string | null = null;

export const apiClient = axios.create({
  baseURL: config.apiBaseUrl,
  timeout: 15000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

export function setMobileToken(token: string | null): void {
  mobileToken = token;
}

apiClient.interceptors.request.use((request) => {
  if (mobileToken) {
    request.headers.Authorization = `Bearer ${mobileToken}`;
  }
  return request;
});

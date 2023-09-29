// user Module API
import request from './index';

const PATH_PREFIX = '/user';

export const login = data => {
  return request.post(`${PATH_PREFIX}/login`, data);
};

export const logout = () => {
  return request.post(`${PATH_PREFIX}/logout`);
};

export const getUser = () => {
  return request.get(`${PATH_PREFIX}/me`);
};

export const updateUser = data => {
  return request.put(`${PATH_PREFIX}/me`, data);
};

export const getUsers = wallets => {
  const data = [];
  wallets.forEach((item) => {
    data.push(`wallets=${item}`);
  });
  return request.get(`${PATH_PREFIX}/users?${data.join('&')}`);
};

export const getNonce = wallet => {
  return request.post(`${PATH_PREFIX}/refresh_nonce`, {wallet});
};

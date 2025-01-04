import axios from "axios";
import store from "../store";
import {parseToken,checkTokenValid,clearStorage} from "../utils/auth";
import getConfig from "constant/envCofnig";
import { clearLogin } from "store/reducer";

export const BASE_URL = getConfig().REACT_APP_BASE_ENDPOINT;
export const API_VERSION = process.env.REACT_APP_API_VERSION;

const instance = axios.create({
  baseURL: `${BASE_URL}/${API_VERSION}`,
  timeout: 15000,
  headers: { "content-type": "application/json" },
});

instance.interceptors.request.use(function (config) {
  const method = config.method?.toLowerCase();
  if (
    !["post", "put", "delete"].includes(method) &&
    !config.url.includes("my") &&
    !config.url.includes("me") &&
    !config.url.includes("level") &&
    !config.url.includes("push") &&
      !config.url.includes('proposals/list')&&
    !config.url.includes("app_bundles")
  ) {
    return config;
  }

  let urls = ['/user/login', '/user/refresh_nonce', '/seeauth/login',"/user/users"];

  const isValid = urls.some(prefix => config.url.startsWith(prefix));

  if (isValid) {
    return config;
  }
  const tokenstr = store.getState().userToken;



  if(config.url.indexOf("proposals/list") > -1) {
    if (tokenstr && tokenstr !== "null" ){
      config.headers.Authorization = `Bearer ${tokenstr?.token || ""}`;
      return config;
    }else{
      return config;
    }
  }



  if (!tokenstr) {
    return config;
  }

  if (!checkTokenValid(tokenstr?.token, tokenstr?.token_exp)) {
    clearStorage();
    store.dispatch(clearLogin());
    try {
      const e = new Event("TOKEN_EXPIRED");
      window.dispatchEvent(e);
    } catch (error) {
      logError("dispatch event failed", error);
    }
    return Promise.reject();
  }

  if (!config.headers) {
    config.headers = {};
  }
  config.headers.Authorization = `Bearer ${tokenstr?.token || ""}`;
  return config;
});

instance.interceptors.response.use(
  (response) => {
    if(response.data.code !== 200){
      return Promise.reject(response.data);
    }
    return response;
  },
  (error) => {
    return Promise.reject(error);
  },
);

/**
 * get
 * @method get
 * @param {url, params, loading}
 */
const get = function (url, params) {
  return new Promise((resolve, reject) => {
    instance
      .get(url, { params })
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err);
      });
  });
};
/**
 * post
 * @method post
 * @param {url, params}
 */
const post = function (url, data) {
  return new Promise((resolve, reject) => {
    instance
      .post(url, data)
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

/**
 * put
 * @method put
 * @param {url, params}
 */
const put = function (url, data) {
  return new Promise((resolve, reject) => {
    instance
      .put(url, data)
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const rdelete = function (url, params) {
  return new Promise((resolve, reject) => {
    instance
      .delete(url, {
        params,
      })
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

export default { get, post, put, delete: rdelete };

import axios from "axios";
import { getAuthToken, setCookieWithAttributes } from "../utils/cookies";


const axiosIns = axios.create({
  // You can add your headers here
  // ================================
  baseURL: `http://${process.env.BACKEND_IP}:${process.env.BACKEND_PORT}`,
  // timeout: 1000,
  // headers: {'X-Custom-Header': 'foobar'},
  /*For axios 0.27.2*/
  responseType: "json",
});

// Request Interceptor
axiosIns.interceptors.request.use(
  (config) => {
    // Get token from cookies
    const token = getAuthToken("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    console.error("Request Error:", error);
    return Promise.reject(error);
  },
);

// Response Interceptor
axiosIns.interceptors.response.use(
  (response) => {
    // Get token from response headers
    const newToken = response.headers["authorization"];

    if (newToken) {
      setCookieWithAttributes(newToken);
      console.log("Token updated in cookies:", newToken);
    }

    return response;
  },
  (error) => {
    console.error("Response Error:", error);
    return Promise.reject(error);
  },
);

export default axiosIns;

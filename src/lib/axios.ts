import axios from "axios";

export const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    const deviceId = localStorage.getItem("device_id");
    let authToken = "";
    const authHeader = { accessToken: "", deviceId: "" };
    if (token) {
      authToken += `accessToken:${token}`;
      authHeader.accessToken = token;
    }

    if (deviceId) {
      if (authToken !== "") authToken += ":";
      authToken += `deviceId:${deviceId}`;
      authHeader.deviceId = deviceId;
    }

    if (config.headers) {
      config.headers["Authorization"] = JSON.stringify(authHeader);
    }

    console.log(config);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

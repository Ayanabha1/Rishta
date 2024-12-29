import axios from "axios";

export const API = axios.create({
  baseURL: new URL(process.env.NEXT_PUBLIC_API_URL!).toString(),
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    const deviceId = localStorage.getItem("device_id");

    if (token) {
      if (config.headers) config.headers["accessToken"] = token;
    }

    if (deviceId) {
      if (config.headers) config.headers["Device-ID"] = deviceId;
    }

    if (config.headers) {
      config.headers["Access-Control-Allow-Origin"] = "*";
      config.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE";
      config.headers["Access-Control-Allow-Headers"] =
        "Content-Type, Authorization";
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

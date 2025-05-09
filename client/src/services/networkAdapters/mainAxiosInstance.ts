import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { detect } from "detect-browser";
import store from "../../redux/store";
import { config } from "../../config/config";

const browser = detect();

const mainInstance = axios.create({
  baseURL: config.apiUrl,
  headers: {
    "device-id": uuidv4(),
    "device-type": "web"
  }
});

if (browser) {
  mainInstance.defaults.headers.userdevice = `${browser.name} ${browser.version} - ${browser.os}`;
}

mainInstance.interceptors.request.use((instanceConfig) => {
  const { token } = store.getState().user;
  if (!instanceConfig.headers.Authorization) {
    instanceConfig.headers.Authorization =
      token || localStorage.getItem("token") || "";
  }

  return instanceConfig;
});

mainInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error("Error in Axios Interceptor:", error);
      if (
        error.response &&
        error.response.status === 401 &&
        typeof window !== "undefined"
      ) {
        // localStorage.removeItem("token");
  
        window.location.href = "/login";
      }
  
      return Promise.reject(error);
    }
);

export default mainInstance;
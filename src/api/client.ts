import axios from "axios";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/authStore"; // Import your store
import { getErrorMessage } from '../utils/helpers';

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token; // Pull directly from Zustand state
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle global responses and errors
api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Dismiss any active toasts to prevent spamming the user
    toast.dismiss();

    const isLoginEndpoint = err.config?.url?.includes("/auth/login") || err.config?.url?.includes("/login");

    if (err.response?.status === 401) {
      if (isLoginEndpoint) {
        // Silently reject the promise so LoginPage's catch block can trigger the toast
        return Promise.reject(err);
      }

      // 2. Existing logic for actual session expiration on other protected routes
      toast.error("Session expired. Please sign in again.", {
        id: "auth-error",
        icon: "🔒",
      });

      setTimeout(() => {
        // Clear the React state. (Zustand allows calling actions outside components like this)
        useAuthStore.getState().logout?.();
      }, 1500);
      return new Promise(() => {}); // Pause the UI while waiting
    } else if (err.response?.status === 403) {
      toast.error("You do not have permission to perform this action.");
    } else {
      // Catch-all for 500s, network errors, etc.
      toast.error(getErrorMessage(err));
    }

    return Promise.reject(err);
  },
);

export default api;

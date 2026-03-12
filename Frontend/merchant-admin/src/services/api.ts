import axios from "axios";
import Cookies from "js-cookie";
// V1: Direct call to Gateway.
// Ideally via Next.js Proxy/BFF but keeping it simple client-side for "A1"
const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";
export const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});
// Request Interceptor: Attach Token
api.interceptors.request.use((config) => {
    const token = Cookies.get("vayva_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    // Attach Active Store ID if present
    const activeStoreId = Cookies.get("vayva_store_id");
    if (activeStoreId) {
        config.headers["x-store-id"] = activeStoreId;
    }
    return config;
});
// Response Interceptor: Handle 401
api.interceptors.response.use((response) => response, (error) => {
    if (error.response?.status === 401) {
        // Clear session and redirect if needed
        // Cookies.remove('vayva_token');
        // window.location.href = '/signin';
    }
    return Promise.reject(error);
});

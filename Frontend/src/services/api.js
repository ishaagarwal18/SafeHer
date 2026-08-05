import axios from "axios";

// Gets the CSRF token from Django's cookie
function getCookie(name) {
    const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
    return match ? decodeURIComponent(match[2]) : null;
}

const BASE_URL = import.meta.env.VITE_API_URL || "";

const api = axios.create({
    baseURL: `${BASE_URL}/api/`,
    withCredentials: true,
});

// Attach CSRF token to every mutating request
api.interceptors.request.use((config) => {
    if (["post", "put", "patch", "delete"].includes(config.method)) {
        const csrfToken = getCookie("csrftoken");
        if (csrfToken) config.headers["X-CSRFToken"] = csrfToken;
    }
    return config;
});

// Separate instance for endpoints under /dashboard/
export const dashboardApi = axios.create({
    baseURL: `${BASE_URL}/dashboard/`,
    withCredentials: true,
});

dashboardApi.interceptors.request.use((config) => {
    if (["post", "put", "patch", "delete"].includes(config.method)) {
        const csrfToken = getCookie("csrftoken");
        if (csrfToken) config.headers["X-CSRFToken"] = csrfToken;
    }
    return config;
});

export default api;

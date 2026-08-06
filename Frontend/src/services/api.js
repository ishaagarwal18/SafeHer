import axios from "axios";

// Gets the CSRF token from Django's cookie
function getCookie(name) {
    const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
    return match ? decodeURIComponent(match[2]) : null;
}

const api = axios.create({
    baseURL: "/api/",
    withCredentials: true,
});

function getStoredUserId() {
    try {
        const saved = localStorage.getItem("user");
        if (saved) {
            const parsed = JSON.parse(saved);
            return parsed?.id || null;
        }
    } catch (_) {}
    return null;
}

// Attach CSRF token and X-User-Id to requests
api.interceptors.request.use((config) => {
    const userId = getStoredUserId();
    if (userId) {
        config.headers["X-User-Id"] = userId;
    }
    if (["post", "put", "patch", "delete"].includes(config.method)) {
        const csrfToken = getCookie("csrftoken");
        if (csrfToken) config.headers["X-CSRFToken"] = csrfToken;
    }
    return config;
});

// Separate instance for endpoints under /dashboard/
export const dashboardApi = axios.create({
    baseURL: "/dashboard/",
    withCredentials: true,
});

dashboardApi.interceptors.request.use((config) => {
    const userId = getStoredUserId();
    if (userId) {
        config.headers["X-User-Id"] = userId;
    }
    if (["post", "put", "patch", "delete"].includes(config.method)) {
        const csrfToken = getCookie("csrftoken");
        if (csrfToken) config.headers["X-CSRFToken"] = csrfToken;
    }
    return config;
});


export default api;

import axios from "axios";

// Gets the CSRF token from Django's cookie
function getCookie(name) {
    const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
    return match ? decodeURIComponent(match[2]) : null;
}

<<<<<<< HEAD
const api = axios.create({
    baseURL: "/api/",
=======
const hostname = typeof window !== "undefined" && window.location.hostname ? window.location.hostname : "127.0.0.1";

const api = axios.create({
    baseURL: `http://${hostname}:8000/api/`,
>>>>>>> dceb0a1555706ab72984b56d01e3aa17a60ebe8d
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
<<<<<<< HEAD
    baseURL: "/dashboard/",
=======
    baseURL: `http://${hostname}:8000/dashboard/`,
>>>>>>> dceb0a1555706ab72984b56d01e3aa17a60ebe8d
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
<<<<<<< HEAD
=======

>>>>>>> dceb0a1555706ab72984b56d01e3aa17a60ebe8d

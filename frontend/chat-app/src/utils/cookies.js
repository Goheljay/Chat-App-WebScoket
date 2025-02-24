import Cookies from "js-cookie";

const isLocal = process.env.NODE_ENV === "local";

const cookies = Cookies.withAttributes({
    httpOnly: isLocal,
});
// Set Token in Cookies
export const setCookieWithAttributes = (value) => {
    let inFifteenMinutes = new Date(new Date().getTime() + 30 * 60 * 1000);
    Cookies.set('accessToken', value, { expires: inFifteenMinutes, path: '' })
};

// Get Token from Cookies
export const getAuthToken = (key) => {
    return cookies.get(key);
};

// Remove Token from Cookies (Logout)
export const removeAuthToken = () => {
    cookies.remove("authToken");
};

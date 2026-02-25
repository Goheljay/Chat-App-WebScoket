import Cookies from "js-cookie";


const cookies = Cookies.withAttributes({
    httpOnly: true,
});
// Set Token in Cookies
export const setCookieWithAttributes = (key: string,value: string) => {
    let inFifteenMinutes = new Date(new Date().getTime() + 30 * 60 * 1000);
    Cookies.set(key, value, { expires: inFifteenMinutes, path: '' })
};

// Get Token from Cookies
export const getAuthToken = (key: string) => {
    return cookies.get(key);
};

// Remove Token from Cookies (Logout)
export const removeAuthToken = () => {
    cookies.remove("accessToken");
};

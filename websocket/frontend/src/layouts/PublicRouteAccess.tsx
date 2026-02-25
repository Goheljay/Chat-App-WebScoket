import {Navigate, Outlet} from "react-router-dom";
import { getAuthToken } from "../utils/cookies";
// import {getAuthToken} from "../../utils/cookies";

function PublicRouteAccess() {
    const token = getAuthToken("accessToken");
    // const userRole = localStorage.getItem("role");

    if (token) {
        return <Navigate to="/" replace />;
    }
    return <Outlet />;

}

export default PublicRouteAccess;
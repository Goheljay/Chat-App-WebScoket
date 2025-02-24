import {Navigate, Outlet} from "react-router-dom";
import {getAuthToken} from "../../utils/cookies";

function PublicRouteAccess({requiredRole}) {
    const token = getAuthToken("accessToken");
    const userRole = localStorage.getItem("role");

    if (token) {
        return <Navigate to="/admin" replace />;
    }
    return <Outlet />;

}

export default PublicRouteAccess;

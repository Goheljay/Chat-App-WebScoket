import {Navigate, Outlet} from "react-router-dom";
import {getAuthToken} from "../utils/cookies";

function PrivateRouteAccess() {
    const token = getAuthToken("accessToken");
    // const userRole = localStorage.getItem("role");

    if (!token) {
      return <Navigate to="/auth/login" replace />;
    }

    // if (requiredRole && userRole !== requiredRole) {
    //     return <Navigate to="/admin" replace />;
    // }

  return (
    <>
        <Outlet />
    </>
  );
}

export default PrivateRouteAccess;
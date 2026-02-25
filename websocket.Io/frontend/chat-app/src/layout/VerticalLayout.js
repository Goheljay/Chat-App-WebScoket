import {Navigate, Outlet} from "react-router-dom";
import { NavBar } from "../navigation/NavBar";
import {getAuthToken} from "../utils/cookies";

function VerticalLayout({requiredRole}) {
    const token = getAuthToken("accessToken");
    const userRole = localStorage.getItem("role");

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // if (requiredRole && userRole !== requiredRole) {
    //     return <Navigate to="/admin" replace />;
    // }

  return (
    <>
      <NavBar />
      <div className="mt-20">
        <Outlet />
      </div>
    </>
  );
}

export default VerticalLayout;

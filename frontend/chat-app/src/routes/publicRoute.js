import React from "react";
import Login from "../view/Login";
import PublicRouteAccess from "../layout/authentication/PublicRouteAccess";
import Signup from "../view/Signup";

const router = [
    // Define your public routes here
    {
        path: "/auth/",
        element: <PublicRouteAccess/>,
        children: [
            {
                path: "login",
                element: <Login />,
            },
            {
                path: "signup",
                element: <Signup />,
            },
        ],
    },
];

export default router;

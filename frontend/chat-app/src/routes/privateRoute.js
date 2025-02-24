import React from "react";
import Home from "../view/Home";
import About from "../view/About";
import VerticalLayout from "../layout/VerticalLayout";
import {Navigate} from "react-router-dom";

const privateRoute = [
    // Define your private routes here
    {
        path: "/admin",
        element: <VerticalLayout requiredRole="admin" />,
        children: [
            {
                path: "",
                element: <Home />,
            },
            // {
            //     path: "about",
            //     element: <About />,
            // },
        ],
    },
    { path: "/", element: <Navigate to="/auth/login" replace /> },
    { path: "*", element: <Navigate to="/auth/login" replace /> }
];

export default privateRoute;

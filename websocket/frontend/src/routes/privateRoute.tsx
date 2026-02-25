
import { Navigate } from "react-router-dom";
import PrivateRouteAccess from "../layouts/PrivateRouteAccess";
import Home from "../pages/Home";
import AgentCouncil from "../pages/AgentCouncil";

const privateRoute = [
    { path: "*", element: <Navigate to="/agent" replace /> },
    {
        name: 'dashboard',
        path: '/dashboard',
        element: <PrivateRouteAccess />,
        children: [
            {
                name: 'dashboard',
                path: '',
                element: <Home />
            }
        ]
    },
    {
        name: 'agent',
        path: '/agent',
        element: <PrivateRouteAccess />,
        children: [
            {
                name: 'agent',
                path: '',
                element: <AgentCouncil />
            }
        ]
    }
]


export{
    privateRoute,   
};
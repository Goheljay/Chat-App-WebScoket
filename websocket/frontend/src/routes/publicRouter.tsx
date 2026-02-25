import LoginPage from "../pages/Login";
import PublicRouteAccess from "../layouts/PublicRouteAccess";

const publicRoute = [
    {
        name:'auth',
        path:'/auth/',
        element:<PublicRouteAccess />,
        children:[
            {
                name:'login',
                path:'login',
                element: <LoginPage />
            }
        ]
    }
]


export{
    publicRoute,   
};
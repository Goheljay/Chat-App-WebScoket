import React from "react";
import {createBrowserRouter} from "react-router-dom";
import publicRoute from "./publicRoute";
import privateRoute from "./privateRoute";

const router = createBrowserRouter([
    ...publicRoute, ...privateRoute
]);

export default router;

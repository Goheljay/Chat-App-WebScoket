import { createBrowserRouter } from "react-router-dom";
import { publicRoute } from "./publicRouter";
import { privateRoute } from "./privateRoute";

const router = createBrowserRouter([
    ...publicRoute,
    ...privateRoute,
])

export { router };
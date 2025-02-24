import { SideBar, NavBar } from "./NavBar";
import AppRoutes from "../routes";

function baseDashboard() {
  return (
    <>
      <div className="h-screen">
        <NavBar />
        <SideBar />
        <AppRoutes />
      </div>
    </>
  );
}
export default baseDashboard;

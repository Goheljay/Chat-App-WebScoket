import { useState } from "react";
import { Link } from "react-router-dom";
import sidebarRoutes from "./SidebarRoutes";
import FeatherIcon from "feather-icons-react";

export function NavBar() {
  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-800 shadow-lg">
        <div className="mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Title */}
            <div className="flex items-center">
              <div className="rounded bg-white p-2 w-10 h-10 shadow-md flex items-center justify-center">
                <img
                    src="https://res.cloudinary.com/speedwares/image/upload/v1659284687/windframe-logo-main_daes7r.png"
                    className="h-8 w-8"
                    alt="Logo"
                />
              </div>
              <span className="text-white text-2xl font-semibold ml-4">
              Chat App
            </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-6 text-white items-center">
              <Link to="/home" className="hover:text-gray-300 transition">Home</Link>
              <Link to="/chats" className="hover:text-gray-300 transition">Chats</Link>
              <Link to="/profile" className="hover:text-gray-300 transition">Profile</Link>
              <button className="bg-red-500 px-4 py-1 rounded-lg hover:bg-red-600 transition">
                Logout
              </button>
            </div>

            {/* Mobile Menu Button */}
            {/*<button*/}
            {/*    className="md:hidden text-white"*/}
            {/*    onClick={() => setMenuOpen(!menuOpen)}*/}
            {/*>*/}
            {/*  {menuOpen ? <X size={28} /> : <Menu size={28} />}*/}
            {/*</button>*/}
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {/*{menuOpen && (*/}
        {/*    <div className="md:hidden bg-gray-900 text-white py-3">*/}
        {/*      <div className="flex flex-col items-center space-y-3">*/}
        {/*        <Link to="/home" className="hover:text-gray-300">Home</Link>*/}
        {/*        <Link to="/chats" className="hover:text-gray-300">Chats</Link>*/}
        {/*        <Link to="/profile" className="hover:text-gray-300">Profile</Link>*/}
        {/*        <button className="bg-red-500 px-4 py-1 rounded-lg hover:bg-red-600 transition">*/}
        {/*          Logout*/}
        {/*        </button>*/}
        {/*      </div>*/}
        {/*    </div>*/}
        {/*)}*/}
      </nav>
    </>
  );
}

// export function SideBar() {
//   const [isOpen, setIsOpen] = useState(false);
//
//   return (
//     <>
//       {/* Sidebar */}
//       <div
//         className={`fixed top-0 left-0 z-50 h-full bg-gray-800 text-white space-y-6 py-7 px-2 transition-all  ${isOpen ? "w-64 duration-300" : "w-16 duration-300"}`}
//         onMouseEnter={() => setIsOpen(true)}
//         onMouseLeave={() => setIsOpen(false)}
//       >
//         <div className="flex items-center">
//           <div className="rounded overflow-hidden shadow-xl bg-white p-2 min-w-10 w-10 h-10  ">
//             <img
//               src="https://res.cloudinary.com/speedwares/image/upload/v1659284687/windframe-logo-main_daes7r.png"
//               className="h-8 w-8"
//               alt=""
//             />
//           </div>
//           <div
//             className={`${isOpen ? "scale-100" : "scale-0"} text-2xl flex-1 text-nowrap font-semibold text-center self-center justify-self-center `}
//           >
//             My Sidebar
//           </div>
//         </div>
//
//         <nav className="text-start">
//           {sidebarRoutes.map((data, index) => (
//             <Link
//               to={data.path}
//               className="py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700 flex items-center"
//             >
//               <div>
//                 <FeatherIcon icon={data.icon} className="mr-5" />
//               </div>
//               <span className={`${isOpen ? "scale-100" : "scale-0"} flex-1 text-nowrap self-center justify-self-center `}>{isOpen ? data.name : ""}</span>
//             </Link>
//           ))}
//         </nav>
//       </div>
//     </>
//   );
// }

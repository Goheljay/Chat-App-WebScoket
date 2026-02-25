import { useEffect, useState } from "react";
import FeatherIcon from "feather-icons-react";
import {getAllUsers, newChatUser} from "../services/authentication";

const NewUserChat = ({ onClose, showModal, startNewUserChat }) => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
      getAllUsers()
          .then(response => {
              const responseData = response.data
              setUsers([...responseData.data])
          })
          .catch(error => {
              console.log(error)
          })
  }, [])
  const onChatClick = (user) => {
      startNewUserChat(user);
  };

  return (
      <div
          className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm z-50 transition-opacity duration-300 ${
              showModal ? "opacity-100" : "opacity-0"
          }`}
          onClick={onClose}
      >
          <div
              className={`bg-white h-[400px] w-[700px] p-6 rounded-lg shadow-2xl transform transition-all duration-300 ${
                  showModal ? "scale-100" : "scale-90 opacity-0"
              }`}
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
          >
              {/* Modal Header */}
              <div className="flex justify-between items-center border-b pb-2 mb-2">
                  <h2 className="text-lg font-semibold text-gray-800">New Users</h2>
                  <button onClick={onClose}>
                      <FeatherIcon icon="x" className="w-5 h-5 text-gray-600 hover:text-gray-800" />
                  </button>
              </div>

              {/* User List with Auto Scroll */}
              <div className="overflow-y-auto max-h-[300px] h-full">
                  {users.length > 0 ? (
                      users.map((user) => (
                          <div
                              key={user.id}
                              className="flex items-center justify-between p-2 border rounded-lg bg-gray-50 hover:bg-gray-100 transition mb-4"
                          >
                              <div className="flex items-center">
                                  <div className="w-8 h-8 rounded-full bg-gray-300 mr-3"></div>
                                  <p className="text-gray-800">{user.firstName} {user.lastName}</p>
                              </div>
                              <button onClick={() => onChatClick(user)} className="cursor-pointer">
                                  <FeatherIcon icon="message-circle" className="w-5 h-5 text-gray-800 hover:text-blue-700" />
                              </button>
                          </div>
                      ))
                  ) : (
                      <p className="text-gray-500">No new users found.</p>
                  )}
              </div>
          </div>
      </div>


  );
};

export default NewUserChat;

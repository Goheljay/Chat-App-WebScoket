import { useEffect, useRef, useState } from "react";
import FeatherIcon from "feather-icons-react";
import {
  chatWithExistingUser,
  getChats,
  getFriendsList,
  newChatUser,
} from "../services/authentication";
import { io } from "socket.io-client";
import localStorageUtil from "../utils/localstorage";
import NewUsers from "../component/NewUsers";
import { createPortal } from "react-dom";

const socket = io("http://localhost:8081"); // Replace with your backend URL
function Home() {
  const [currentChat, setCurrentChat] = useState(null);
  const [currentMessage, setCurrentMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  let currentUserId = localStorageUtil.getItem("currentUserId");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchAllFriendsList();
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [messages]); // Runs whenever messages change

  useEffect(() => {
    socket.on("connect", () => console.log("Connected to WebSocket server"));

    // Listen for taskMoved events from the backend

    socket.on(currentUserId, (messages) => {
      console.log(messages);
      setMessages((prevArray) => [
        ...prevArray,
        {
          chatId: messages.chatId,
          senderId: messages.senderId,
          receiverId: messages.receiverId,
          content: messages.message,
          messageType: messages.messageType,
          fileUrl: messages.fileUrl,
        },
      ]);
      // setTasks((prevTasks) =>
      //   prevTasks.map((task) =>
      //     task.id === updatedTask.id
      //       ? { ...task, columnId: updatedTask.column_id }
      //       : task,
      //   ),
      // );
    });

    return () => socket.disconnect();
  }, []);

  const fetchAllFriendsList = () => {
    getFriendsList()
      .then((response) => {
        console.log(response.data);
        let userDetails = response.data.data;
        localStorageUtil.setItem("currentUserDetails", userDetails);
        localStorageUtil.setItem("currentUserId", userDetails._id);

        setUsers([...userDetails.friends]);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const sendChat = () => {
    if (currentMessage === "") {
      return;
    }
    if (currentChat.newRequest) {
      newChatUser({
        userId: currentChat._id,
        message: currentMessage,
      })
        .then((response) => {
          console.log(response);
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      chatWithExistingUser({
        userId: currentChat._id,
        message: currentMessage,
      })
        .then((response) => {
          getAllChats(currentChat);
          setCurrentMessage("");
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };

  const getAllChats = (currentUser) => {
    getChats({
      userId: currentUser._id,
    })
      .then((response) => {
        console.log(response.data);
        const responseData = response.data;
        console.log(responseData.data);
        setMessages([...responseData.data]);
      })
      .catch((error) => {
        console.log(error);
      });
  };
  const handleUserClick = (user) => {
    setCurrentChat(user);
    getAllChats(user);
  };

  const addNewUsers = () => {
    setShowModal(true);
  };

  const startNewUserChat = (user) => {
    setCurrentChat({
      ...user,
      newRequest: true,
    });
    setShowModal(false);
    setMessages([]);
    // newChatUser({
    //     userId: user._id,
    //     message: currentMessage
    // })
    //     .then(response => {
    //         console.log(response)
    //     })
    //     .catch(error => {
    //         console.log(error)
    //     })
  };

  return (
    <div className="flex h-[calc(100vh-90px)] bg-gray-100">
      {/* Left Sidebar */}
      <div className="w-1/4 bg-white border-r border-gray-300 p-4">
        <div className="flex items-center justify-end border-t border-gray-300 pt-4">
          <button
            className="rounded-md text-white bg-gray-800 px-1 py-1 flex item-center"
            onClick={() => addNewUsers()}
          >
            <FeatherIcon icon="plus" size="20" />
            Add
          </button>
        </div>
        {showModal &&
          createPortal(
            <NewUsers
              onClose={() => {
                setShowModal(false);
              }}
              startNewUserChat={startNewUserChat}
              showModal={showModal}
            />,
            document.body,
          )}
        {users.map((user) => (
          <div
            key={user._id}
            className="flex items-center p-2 hover:bg-gray-200 cursor-pointer rounded-md"
            onClick={() => handleUserClick(user)}
          >
            <div className="w-12 h-12 rounded-full bg-gray-300 mr-3"></div>
            <div>
              <p className="font-medium text-gray-800">
                {user.firstName} {user.lastName}
              </p>
              {/*<p className="text-sm text-gray-500">{user.lastMessage}</p>*/}
            </div>
          </div>
        ))}
      </div>

      {/* Right Section: Current Chat */}
      <div className="flex-1 bg-white p-4">
        {currentChat ? (
          <div>
            <div className="flex justify-between items-center border-b border-gray-300 pb-3 mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-gray-300"></div>
                <div>
                  <p className="font-semibold text-gray-800">
                    {currentChat.firstName} {currentChat.lastName}
                  </p>
                  {/*<p className="text-sm text-gray-500">Online</p>*/}
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            <div
              className="h-[calc(70vh-20px)] overflow-y-auto p-3  space-y-4"
              ref={messagesEndRef}
            >
              {messages.map((message) => {
                const isCurrentUser = message.sender === currentUserId; // Assuming you have currentUserId available

                return (
                  <div
                    key={message._id}
                    className="overflow-y-auto p-3 space-y-4"
                  >
                    <div
                      className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs p-3 rounded-lg text-sm ${
                          isCurrentUser
                            ? "bg-gray-800 text-white"
                            : "bg-gray-200 text-gray-800"
                        }`}
                      >
                        {message.content} {/* Display the message text here */}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Message Input */}
            <div className="flex items-center border-t border-gray-300 pt-4">
              <input
                type="text"
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    sendChat();
                  }
                }}
                placeholder="Type a message"
                className="flex-1 p-2 border border-gray-300 rounded-md"
              />
              <button
                className="ml-3 text-white bg-gray-800 p-2 rounded-full"
                onClick={() => sendChat()}
              >
                <FeatherIcon icon="send" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center h-full text-gray-500">
            <p>Select a contact to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;

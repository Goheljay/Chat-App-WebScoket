import axiosIns from "../config/axios";
export const registerUser = (requestData) => {
    return axiosIns({
        url: `/auth/signup`,
        method: "post",
        data: requestData,
    });
};

export const loginUser = (requestData) => {
    return axiosIns({
        url: `/auth/login`,
        method: "post",
        data: requestData,
    });
};

export const getFriendsList = () => {
    return axiosIns({
        url: `/app/getRecentFriends`,
        method: "get",
    });
};

export const chatWithExistingUser = (requestData) => {
    return axiosIns({
        url: `/app/existingChat`,
        method: "post",
        data: requestData
    });
};

export const getChats = (requestData) => {
    return axiosIns({
        url: `/app/getChats`,
        method: "post",
        data: requestData
    });
};

export const getAllUsers = () => {
    return axiosIns({
        url: `/app/getAllUsers`,
        method: "get",
    });
};

//new Chat
export const newChatUser = (requestData) => {
    return axiosIns({
        url: `/app/newChat`,
        method: "post",
        data: requestData
    });
};

// AI Services
export const generateImageWithAI = (requestData) => {
    return axiosIns({
        url: `/ai/generate-image`,
        method: "post",
        data: requestData
    });
};

export const generateTextWithAI = (requestData) => {
    return axiosIns({
        url: `/ai/generate-text`,
        method: "post",
        data: requestData
    });
};


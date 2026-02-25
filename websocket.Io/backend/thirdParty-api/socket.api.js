const axios = require("axios");
require('dotenv').config();

const {WEBSOCKET_URL} = process.env;
const axiosIns = axios.create({
    // You can add your headers here
    // ================================
    baseURL: WEBSOCKET_URL,
    // timeout: 1000,
    // headers: {'X-Custom-Header': 'foobar'},
    /*For axios 0.27.2*/
    responseType: 'json'
});

const notifyChatToSocket = (requestData, token) => {
    return axiosIns({
        url: `/socketMessage`,
        method: "post",
        data: requestData,
        headers: {
            Authorization: token
        }
    });
};

module.exports = {
    notifyChatToSocket
}

const axios = require("axios");

const axiosIns = axios.create({
    // You can add your headers here
    // ================================
    baseURL: 'http://localhost:8081',
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

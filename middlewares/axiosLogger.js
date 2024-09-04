const axios = require('axios');

// Create an Axios instance
const axiosInstance = axios.create();

// Add a request interceptor
axiosInstance.interceptors.request.use(request => {
    console.log(`External Request Method: ${request.method.toUpperCase()}`);
    console.log(`External Request URL: ${request.url}`);
    console.log(`External Request Headers: ${JSON.stringify(request.headers)}`);
    if (request.data) {
        console.log(`External Request Body: ${JSON.stringify(request.data)}`);
    }
    return request;
}, error => {
    console.error('Error in external request:', error);
    return Promise.reject(error);
});

// Add a response interceptor
axiosInstance.interceptors.response.use(response => {
    console.log(`External Response Status: ${response.status}`);
    console.log(`External Response Data: ${JSON.stringify(response.data)}`);
    return response;
}, error => {
    if (error.response) {
        console.error(`External Response Status: ${error.response.status}`);
        console.error(`External Response Data: ${JSON.stringify(error.response.data)}`);
    } else {
        console.error('Error in external response:', error.message);
    }
    return Promise.reject(error);
});

module.exports = axiosInstance;
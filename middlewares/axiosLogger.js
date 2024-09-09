const axios = require('axios');
const CircuitBreaker = require('opossum');

// Create an Axios instance
const axiosInstance = axios.create();

// Define the circuit breaker options
const options = {
    timeout: 3000, // If the request takes longer than 3 seconds, trigger a failure
    errorThresholdPercentage: 50, // When 50% of requests fail, open the circuit
    resetTimeout: 30000 // After 30 seconds, try again.
};

// Create a circuit breaker for the Axios instance
const breaker = new CircuitBreaker(axiosInstance.request, options);

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

module.exports = { axiosInstance, breaker };
# Country Comparison API

## Overview

The Country Comparison API provides endpoints to fetch country and population data. It leverages caching with Redis to improve performance and reduce the load on external APIs.

## Features

### 1. Fetching Country Data

The `getCountries` function fetches a list of countries from an external API. It first checks if the data is available in the Redis cache. If not, it fetches the data from the API and stores it in the cache for future requests.

### 2. Fetching Population Data

The `getPopulation` function fetches population data for specified countries on a given date. It supports sorting the results in ascending or descending order. Similar to `getCountries`, it uses Redis for caching. Additionally, the implementation includes automatically adding the country of the requested API URL and the date parameter to the request, leveraging Redis caching for faster response times and fewer external API requests.

### 3. Redis Integration

Redis is used to cache the responses from the external APIs to improve performance. The Redis client is initialized based on the environment variable `USE_REDIS`.

### 4. Logging Middleware

A custom logging middleware logs details about incoming requests, including method, URL, IP address, headers, and body. It also fetches the country information based on the IP address using the `ipinfo` package.

### 5. Axios Interceptors

Axios interceptors are used to log details about external requests and responses, including method, URL, headers, and data.

### 6. Error Handling Middleware

A custom error handling middleware formats error responses and sets appropriate HTTP status codes.

### 7. Docker and Docker Compose

The application is containerized using Docker. Docker Compose is used to manage the application and Redis services.

### 8. Environment Configuration

Environment variables are used to configure the application, including whether to use Redis and the Redis host and port.

## Speed Comparison: Caching vs. Non-Caching

### Non-Caching

When Redis is not used, every request to fetch country or population data results in an external API call. This can be slow and puts a load on the external API.

### Caching

When Redis is used, the application first checks the cache for the requested data. If the data is available in the cache, it is returned immediately, resulting in significantly faster response times. If the data is not in the cache, it is fetched from the external API and then stored in the cache for future requests.

### Performance Metrics

- **Non-Caching**: Average response time for fetching country data: ~500ms (depending on network and API response time).
- **Caching**: Average response time for fetching country data: ~50ms (depending on Redis performance).

The caching mechanism can improve response times by an order of magnitude, especially for frequently requested data.

## Conclusion

Using Redis for caching in the Country Comparison API significantly improves performance and reduces the load on external APIs. The provided features and middleware ensure robust logging, error handling, and efficient data fetching.

## How to Run

1. **Clone the repository**:
    ```sh
    git clone https://github.com/palgunatm66/CountryComparisonUsingexpressandRedis.git
    cd CountryComparisonUsingexpressandRedis
    ```

2. **Install dependencies**:
    ```sh
    npm install
    ```

3. **Run the application**:
    - Without Redis:
        ```sh
        npm run dev
        ```
    - With Redis (using Docker Compose):
        ```sh
        docker-compose up
        ```

4. **Pull the Docker image and run the application**:

    - Pull the Docker image:
        ```sh
        docker pull palgunatm66/country-comparison-bonus:1.0.0
        ```
        
    - Create a `docker-compose.yml` file with the following content:
        ```yaml
        version: '3.8'
        services:
          app:
            image: palgunatm66/country-comparison-bonus:1.0.0
            ports:
              - "3000:3000"
            environment:
              - USE_REDIS=true
              - REDIS_HOST=redis
              - REDIS_PORT=6379
            depends_on:
              - redis

          redis:
            image: redis:7.4.0
            ports:
              - "6379:6379"
        ```

    - Run the application with Docker Compose:
        ```sh
        docker-compose up
        ```


5. **Access the API**:
    - Countries: `GET /api/countries`
    - Population: `GET /api/population/:country/:sortorder?/:date?`
    - Top Requested Countries: `GET /api/top-requested-countries`


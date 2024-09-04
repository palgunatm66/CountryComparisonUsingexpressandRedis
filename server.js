'use strict';

const express = require('express');
const populationRoutes = require('./routes/populationRoutes');
const errorHandler = require('./middlewares/errorHandler');
const logger = require('./middlewares/logger');
const { createClient } = require('redis');

const app = express();
const port = 3000;

let redisClient;
if (process.env.USE_REDIS === 'true') {
  console.log('Initializing Redis client...');
  // Create Redis client
  redisClient = createClient({
    url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
  });

  redisClient.on('error', (err) => {
    console.error('Redis error:', err);
  });

  redisClient.on('connect', () => {
    console.log('Connected to Redis');
  });

  redisClient.on('ready', () => {
    console.log('Redis client is ready');
  });

  redisClient.on('end', () => {
    console.log('Redis client connection closed');
  });

  redisClient.on('reconnecting', () => {
    console.log('Redis client reconnecting');
  });

  // Connect the Redis client
  redisClient.connect().catch(console.error);

  // Attach Redis client to request object
  app.use((req, res, next) => {
    if (redisClient) {
      console.log('Attaching Redis client to request');
      req.redisClient = redisClient;
    }
    next();
  });
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Use the logging middleware
app.use(logger);

app.use('/api', populationRoutes);

// Use the custom error handling middleware
app.use(errorHandler);

console.log(`USE_REDIS: ${process.env.USE_REDIS}, REDIS_HOST: ${process.env.REDIS_HOST}, REDIS_PORT: ${process.env.REDIS_PORT}`);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

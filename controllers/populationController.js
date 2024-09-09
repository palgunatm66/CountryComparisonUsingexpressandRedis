'use strict';

const { axiosInstance, breaker } = require('../middlewares/axiosLogger');
const { incrementCount, getTopRequestedCountries } = require('../models/countryRequestCounts');

const getCountries = async (req, res, next) => {
    try {
        const redisClient = req.redisClient;
        console.log('Redis client in getCountries:', !!redisClient);
        const cacheKey = 'countries';

        if (redisClient) {
            const data = await redisClient.get(cacheKey);
            if (data) {
                console.log('Cache hit:', data);
                return res.json(JSON.parse(data));
            }

            console.log('Cache miss, fetching from API');
            try {
                const response = await breaker.fire({
                    method: 'get',
                    url: 'https://d6wn6bmjj722w.population.io:443/1.0/countries'
                });
                const countries = response.data.countries;

                console.log('Fetched countries:', countries);
                await redisClient.setEx(cacheKey, 3600, JSON.stringify(countries)); // Cache for 1 hour

                res.json(countries);
            } catch (apiError) {
                console.error('Error fetching from API, returning fallback data:', apiError);
                const fallbackData = await redisClient.get(cacheKey);
                if (fallbackData) {
                    return res.json(JSON.parse(fallbackData));
                } else {
                    throw new Error('Failed to fetch countries from the API and no fallback data available.');
                }
            }
        } else {
            console.log('Redis client not available, fetching from API');
            const response = await breaker.fire({
                method: 'get',
                url: 'https://d6wn6bmjj722w.population.io:443/1.0/countries'
            });
            res.json(response.data.countries);
        }
    } catch (error) {
        console.error('Error in getCountries:', error);
        if (error.response) {
            error.message = 'Failed to fetch countries from the API.';
            error.status = error.response.status;
        } else if (error.request) {
            error.message = 'The countries API is currently unavailable. Please try again later.';
            error.status = 503;
        } else {
            error.message = 'An unexpected error occurred.';
            error.status = 500;
        }
        next(error);
    }
};

const getPopulation = async (req, res, next) => {
    const { country, sortorder, date } = req.params;
    const countries = country.split(',');

    // Include the request country if available and not 'localhost'
    if (req.country && req.country !== 'localhost' && !countries.includes(req.country)) {
        countries.push(req.country);
    }

    // Validate sortorder
    if (sortorder && !['asc', 'desc'].includes(sortorder)) {
        const error = new Error('Invalid sort order. Use "asc" or "desc".');
        error.status = 400;
        return next(error);
    }

    // Validate date format
    const targetDate = date || new Date().toISOString().split('T')[0];
    if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        const error = new Error('Invalid date format. Use "YYYY-MM-DD".');
        error.status = 400;
        return next(error);
    }

    try {
        const redisClient = req.redisClient;
        console.log('Redis client in getPopulation:', !!redisClient);
        const cacheKey = `${country}:${targetDate}`;

        if (redisClient) {
            const data = await redisClient.get(cacheKey);
            if (data) {
                console.log('Cache hit:', data);
                return res.json(JSON.parse(data));
            }

            console.log('Cache miss, fetching from API');
            const populationPromises = countries.map(async (country) => {
                const url = `https://d6wn6bmjj722w.population.io:443/1.0/population/${country}/${targetDate}`;
                const response = await breaker.fire({
                    method: 'get',
                    url: url
                });
                return { country, date: targetDate, population: response.data.total_population.population };
            });

            let populations = await Promise.all(populationPromises);

            if (sortorder === 'asc') {
                populations.sort((a, b) => a.population - b.population);
            } else if (sortorder === 'desc') {
                populations.sort((a, b) => b.population - a.population);
            }

            console.log('Fetched populations:', populations);
            await redisClient.setEx(cacheKey, 3600, JSON.stringify(populations)); // Cache for 1 hour

            // Log the country requests
            for (const country of countries) {
                incrementCount(country);
            }

            res.json(populations);
        } else {
            console.log('Redis client not available, fetching from API');
            const populationPromises = countries.map(async (country) => {
                const url = `https://d6wn6bmjj722w.population.io:443/1.0/population/${country}/${targetDate}`;
                const response = await breaker.fire({
                    method: 'get',
                    url: url
                });
                return { country, date: targetDate, population: response.data.total_population.population };
            });

            let populations = await Promise.all(populationPromises);

            if (sortorder === 'asc') {
                populations.sort((a, b) => a.population - b.population);
            } else if (sortorder === 'desc') {
                populations.sort((a, b) => b.population - a.population);
            }

            console.log('Fetched populations:', populations);

            // Log the country requests
            for (const country of countries) {
                incrementCount(country);
            }

            res.json(populations);
        }
    } catch (error) {
        console.error('Error in getPopulation:', error);
        if (error.response) {
            if (error.response.status === 404) {
                error.message = 'One or more country names are misspelled or not found.';
                error.status = 404;
            }
        } else if (error.request) {
            error.message = 'The population API is currently unavailable. Please try again later.';
            error.status = 503;
        } else {
            error.message = 'An unexpected error occurred.';
            error.status = 500;
        }
        next(error);
    }
};

const getTopRequestedCountriesHandler = async (req, res, next) => {
    try {
        const topCountries = getTopRequestedCountries();
        res.json(topCountries);
    } catch (error) {
        console.error('Error in getTopRequestedCountries:', error);
        error.message = 'Failed to fetch top requested countries.';
        error.status = 500;
        next(error);
    }
};

module.exports = {
    getCountries,
    getPopulation,
    getTopRequestedCountries: getTopRequestedCountriesHandler
};

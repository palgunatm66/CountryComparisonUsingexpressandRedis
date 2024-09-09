'use strict';

const express = require('express');
const router = express.Router();
const {getCountries, getPopulation, getTopRequestedCountries} = require('../controllers/populationController');

router.get('/countries', getCountries);

router.get('/population/:country/:sortorder?/:date?', getPopulation);

router.get('/top-requested-countries', getTopRequestedCountries);

module.exports = router;
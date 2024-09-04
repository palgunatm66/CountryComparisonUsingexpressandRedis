'use strict';

const express = require('express');
const router = express.Router();
const {getCountries, getPopulation} = require('../controllers/populationController');

router.get('/countries', getCountries);

router.get('/population/:country/:sortorder?/:date?', getPopulation);

module.exports = router;
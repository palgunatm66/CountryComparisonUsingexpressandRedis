const ipinfo = require('ipinfo');

const logger = (req, res, next) => {
    console.log(`Request Method: ${req.method}`);
    console.log(`Request URL: ${req.originalUrl}`);
    console.log(`Request IP: ${req.ip}`);
    console.log(`Request Headers: ${JSON.stringify(req.headers)}`);
    console.log(`Query Parameters: ${JSON.stringify(req.query)}`);
    if (req.body) {
        console.log(`Request Body: ${JSON.stringify(req.body)}`);
    }

    if (req.ip === '127.0.0.1' || req.ip === '::1') {
        req.country = 'localhost';
        next();
    } else {
        ipinfo(req.ip, (err, cLoc) => {
            if (err) {
                console.error('Error fetching IP info:', err);
            } else {
                req.country = cLoc.country;
                console.log(`Request Country: ${cLoc.country}`);
            }
            next();
        });
    }
};

module.exports = logger;
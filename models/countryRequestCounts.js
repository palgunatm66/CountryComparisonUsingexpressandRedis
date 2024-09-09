const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'countryRequestCounts.json');

// Initialize the file with an empty object if it doesn't exist
if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify({}));
}

const readCounts = () => {
    const data = fs.readFileSync(filePath);
    return JSON.parse(data);
};

const writeCounts = (counts) => {
    fs.writeFileSync(filePath, JSON.stringify(counts, null, 2));
};

const incrementCount = (country) => {
    const counts = readCounts();
    if (counts[country]) {
        counts[country] += 1;
    } else {
        counts[country] = 1;
    }
    writeCounts(counts);
};

const getTopRequestedCountries = (limit = 10) => {
    const counts = readCounts();
    return Object.entries(counts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, limit)
        .map(([country, count]) => ({ country, count }));
};

module.exports = {
    incrementCount,
    getTopRequestedCountries
};
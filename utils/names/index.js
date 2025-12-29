/**
 * Export GivenNames class with a default instance pre-loaded with
 * German-speaking and neighboring countries
 */

const GivenNames = require('./GivenNames');

// Default countries for German Ortsfamilienbuch analysis
const DEFAULT_COUNTRIES = [
    'Germany',
    'Austria',
    'Swiss',
    'Hungary',
    'Belgium',
    'Denmark',
    'Luxembourg',
    'Netherlands',
    'EastFrisia',
    'Poland',
    'CzechRepublic'
];

/**
 * Create a default GivenNames instance with German-speaking and neighboring countries
 * @returns {GivenNames} Pre-configured GivenNames instance
 */
function createDefaultGivenNames() {
    return new GivenNames(DEFAULT_COUNTRIES);
}

module.exports = {
    GivenNames,
    createDefaultGivenNames,
    DEFAULT_COUNTRIES
};

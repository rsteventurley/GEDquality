/**
 * GivenNames - Check given names for gender for a given country
 * As a by-product, it also checks if a given name is a common one for that country.
 *
 * Adapted from Python implementation by Steve Turley
 * Original data from J�rg MICHAEL
 *
 * @author Steve Turley
 * @version 1.0.0
 */

const fs = require('fs');
const path = require('path');

/**
 * Gender Codes:
 * - 'M':  male first name
 * - '1M': male name, if first part of name; else: mostly male name
 * - '?M': mostly male name (= unisex name, which is mostly male)
 * - 'F':  female first name
 * - '1F': female name, if first part of name; else: mostly female name
 * - '?F': mostly female name (= unisex name, which is mostly female)
 * - '?':  unisex name (= can be male or female)
 * - '':   not a common name in this country
 */

class GivenNames {
    /**
     * Initialize GivenNames data structures with specialization for specific countries.
     *
     * The following countries are recognized: GreatBritain, Ireland, USA,
     * Italy, Malta, Portugal, Spain, France, Belgium, Luxembourg, Netherlands,
     * EastFrisia, Germany, Austria, Swiss, Iceland, Denmark, Norway, Sweden,
     * Finland, Estonia, Latvia, Lithuania, Poland, CzechRepublic, Slovakia, Hungary
     *
     * @param {Array<string>} countries - Array of country names to load
     */
    constructor(countries) {
        this.names = {};

        // Load data for each country
        for (const country of countries) {
            this._loadCountry(country);
        }
    }

    /**
     * Load name data for a specific country
     * @param {string} country - The country name
     * @private
     */
    _loadCountry(country) {
        const dataPath = path.join(__dirname, 'data', `${country}.json`);

        try {
            if (fs.existsSync(dataPath)) {
                const data = fs.readFileSync(dataPath, 'utf8');
                const countryNames = JSON.parse(data);

                // Merge with existing names
                Object.assign(this.names, countryNames);
            } else {
                console.warn(`Warning: Name data file not found for ${country}: ${dataPath}`);
            }
        } catch (error) {
            console.error(`Error loading name data for ${country}: ${error.message}`);
        }
    }

    /**
     * Return a gender code for the given name
     *
     * @param {string} name - The given name to check
     * @returns {string} Gender code (M, 1M, ?M, F, 1F, ?F, ?, or empty string)
     */
    gender(name) {
        if (!name) return '';

        // Check if name exists in the dictionary
        if (this.names.hasOwnProperty(name)) {
            return this.names[name];
        }

        return ''; // Not a common name in this country
    }

    /**
     * Check if a name is male (including mostly male)
     * @param {string} name - The given name to check
     * @returns {boolean} True if the name is male or mostly male
     */
    isMale(name) {
        const genderCode = this.gender(name);
        return genderCode === 'M' || genderCode === '1M' || genderCode === '?M';
    }

    /**
     * Check if a name is female (including mostly female)
     * @param {string} name - The given name to check
     * @returns {boolean} True if the name is female or mostly female
     */
    isFemale(name) {
        const genderCode = this.gender(name);
        return genderCode === 'F' || genderCode === '1F' || genderCode === '?F';
    }

    /**
     * Check if a name is unisex
     * @param {string} name - The given name to check
     * @returns {boolean} True if the name is unisex
     */
    isUnisex(name) {
        const genderCode = this.gender(name);
        return genderCode === '?';
    }

    /**
     * Check if a name is common (exists in the database)
     * @param {string} name - The given name to check
     * @returns {boolean} True if the name is common in the loaded countries
     */
    isCommon(name) {
        return this.gender(name) !== '';
    }

    /**
     * Get the expected gender (M or F) from the gender code
     * @param {string} name - The given name to check
     * @returns {string} 'M', 'F', or '' if unknown or unisex
     */
    getExpectedGender(name) {
        const genderCode = this.gender(name);

        if (!genderCode || genderCode === '?') return '';

        // Extract the primary gender from the code
        if (genderCode.includes('M')) return 'M';
        if (genderCode.includes('F')) return 'F';

        return '';
    }

    /**
     * Check if the given name matches the expected gender
     * @param {string} name - The given name to check
     * @param {string} gender - The gender from GEDCOM ('M' or 'F')
     * @returns {boolean|null} True if matches, false if mismatch, null if unknown/unisex
     */
    matchesGender(name, gender) {
        if (!name || !gender) return null;

        const genderCode = this.gender(name);

        // Name not in database or is purely unisex
        if (!genderCode || genderCode === '?') return null;

        const expectedGender = this.getExpectedGender(name);

        // If we can't determine expected gender, return null
        if (!expectedGender) return null;

        return expectedGender === gender;
    }

    /**
     * Get the total number of names loaded
     * @returns {number} The number of names in the database
     */
    getNameCount() {
        return Object.keys(this.names).length;
    }
}

module.exports = GivenNames;

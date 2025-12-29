/**
 * Parse nam_dict.txt to generate Germany.json
 * This is a utility script to convert the nam_dict.txt file to JSON format
 *
 * Run this script once to generate the Germany.json file:
 * node parseNames.js
 */

const fs = require('fs');
const path = require('path');

// Country positions in the data file (0-indexed from start of frequency data)
const COUNTRIES = {
    'GreatBritain': 30,
    'Ireland': 31,
    'USA': 32,
    'Italy': 33,
    'Malta': 34,
    'Portugal': 35,
    'Spain': 36,
    'France': 37,
    'Belgium': 38,
    'Luxembourg': 39,
    'Netherlands': 40,
    'EastFrisia': 41,
    'Germany': 42,
    'Austria': 43,
    'Swiss': 44,
    'Iceland': 45,
    'Denmark': 46,
    'Norway': 47,
    'Sweden': 48,
    'Finland': 49,
    'Estonia': 50,
    'Latvia': 51,
    'Lithuania': 52,
    'Poland': 53,
    'CzechRepublic': 54,
    'Slovakia': 55,
    'Hungary': 56
};

/**
 * Parse a line from nam_dict.txt
 * Format: GCODE NAME[25 chars] SORTPLUS FREQUENCIES[26 chars]
 * @param {string} line - The line to parse
 * @param {string} country - The country to extract frequency for
 * @returns {Object|null} - {name, gcode} or null if not common in country
 */
function parseLine(line, country) {
    if (!line || line[0] === '#' || line.trim() === '') {
        return null;
    }

    // Extract fields
    const gcode = line.substring(0, 2).trim();
    const name = line.substring(3, 28).trim();
    const sortplus = line[29];
    const freq = line[COUNTRIES[country]];

    // Only include if frequency is set (not space) and sortplus is not '+'
    if (freq && freq !== ' ' && sortplus !== '+') {
        return { name, gcode };
    }

    return null;
}

/**
 * Parse the nam_dict.txt file for a specific country
 * @param {string} country - The country name
 * @returns {Object} - Dictionary of {name: gcode}
 */
function parseCountry(country) {
    const names = {};
    const filePath = path.join(__dirname, 'nam_dict.txt');

    try {
        // Read file with Latin-1 encoding (ISO-8859-1)
        const content = fs.readFileSync(filePath, 'latin1');
        const lines = content.split('\n');

        for (const line of lines) {
            const parsed = parseLine(line, country);
            if (parsed) {
                names[parsed.name] = parsed.gcode;
            }
        }

        return names;
    } catch (error) {
        console.error(`Error parsing file: ${error.message}`);
        throw error;
    }
}

// Main execution
if (require.main === module) {
    console.log('Parsing nam_dict.txt for German-speaking and neighboring countries...\n');

    // Parse for all relevant countries
    const countries = ['Germany', 'Austria', 'Swiss', 'Hungary', 'Belgium', 'Denmark', 'Luxembourg', 'Netherlands', 'EastFrisia', 'Poland', 'CzechRepublic'];

    for (const country of countries) {
        console.log(`Parsing ${country}...`);
        const names = parseCountry(country);
        console.log(`  Found ${Object.keys(names).length} names`);

        // Write to JSON file
        const outputPath = path.join(__dirname, 'data', `${country}.json`);
        fs.writeFileSync(outputPath, JSON.stringify(names, null, 2));
        console.log(`  Written to ${outputPath}`);
    }

    // Show some examples from Germany
    console.log('\nExamples from Germany:');
    const germanyNames = parseCountry('Germany');
    const examples = ['Otto', 'Anna', 'Johann', 'Maria', 'Heinrich', 'Elisabeth'];
    for (const name of examples) {
        if (germanyNames[name]) {
            console.log(`  ${name}: ${germanyNames[name]}`);
        }
    }
}

module.exports = { parseCountry, parseLine };

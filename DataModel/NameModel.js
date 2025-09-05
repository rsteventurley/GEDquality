/**
 * NameModel - A class for handling genealogical names
 * Contains givenName and surname properties for representing personal names
 * 
 * @author Steve Turley
 * @version 1.0.0
 */

class NameModel {
    /**
     * Create a new NameModel
     * @param {string} [givenName] - Optional given name (first name)
     * @param {string} [surname] - Optional surname (last name)
     */
    constructor(givenName, surname) {
        this.givenName = givenName || '';
        this.surname = surname || '';
    }

    /**
     * Get a string representation of the name
     * @returns {string} Given name followed by a space and surname
     */
    toString() {
        if (this.givenName === '' && this.surname === '') {
            return '';
        }
        
        if (this.givenName === '') {
            return this.surname;
        }
        
        if (this.surname === '') {
            return this.givenName;
        }
        
        return `${this.givenName} ${this.surname}`;
    }

    /**
     * Check if this NameModel is empty (has default initialization values)
     * @returns {boolean} True if both givenName and surname are empty
     */
    isEmpty() {
        return this.givenName === '' && this.surname === '';
    }

    /**
     * Check if this name is valid (has at least one name component)
     * @returns {boolean} True if the name has at least a given name or surname
     */
    isValid() {
        return this.givenName !== '' || this.surname !== '';
    }

    /**
     * Set the given name
     * @param {string} givenName - The given name to set
     */
    setGivenName(givenName) {
        this.givenName = givenName || '';
    }

    /**
     * Set the surname
     * @param {string} surname - The surname to set
     */
    setSurname(surname) {
        this.surname = surname || '';
    }

    /**
     * Get the given name
     * @returns {string} The given name
     */
    getGivenName() {
        return this.givenName;
    }

    /**
     * Get the surname
     * @returns {string} The surname
     */
    getSurname() {
        return this.surname;
    }

    /**
     * Create a copy of this NameModel
     * @returns {NameModel} A new NameModel instance with the same data
     */
    clone() {
        return new NameModel(this.givenName, this.surname);
    }

    /**
     * Get the full name in "surname, givenName" format (commonly used in genealogy)
     * @returns {string} Surname followed by comma and given name
     */
    toGenealogicalFormat() {
        if (this.givenName === '' && this.surname === '') {
            return '';
        }
        
        if (this.givenName === '') {
            return this.surname;
        }
        
        if (this.surname === '') {
            return this.givenName;
        }
        
        return `${this.surname}, ${this.givenName}`;
    }

    /**
     * Get initials from the name
     * @returns {string} Initials of given name and surname
     */
    getInitials() {
        let initials = '';
        
        if (this.givenName !== '') {
            initials += this.givenName.charAt(0).toUpperCase();
        }
        
        if (this.surname !== '') {
            initials += this.surname.charAt(0).toUpperCase();
        }
        
        return initials;
    }

    /**
     * Check if this name exactly matches another name
     * @param {NameModel} otherName - The other NameModel to compare against
     * @returns {boolean} True if both given name and surname match exactly (case-insensitive)
     */
    exactMatch(otherName) {
        if (!otherName || !(otherName instanceof NameModel)) {
            return false;
        }

        return this.givenName.toLowerCase() === otherName.givenName.toLowerCase() &&
               this.surname.toLowerCase() === otherName.surname.toLowerCase();
    }

    /**
     * Check if this name is similar to another name using phonetic matching
     * @param {NameModel} otherName - The other NameModel to compare against
     * @returns {boolean} True if the names sound similar using Soundex algorithm
     */
    similarMatch(otherName) {
        if (!otherName || !(otherName instanceof NameModel)) {
            return false;
        }

        // If names match exactly, they are similar
        if (this.exactMatch(otherName)) {
            return true;
        }

        // Enhanced similarity checks
        const givenMatch = this._namesAreSimilar(this.givenName, otherName.givenName);
        const surnameMatch = this._namesAreSimilar(this.surname, otherName.surname);

        // Names are similar if both components are similar
        return givenMatch && surnameMatch;
    }

    /**
     * Generate Soundex code for a string
     * @param {string} str - The string to generate Soundex for
     * @returns {string} Four-character Soundex code
     * @private
     */
    _getSoundex(str) {
        if (!str || typeof str !== 'string') {
            return '0000';
        }

        // Convert to uppercase and remove non-alphabetic characters
        str = str.toUpperCase().replace(/[^A-Z]/g, '');
        
        if (str.length === 0) {
            return '0000';
        }

        // Keep the first letter
        let soundex = str.charAt(0);
        
        // Soundex mapping
        const mapping = {
            'B': '1', 'F': '1', 'P': '1', 'V': '1',
            'C': '2', 'G': '2', 'J': '2', 'K': '2', 'Q': '2', 'S': '2', 'X': '2', 'Z': '2',
            'D': '3', 'T': '3',
            'L': '4',
            'M': '5', 'N': '5',
            'R': '6'
        };

        let previousCode = mapping[soundex] || '';

        // Process remaining characters
        for (let i = 1; i < str.length && soundex.length < 4; i++) {
            const char = str.charAt(i);
            const code = mapping[char];

            if (code && code !== previousCode) {
                soundex += code;
                previousCode = code;
            } else if (!code) {
                // Vowels, H, W, Y reset the previous code
                previousCode = '';
            }
        }

        // Pad with zeros if necessary
        return soundex.padEnd(4, '0');
    }

    /**
     * Check if two names are common variations of each other
     * @param {string} name1 - First name to compare
     * @param {string} name2 - Second name to compare
     * @returns {boolean} True if names are known variations
     * @private
     */
    _areNameVariations(name1, name2) {
        if (!name1 || !name2) return false;
        
        const n1 = name1.toLowerCase();
        const n2 = name2.toLowerCase();
        
        // Common name variations that might have different Soundex codes
        const variations = [
            ['catherine', 'katherine', 'kathryn', 'katharine'],
            ['christopher', 'kristopher'],
            ['christian', 'kristian'],
            ['carol', 'karol'],
            ['claire', 'klaire'],
            ['philip', 'phillip'],
            ['jeffrey', 'geoffrey'],
            ['stephen', 'steven'],
            ['ann', 'anne'],
            ['john', 'jon'],
            ['michael', 'micheal'],
            ['william', 'willem']
        ];

        // Check if both names are in the same variation group
        for (const group of variations) {
            if (group.includes(n1) && group.includes(n2)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Enhanced name similarity check that handles abbreviations, minor variations, and soundex
     * @param {string} name1 - First name to compare
     * @param {string} name2 - Second name to compare
     * @returns {boolean} True if names are similar
     * @private
     */
    _namesAreSimilar(name1, name2) {
        if (!name1 || !name2) return false;
        
        const n1 = name1.toLowerCase().trim();
        const n2 = name2.toLowerCase().trim();
        
        // Exact match
        if (n1 === n2) {
            return true;
        }
        
        // Handle abbreviations (e.g., "A." matches "Anna", "Katharina", etc.)
        if (this._isAbbreviationMatch(n1, n2)) {
            return true;
        }
        
        // Check for known name variations
        if (this._areNameVariations(n1, n2)) {
            return true;
        }
        
        // Check for minor spelling differences (1-2 character difference)
        if (this._isMinorSpellingVariation(n1, n2)) {
            return true;
        }
        
        // Soundex comparison as fallback
        const soundex1 = this._getSoundex(n1);
        const soundex2 = this._getSoundex(n2);
        
        return soundex1 === soundex2 && soundex1 !== '0000';
    }

    /**
     * Check if one name is an abbreviation of another
     * @param {string} name1 - First name to compare
     * @param {string} name2 - Second name to compare
     * @returns {boolean} True if one is an abbreviation of the other
     * @private
     */
    _isAbbreviationMatch(name1, name2) {
        // Handle single letter abbreviations like "A." matching full names starting with "A"
        const abbrevPattern = /^[a-z]\.?$/;
        
        if (abbrevPattern.test(name1) && name2.length > 1) {
            const initial = name1.charAt(0);
            return name2.charAt(0) === initial;
        }
        
        if (abbrevPattern.test(name2) && name1.length > 1) {
            const initial = name2.charAt(0);
            return name1.charAt(0) === initial;
        }
        
        // Handle multi-word names where one is abbreviated
        const words1 = name1.split(/\s+/);
        const words2 = name2.split(/\s+/);
        
        // Special case: "A. Katharina" vs "Kathrarina" (common pattern)
        // Check if first word is abbreviation and second word is similar
        if (words1.length === 2 && words2.length === 1) {
            const firstWord = words1[0];
            const secondWord = words1[1];
            const singleWord = words2[0];
            
            if (abbrevPattern.test(firstWord)) {
                // Check if the second word is similar to the single word (handles typos)
                return this._isMinorSpellingVariation(secondWord, singleWord) || 
                       secondWord.toLowerCase() === singleWord.toLowerCase();
            }
        }
        
        if (words2.length === 2 && words1.length === 1) {
            const firstWord = words2[0];
            const secondWord = words2[1];
            const singleWord = words1[0];
            
            if (abbrevPattern.test(firstWord)) {
                // Check if the second word is similar to the single word (handles typos)
                return this._isMinorSpellingVariation(secondWord, singleWord) || 
                       secondWord.toLowerCase() === singleWord.toLowerCase();
            }
        }
        
        // If different number of words, check if abbreviations match
        if (words1.length !== words2.length) {
            // Check if shorter name is abbreviation of longer
            const shorter = words1.length < words2.length ? words1 : words2;
            const longer = words1.length < words2.length ? words2 : words1;
            
            if (shorter.length === 1 && abbrevPattern.test(shorter[0])) {
                return longer.some(word => word.charAt(0) === shorter[0].charAt(0));
            }
        }
        
        return false;
    }

    /**
     * Check if two names are minor spelling variations of each other
     * @param {string} name1 - First name to compare
     * @param {string} name2 - Second name to compare
     * @returns {boolean} True if names are minor variations
     * @private
     */
    _isMinorSpellingVariation(name1, name2) {
        // Don't compare very short names or very different lengths
        if (name1.length < 3 || name2.length < 3) {
            return false;
        }
        
        const lengthDiff = Math.abs(name1.length - name2.length);
        if (lengthDiff > 2) {
            return false;
        }
        
        // Calculate Levenshtein distance
        const distance = this._levenshteinDistance(name1, name2);
        
        // Allow 1-2 character differences for names longer than 4 characters
        const maxDistance = name1.length > 6 ? 2 : 1;
        
        return distance <= maxDistance;
    }

    /**
     * Calculate Levenshtein distance between two strings
     * @param {string} str1 - First string
     * @param {string} str2 - Second string
     * @returns {number} Levenshtein distance
     * @private
     */
    _levenshteinDistance(str1, str2) {
        const matrix = [];
        
        // Create matrix
        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }
        
        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }
        
        // Fill matrix
        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1, // substitution
                        matrix[i][j - 1] + 1,     // insertion
                        matrix[i - 1][j] + 1      // deletion
                    );
                }
            }
        }
        
        return matrix[str2.length][str1.length];
    }
}

module.exports = NameModel;

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

        // Compare using Soundex algorithm
        const thisSoundex = this._getSoundex(this.givenName + ' ' + this.surname);
        const otherSoundex = this._getSoundex(otherName.givenName + ' ' + otherName.surname);

        // Also compare individual components
        const thisGivenSoundex = this._getSoundex(this.givenName);
        const thisSurnameSoundex = this._getSoundex(this.surname);
        const otherGivenSoundex = this._getSoundex(otherName.givenName);
        const otherSurnameSoundex = this._getSoundex(otherName.surname);

        // Names are similar if:
        // 1. Both given names and surnames have same soundex respectively, or
        // 2. Both given names AND surnames are variations (not just one or the other)
        // Note: Removed full name soundex comparison as it can be unreliable for different surnames
        return (thisGivenSoundex === otherGivenSoundex && thisSurnameSoundex === otherSurnameSoundex) ||
               (this._areNameVariations(this.givenName, otherName.givenName) && 
                this._areNameVariations(this.surname, otherName.surname));
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
}

module.exports = NameModel;

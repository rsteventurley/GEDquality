/**
 * XmlName - A class for representing XML name information
 * Contains original, given, and surname from XML name elements
 * 
 * @author Steve Turley
 * @version 1.0.0
 */

class XmlName {
    /**
     * Create a new XmlName
     * @param {string} [orig] - Original name string
     * @param {string} [given] - Given name(s)
     * @param {string} [surname] - Surname
     */
    constructor(orig = '', given = '', surname = '') {
        this.orig = orig;
        this.given = given;
        this.surname = surname;
    }

    /**
     * Get the original name string
     * @returns {string} Original name format
     */
    getOriginal() {
        return this.orig;
    }

    /**
     * Get the given name(s)
     * @returns {string} Given name(s)
     */
    getGiven() {
        return this.given;
    }

    /**
     * Get the surname
     * @returns {string} Surname
     */
    getSurname() {
        return this.surname;
    }

    /**
     * Check if this name is empty
     * @returns {boolean} True if all fields are empty
     */
    isEmpty() {
        return !this.orig && !this.given && !this.surname;
    }

    /**
     * Convert to string representation
     * @returns {string} String representation of the name
     */
    toString() {
        if (this.isEmpty()) {
            return '<Empty Name>';
        }
        
        if (this.given && this.surname) {
            return `${this.given} ${this.surname}`;
        }
        
        return this.orig || this.given || this.surname || '<Empty Name>';
    }

    /**
     * Create a copy of this XmlName
     * @returns {XmlName} A new XmlName instance with the same data
     */
    clone() {
        return new XmlName(this.orig, this.given, this.surname);
    }
}

module.exports = XmlName;

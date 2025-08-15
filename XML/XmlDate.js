/**
 * XmlDate - A class for representing XML date information
 * Contains original and standardized date formats from XML
 * 
 * @author Steve Turley
 * @version 1.0.0
 */

class XmlDate {
    /**
     * Create a new XmlDate
     * @param {string} [orig] - Original date string (e.g., "10.9.1802")
     * @param {string} [std] - Standardized date string (e.g., "18020910")
     */
    constructor(orig = '', std = '') {
        this.orig = orig;
        this.std = std;
    }

    /**
     * Get the original date string
     * @returns {string} Original date format
     */
    getOriginal() {
        return this.orig;
    }

    /**
     * Get the standardized date string
     * @returns {string} Standardized date format
     */
    getStandardized() {
        return this.std;
    }

    /**
     * Check if this date is empty
     * @returns {boolean} True if both orig and std are empty
     */
    isEmpty() {
        return !this.orig && !this.std;
    }

    /**
     * Convert to string representation
     * @returns {string} String representation of the date
     */
    toString() {
        if (this.isEmpty()) {
            return '<Empty Date>';
        }
        return this.orig || this.std || '<Empty Date>';
    }

    /**
     * Create a copy of this XmlDate
     * @returns {XmlDate} A new XmlDate instance with the same data
     */
    clone() {
        return new XmlDate(this.orig, this.std);
    }
}

module.exports = XmlDate;

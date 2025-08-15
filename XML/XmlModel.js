/**
 * XmlModel - A class for representing the complete XML data model
 * Contains all entries from an XML genealogical file
 * 
 * @author Steve Turley
 * @version 1.0.0
 */

const XmlEntry = require('./XmlEntry');

class XmlModel {
    /**
     * Create a new XmlModel
     * @param {Array<XmlEntry>} [xmlEntries] - Array of XmlEntry objects
     */
    constructor(xmlEntries = []) {
        this.xmlEntries = xmlEntries.map(entry => entry.clone());
    }

    /**
     * Get all XML entries
     * @returns {Array<XmlEntry>} Array of XmlEntry objects
     */
    getXmlEntries() {
        return this.xmlEntries.map(entry => entry.clone());
    }

    /**
     * Get all entries (alias for getXmlEntries for API consistency)
     * @returns {Array<XmlEntry>} Array of XmlEntry objects
     */
    get entries() {
        return this.xmlEntries;
    }

    /**
     * Add an XML entry
     * @param {XmlEntry} entry - XmlEntry to add
     */
    addXmlEntry(entry) {
        if (entry instanceof XmlEntry) {
            this.xmlEntries.push(entry.clone());
        }
    }

    /**
     * Get an XML entry by ID
     * @param {string} entryId - Entry ID to find
     * @returns {XmlEntry|null} XmlEntry if found, null otherwise
     */
    getXmlEntryById(entryId) {
        const entry = this.xmlEntries.find(e => e.getId() === entryId);
        return entry ? entry.clone() : null;
    }

    /**
     * Get XML entries by surname
     * @param {string} surname - Surname to find
     * @returns {Array<XmlEntry>} Array of matching XmlEntry objects
     */
    getXmlEntriesBySurname(surname) {
        return this.xmlEntries
            .filter(e => e.getSurname().toLowerCase() === surname.toLowerCase())
            .map(entry => entry.clone());
    }

    /**
     * Get number of entries
     * @returns {number} Number of entries
     */
    getEntryCount() {
        return this.xmlEntries.length;
    }

    /**
     * Get total number of people across all entries
     * @returns {number} Total number of people
     */
    getTotalPeopleCount() {
        return this.xmlEntries.reduce((total, entry) => total + entry.getPeopleCount(), 0);
    }

    /**
     * Get total number of families across all entries
     * @returns {number} Total number of families
     */
    getTotalFamiliesCount() {
        return this.xmlEntries.reduce((total, entry) => total + entry.getFamiliesCount(), 0);
    }

    /**
     * Check if this model is empty
     * @returns {boolean} True if no entries exist
     */
    isEmpty() {
        return this.xmlEntries.length === 0;
    }

    /**
     * Convert to string representation
     * @returns {string} String representation of the model
     */
    toString() {
        if (this.isEmpty()) {
            return '<Empty XmlModel>';
        }

        return `XmlModel: ${this.xmlEntries.length} entries, ${this.getTotalPeopleCount()} people, ${this.getTotalFamiliesCount()} families`;
    }

    /**
     * Create a copy of this XmlModel
     * @returns {XmlModel} A new XmlModel instance with the same data
     */
    clone() {
        return new XmlModel(this.xmlEntries);
    }
}

module.exports = XmlModel;

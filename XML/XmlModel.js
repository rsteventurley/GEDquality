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

    /**
     * Convert this XmlModel to a PageModel
     * @returns {PageModel} A new PageModel instance created from this XmlModel
     */
    toPageModel() {
        const PageModel = require('../DataModel/PageModel');
        const EntryModel = require('../DataModel/EntryModel');
        const FamilyModel = require('../DataModel/FamilyModel');
        const EventModel = require('../DataModel/EventModel');
        
        const pageModel = new PageModel();
        
        // Process each XML entry
        for (const xmlEntry of this.xmlEntries) {
            const entryModel = new EntryModel(xmlEntry.getId());
            
            // Add people from the XML entry
            for (const xmlPerson of xmlEntry.getPeople()) {
                // Convert XmlPerson to PersonModel using the existing toPersonModel method
                const personModel = xmlPerson.toPersonModel();
                
                // Generate a unique person ID (using a simple counter approach)
                let personId = 1;
                while (entryModel.people[personId]) {
                    personId++;
                }
                
                // Add the person to the entry
                entryModel.addPerson(personId, xmlPerson.getId(), personModel);
            }
            
            // Add families from the XML entry
            for (const xmlFamily of xmlEntry.getFamilies()) {
                // Convert XmlFamily to FamilyModel
                const familyModel = this.xmlFamilyToFamilyModel(xmlFamily, entryModel);
                
                // Generate a unique family ID
                let familyId = 1;
                while (entryModel.families[familyId]) {
                    familyId++;
                }
                
                // Add the family to the entry
                entryModel.families[familyId] = familyModel;
            }
            
            // Add the entry to the page model
            pageModel.addEntry(entryModel);
        }
        
        return pageModel;
    }

    /**
     * Helper method to convert XmlFamily to FamilyModel
     * @param {XmlFamily} xmlFamily - The XmlFamily to convert
     * @param {EntryModel} entryModel - The EntryModel for person ID lookup
     * @returns {FamilyModel} A new FamilyModel instance
     */
    xmlFamilyToFamilyModel(xmlFamily, entryModel) {
        const FamilyModel = require('../DataModel/FamilyModel');
        const EventModel = require('../DataModel/EventModel');
        
        // Look up person IDs from UIDs
        const fatherPersonId = this.findPersonIdByUid(xmlFamily.getFather(), entryModel);
        const motherPersonId = this.findPersonIdByUid(xmlFamily.getMother(), entryModel);
        
        // Convert children UIDs to person IDs
        const childrenIds = [];
        for (const childUid of xmlFamily.getChildren()) {
            const childPersonId = this.findPersonIdByUid(childUid, entryModel);
            if (childPersonId !== null) {
                childrenIds.push(childPersonId);
            }
        }
        
        // Convert marriage event
        const xmlMarriage = xmlFamily.getMarriage();
        const marriageEvent = new EventModel();
        if (xmlMarriage && !xmlMarriage.isEmpty()) {
            const marriageDate = xmlMarriage.getDate();
            if (marriageDate && !marriageDate.isEmpty()) {
                const isoDateString = this.convertXmlDateToISO(marriageDate);
                if (isoDateString) {
                    marriageEvent.setDate(isoDateString);
                }
            }
            const marriagePlace = xmlMarriage.getPlace();
            if (marriagePlace && typeof marriagePlace === 'string' && marriagePlace.trim() !== '') {
                marriageEvent.setPlace(marriagePlace);
            }
        }
        
        return new FamilyModel(fatherPersonId, motherPersonId, childrenIds, marriageEvent);
    }

    /**
     * Helper method to find person ID by UID
     * @param {string} uid - The UID to search for
     * @param {EntryModel} entryModel - The EntryModel to search in
     * @returns {number|null} The person ID if found, null otherwise
     */
    findPersonIdByUid(uid, entryModel) {
        if (!uid) return null;
        
        for (const [personId, personUid] of Object.entries(entryModel.personDict)) {
            if (personUid === uid) {
                return parseInt(personId);
            }
        }
        return null;
    }

    /**
     * Helper method to convert XmlDate to ISO 8601 format (YYYY-MM-DD)
     * @param {XmlDate} xmlDate - The XmlDate object to convert
     * @returns {string|null} ISO formatted date string or null if conversion fails
     */
    convertXmlDateToISO(xmlDate) {
        if (!xmlDate || xmlDate.isEmpty()) {
            return null;
        }

        // Try standardized format first (YYYYMMDD)
        const std = xmlDate.getStandardized();
        if (std && std.length === 8 && /^\d{8}$/.test(std)) {
            const year = parseInt(std.substring(0, 4));
            const month = parseInt(std.substring(4, 6));
            const day = parseInt(std.substring(6, 8));
            
            // Validate date components
            if (this.isValidDateComponents(year, month, day)) {
                const yearStr = year.toString().padStart(4, '0');
                const monthStr = month.toString().padStart(2, '0');
                const dayStr = day.toString().padStart(2, '0');
                return `${yearStr}-${monthStr}-${dayStr}`;
            }
        }

        // Try original format (e.g., "10.9.1802" or similar patterns)
        const orig = xmlDate.getOriginal();
        if (orig) {
            // Handle DD.MM.YYYY format
            const ddmmyyyy = orig.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
            if (ddmmyyyy) {
                const day = parseInt(ddmmyyyy[1]);
                const month = parseInt(ddmmyyyy[2]);
                const year = parseInt(ddmmyyyy[3]);
                
                // Validate date components
                if (this.isValidDateComponents(year, month, day)) {
                    const yearStr = year.toString().padStart(4, '0');
                    const monthStr = month.toString().padStart(2, '0');
                    const dayStr = day.toString().padStart(2, '0');
                    return `${yearStr}-${monthStr}-${dayStr}`;
                }
            }

            // Handle other potential formats as needed
            // Add more patterns here if other date formats are encountered
        }

        return null;
    }

    /**
     * Helper method to validate date components
     * @param {number} year - Year value (allow 0 for unknown)
     * @param {number} month - Month value (0 for unknown, 1-12 for valid)
     * @param {number} day - Day value (0 for unknown, 1-31 for valid)
     * @returns {boolean} True if all components are valid (including 0 for unknown)
     */
    isValidDateComponents(year, month, day) {
        // Check for valid year (0 for unknown, or reasonable range for genealogical data)
        if (year < 0 || (year > 0 && (year < 1000 || year > 9999))) {
            return false;
        }
        
        // Check for valid month (0 for unknown, 1-12 for valid months)
        if (month < 0 || month > 12) {
            return false;
        }
        
        // Check for valid day (0 for unknown, 1-31 for valid days)
        if (day < 0 || day > 31) {
            return false;
        }
        
        // If month and day are both known (non-zero), validate day against month
        if (month > 0 && day > 0) {
            const daysInMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
            if (day > daysInMonth[month - 1]) {
                return false;
            }
            
            // Special February validation (accounting for leap years)
            if (month === 2 && day === 29 && year > 0) {
                const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
                if (!isLeapYear) {
                    return false;
                }
            }
        }
        
        return true;
    }
}

module.exports = XmlModel;

/**
 * XmlEntry - A class for representing XML entry information
 * Contains people and families from XML entry elements
 * 
 * @author Steve Turley
 * @version 1.0.0
 */

const XmlPerson = require('./XmlPerson');
const XmlFamily = require('./XmlFamily');

class XmlEntry {
    /**
     * Create a new XmlEntry
     * @param {string} [id] - Entry ID
     * @param {string} [surname] - Entry surname
     * @param {Array<XmlPerson>} [people] - Array of XmlPerson objects
     * @param {Array<XmlFamily>} [families] - Array of XmlFamily objects
     */
    constructor(id = '', surname = '', people = [], families = []) {
        this.id = id;
        this.surname = surname;
        this.people = people.map(person => person.clone());
        this.families = families.map(family => family.clone());
    }

    /**
     * Get the entry ID
     * @returns {string} Entry ID
     */
    getId() {
        return this.id;
    }

    /**
     * Get the entry surname
     * @returns {string} Entry surname
     */
    getSurname() {
        return this.surname;
    }

    /**
     * Get all people in this entry
     * @returns {Array<XmlPerson>} Array of XmlPerson objects
     */
    getPeople() {
        return this.people.map(person => person.clone());
    }

    /**
     * Get all families in this entry
     * @returns {Array<XmlFamily>} Array of XmlFamily objects
     */
    getFamilies() {
        return this.families.map(family => family.clone());
    }

    /**
     * Set the entry ID
     * @param {string} id - Entry ID
     */
    setId(id) {
        this.id = id || '';
    }

    /**
     * Set the entry surname
     * @param {string} surname - Entry surname
     */
    setSurname(surname) {
        this.surname = surname || '';
    }

    /**
     * Add a person to this entry
     * @param {XmlPerson} person - XmlPerson to add
     */
    addPerson(person) {
        if (person instanceof XmlPerson) {
            this.people.push(person.clone());
        }
    }

    /**
     * Add a family to this entry
     * @param {XmlFamily} family - XmlFamily to add
     */
    addFamily(family) {
        if (family instanceof XmlFamily) {
            this.families.push(family.clone());
        }
    }

    /**
     * Get a person by ID
     * @param {string} personId - Person ID to find
     * @returns {XmlPerson|null} XmlPerson if found, null otherwise
     */
    getPersonById(personId) {
        const person = this.people.find(p => p.getId() === personId);
        return person ? person.clone() : null;
    }

    /**
     * Get number of people in this entry
     * @returns {number} Number of people
     */
    getPeopleCount() {
        return this.people.length;
    }

    /**
     * Get number of families in this entry
     * @returns {number} Number of families
     */
    getFamiliesCount() {
        return this.families.length;
    }

    /**
     * Check if this entry is empty
     * @returns {boolean} True if all fields are empty
     */
    isEmpty() {
        return !this.id && 
               !this.surname && 
               this.people.length === 0 && 
               this.families.length === 0;
    }

    /**
     * Convert to string representation
     * @returns {string} String representation of the entry
     */
    toString() {
        if (this.isEmpty()) {
            return '<Empty Entry>';
        }

        const parts = [];
        if (this.id) {
            parts.push(`ID: ${this.id}`);
        }
        if (this.surname) {
            parts.push(`Surname: ${this.surname}`);
        }
        parts.push(`People: ${this.people.length}`);
        parts.push(`Families: ${this.families.length}`);

        return parts.join(', ');
    }

    /**
     * Create a copy of this XmlEntry
     * @returns {XmlEntry} A new XmlEntry instance with the same data
     */
    clone() {
        return new XmlEntry(
            this.id,
            this.surname,
            this.people,
            this.families
        );
    }
}

module.exports = XmlEntry;

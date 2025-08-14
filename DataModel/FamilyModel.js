/**
 * FamilyModel - A class for handling genealogical families
 * Contains husband, wife, children, and marriage event information
 * 
 * @author Steve Turley
 * @version 1.0.0
 */

const EventModel = require('./EventModel');

class FamilyModel {
    /**
     * Create a new FamilyModel
     * @param {number} [husband] - Optional husband person ID
     * @param {number} [wife] - Optional wife person ID
     * @param {Array<number>} [children] - Optional array of children person IDs
     * @param {EventModel} [marriage] - Optional EventModel for the marriage
     */
    constructor(husband, wife, children, marriage) {
        this.husband = (typeof husband === 'number') ? husband : null;
        this.wife = (typeof wife === 'number') ? wife : null;
        this.children = Array.isArray(children) ? [...children] : [];
        this.marriage = (marriage && typeof marriage.clone === 'function') ? marriage.clone() : new EventModel();
    }

    /**
     * Check if this FamilyModel is empty (has default initialization values)
     * @returns {boolean} True if all attributes are empty
     */
    isEmpty() {
        return this.husband === null && 
               this.wife === null && 
               this.children.length === 0 && 
               this.marriage.isEmpty();
    }

    /**
     * Check if this family is valid (has at least some data)
     * @returns {boolean} True if the family has valid data
     */
    isValid() {
        return this.husband !== null || 
               this.wife !== null || 
               this.children.length > 0 || 
               this.marriage.isValid();
    }

    /**
     * Get a string representation of the family
     * @returns {string} Family summary with husband, wife, children count, and marriage info
     */
    toString() {
        if (this.isEmpty()) {
            return '<Empty Family>';
        }
        
        const parts = [];
        
        if (this.husband !== null) {
            parts.push(`Husband: ${this.husband}`);
        }
        
        if (this.wife !== null) {
            parts.push(`Wife: ${this.wife}`);
        }
        
        if (this.children.length > 0) {
            parts.push(`Children: ${this.children.length} (${this.children.join(', ')})`);
        }
        
        if (this.marriage.isValid()) {
            parts.push(`Married: ${this.marriage.toString()}`);
        }
        
        return parts.length > 0 ? parts.join(', ') : '<Empty Family>';
    }

    /**
     * Set the husband person ID
     * @param {number} husband - The husband person ID
     */
    setHusband(husband) {
        this.husband = (typeof husband === 'number') ? husband : null;
    }

    /**
     * Set the wife person ID
     * @param {number} wife - The wife person ID
     */
    setWife(wife) {
        this.wife = (typeof wife === 'number') ? wife : null;
    }

    /**
     * Set the children array
     * @param {Array<number>} children - Array of children person IDs
     */
    setChildren(children) {
        this.children = Array.isArray(children) ? [...children] : [];
    }

    /**
     * Set the marriage event
     * @param {EventModel} marriage - The EventModel to set for marriage
     */
    setMarriage(marriage) {
        this.marriage = (marriage && typeof marriage.clone === 'function') ? marriage.clone() : new EventModel();
    }

    /**
     * Get the husband person ID
     * @returns {number|null} The husband person ID
     */
    getHusband() {
        return this.husband;
    }

    /**
     * Get the wife person ID
     * @returns {number|null} The wife person ID
     */
    getWife() {
        return this.wife;
    }

    /**
     * Get the children array
     * @returns {Array<number>} Array of children person IDs
     */
    getChildren() {
        return [...this.children];
    }

    /**
     * Get the marriage event
     * @returns {EventModel} The marriage event
     */
    getMarriage() {
        return this.marriage;
    }

    /**
     * Add a child to the children array
     * @param {number} childId - The child person ID to add
     */
    addChild(childId) {
        if (typeof childId === 'number' && !this.children.includes(childId)) {
            this.children.push(childId);
        }
    }

    /**
     * Remove a child from the children array
     * @param {number} childId - The child person ID to remove
     */
    removeChild(childId) {
        const index = this.children.indexOf(childId);
        if (index > -1) {
            this.children.splice(index, 1);
        }
    }

    /**
     * Create a copy of this FamilyModel
     * @returns {FamilyModel} A new FamilyModel instance with the same data
     */
    clone() {
        return new FamilyModel(
            this.husband,
            this.wife,
            this.children,
            this.marriage
        );
    }

    /**
     * Get the marriage date in GEDCOM format
     * @returns {string} Marriage date in GEDCOM format
     */
    getMarriageDateGEDCOM() {
        return this.marriage.getDateGEDCOM();
    }

    /**
     * Get the marriage place
     * @returns {string} Marriage place
     */
    getMarriagePlace() {
        return this.marriage.getPlace();
    }

    /**
     * Get the marriage place with German translations
     * @returns {string} Translated marriage place
     */
    getMarriagePlaceTranslated() {
        return this.marriage.translatePlace();
    }

    /**
     * Check if the family has an exact marriage date
     * @returns {boolean} True if the marriage date is exact
     */
    hasExactMarriageDate() {
        return this.marriage.hasExactDate();
    }

    /**
     * Fill empty place in marriage event if it has an exact date
     * @param {string} place - The place to set for marriage with exact date but no place
     */
    fillMarriage(place) {
        if (!place || typeof place !== 'string') {
            return;
        }
        
        // Check marriage event
        if (this.marriage.isValid() && this.marriage.hasExactDate() && this.marriage.getPlace() === '') {
            this.marriage.setPlace(place);
        }
    }
}

module.exports = FamilyModel;

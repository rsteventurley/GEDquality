/**
 * XmlFamily - A class for representing XML family information
 * Contains father, mother, children, and marriage information from XML family elements
 * 
 * @author Steve Turley
 * @version 1.0.0
 */

const XmlEvent = require('./XmlEvent');

class XmlFamily {
    /**
     * Create a new XmlFamily
     * @param {string} [father] - Father person ID
     * @param {string} [mother] - Mother person ID
     * @param {Array<string>} [children] - Array of child person IDs
     * @param {XmlEvent} [marriage] - Marriage event
     */
    constructor(father = '', mother = '', children = [], marriage = null) {
        this.father = father;
        this.mother = mother;
        this.children = [...children];
        this.marriage = marriage ? marriage.clone() : new XmlEvent('marriage');
    }

    /**
     * Get the father person ID
     * @returns {string} Father person ID
     */
    getFather() {
        return this.father;
    }

    /**
     * Get the mother person ID
     * @returns {string} Mother person ID
     */
    getMother() {
        return this.mother;
    }

    /**
     * Get the children person IDs
     * @returns {Array<string>} Array of child person IDs
     */
    getChildren() {
        return [...this.children];
    }

    /**
     * Get the marriage event
     * @returns {XmlEvent} Marriage event
     */
    getMarriage() {
        return this.marriage;
    }

    /**
     * Set the father person ID
     * @param {string} father - Father person ID
     */
    setFather(father) {
        this.father = father || '';
    }

    /**
     * Set the mother person ID
     * @param {string} mother - Mother person ID
     */
    setMother(mother) {
        this.mother = mother || '';
    }

    /**
     * Set the children person IDs
     * @param {Array<string>} children - Array of child person IDs
     */
    setChildren(children) {
        this.children = children ? [...children] : [];
    }

    /**
     * Set the marriage event
     * @param {XmlEvent} marriage - Marriage event
     */
    setMarriage(marriage) {
        this.marriage = marriage ? marriage.clone() : new XmlEvent('marriage');
    }

    /**
     * Add a child person ID
     * @param {string} childId - Child person ID to add
     */
    addChild(childId) {
        if (childId && !this.children.includes(childId)) {
            this.children.push(childId);
        }
    }

    /**
     * Remove a child person ID
     * @param {string} childId - Child person ID to remove
     */
    removeChild(childId) {
        const index = this.children.indexOf(childId);
        if (index > -1) {
            this.children.splice(index, 1);
        }
    }

    /**
     * Check if this family is empty
     * @returns {boolean} True if all fields are empty
     */
    isEmpty() {
        return !this.father && 
               !this.mother && 
               this.children.length === 0 && 
               this.marriage.isEmpty();
    }

    /**
     * Check if this family has parents
     * @returns {boolean} True if has father or mother
     */
    hasParents() {
        return !!this.father || !!this.mother;
    }

    /**
     * Check if this family has children
     * @returns {boolean} True if has children
     */
    hasChildren() {
        return this.children.length > 0;
    }

    /**
     * Get number of children
     * @returns {number} Number of children
     */
    getChildCount() {
        return this.children.length;
    }

    /**
     * Convert to string representation
     * @returns {string} String representation of the family
     */
    toString() {
        if (this.isEmpty()) {
            return '<Empty Family>';
        }

        const parts = [];
        if (this.father) {
            parts.push(`Father: ${this.father}`);
        }
        if (this.mother) {
            parts.push(`Mother: ${this.mother}`);
        }
        if (this.children.length > 0) {
            parts.push(`Children: [${this.children.join(', ')}]`);
        }
        if (!this.marriage.isEmpty()) {
            parts.push(`Marriage: ${this.marriage.toString()}`);
        }

        return parts.length > 0 ? parts.join(', ') : '<Empty Family>';
    }

    /**
     * Create a copy of this XmlFamily
     * @returns {XmlFamily} A new XmlFamily instance with the same data
     */
    clone() {
        return new XmlFamily(
            this.father,
            this.mother,
            this.children,
            this.marriage
        );
    }
}

module.exports = XmlFamily;

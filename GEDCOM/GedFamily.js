/**
 * GedFamily - A class for representing GEDCOM families as structured objects
 * Contains father, mother, children, and marriage information
 * 
 * @author Steve Turley
 * @version 1.0.0
 */

const GedEvent = require('./GedEvent');

class GedFamily {
    /**
     * Create a new GedFamily
     * @param {number} [father] - Integer ID for father
     * @param {number} [mother] - Integer ID for mother
     * @param {Array<number>} [children] - Array of integer IDs for children
     * @param {GedEvent} [marriage] - GedEvent for marriage event
     */
    constructor(father = 0, mother = 0, children = [], marriage = null) {
        this.father = parseInt(father) || 0;
        this.mother = parseInt(mother) || 0;
        this.children = children ? children.map(id => parseInt(id)).filter(id => id > 0) : [];
        this.marriage = marriage ? marriage.clone() : new GedEvent('MARR');
    }

    /**
     * Set the father ID
     * @param {number} father - Integer ID for father
     */
    setFather(father) {
        this.father = parseInt(father) || 0;
    }

    /**
     * Set the mother ID
     * @param {number} mother - Integer ID for mother
     */
    setMother(mother) {
        this.mother = parseInt(mother) || 0;
    }

    /**
     * Set the children IDs
     * @param {Array<number>} children - Array of integer IDs for children
     */
    setChildren(children) {
        this.children = children ? children.map(id => parseInt(id)).filter(id => id > 0) : [];
    }

    /**
     * Set the marriage event
     * @param {GedEvent} marriage - GedEvent for marriage event
     */
    setMarriage(marriage) {
        this.marriage = marriage ? marriage.clone() : new GedEvent('MARR');
    }

    /**
     * Add a child ID
     * @param {number} childId - Integer ID for child to add
     */
    addChild(childId) {
        const id = parseInt(childId);
        if (id > 0 && !this.children.includes(id)) {
            this.children.push(id);
        }
    }

    /**
     * Remove a child ID
     * @param {number} childId - Integer ID for child to remove
     */
    removeChild(childId) {
        const id = parseInt(childId);
        const index = this.children.indexOf(id);
        if (index > -1) {
            this.children.splice(index, 1);
        }
    }

    /**
     * Get the father ID
     * @returns {number} Father's integer ID
     */
    getFather() {
        return this.father;
    }

    /**
     * Get the mother ID
     * @returns {number} Mother's integer ID
     */
    getMother() {
        return this.mother;
    }

    /**
     * Get the children IDs
     * @returns {Array<number>} Array of children's integer IDs
     */
    getChildren() {
        return [...this.children];
    }

    /**
     * Get the marriage event
     * @returns {GedEvent} The marriage event
     */
    getMarriage() {
        return this.marriage;
    }

    /**
     * Check if this GedFamily is empty
     * @returns {boolean} True if all attributes are empty
     */
    isEmpty() {
        return this.father === 0 &&
               this.mother === 0 &&
               this.children.length === 0 &&
               this.marriage.isEmpty();
    }

    /**
     * Check if this family is valid (has at least some data)
     * @returns {boolean} True if the family has valid data
     */
    isValid() {
        return this.father > 0 ||
               this.mother > 0 ||
               this.children.length > 0 ||
               !this.marriage.isEmpty();
    }

    /**
     * Check if this family has parents
     * @returns {boolean} True if has father or mother
     */
    hasParents() {
        return this.father > 0 || this.mother > 0;
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
     * Get a string representation of the family
     * @returns {string} Family's key information
     */
    toString() {
        if (this.isEmpty()) {
            return '<Empty Family>';
        }

        const parts = [];

        if (this.father > 0) {
            parts.push(`Father: ${this.father}`);
        }

        if (this.mother > 0) {
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
     * Create a copy of this GedFamily
     * @returns {GedFamily} A new GedFamily instance with the same data
     */
    clone() {
        return new GedFamily(
            this.father,
            this.mother,
            this.children,
            this.marriage
        );
    }

    /**
     * Convert this GedFamily to a FamilyModel
     * @returns {FamilyModel} A new FamilyModel instance with converted data
     */
    toFamilyModel() {
        const EventModel = require('../DataModel/EventModel');
        const DateModel = require('../DataModel/DateModel');
        const FamilyModel = require('../DataModel/FamilyModel');

        // Convert GedEvent to EventModel
        let marriageModel = new EventModel();
        if (!this.marriage.isEmpty()) {
            let dateModel = new DateModel();
            if (this.marriage.getDate()) {
                try {
                    dateModel.parseGedcomDate(this.marriage.getDate());
                } catch (error) {
                    // If parsing fails, store as original string
                    dateModel.originalString = this.marriage.getDate();
                }
            }
            marriageModel = new EventModel(dateModel, this.marriage.getPlace());
        }

        // Convert father and mother IDs (0 becomes null for FamilyModel)
        const husbandId = this.father > 0 ? this.father : null;
        const wifeId = this.mother > 0 ? this.mother : null;

        // Children array can be used directly
        const childrenIds = [...this.children];

        return new FamilyModel(husbandId, wifeId, childrenIds, marriageModel);
    }

    /**
     * Extract GEDCOM reference ID from a string (removes @ symbols)
     * @param {string} refString - GEDCOM reference string like "@I123@" or "@F456@"
     * @returns {number} Numeric ID extracted from reference
     */
    static extractGedcomId(refString) {
        if (!refString || typeof refString !== 'string') {
            return 0;
        }

        // Remove @ symbols and extract numeric part
        const cleaned = refString.replace(/@/g, '');
        
        // Extract number from strings like "I123" or "F456"
        const match = cleaned.match(/(\d+)/);
        return match ? parseInt(match[1]) : 0;
    }

    /**
     * Create a GedFamily from a GEDCOM family record
     * @param {Object} gedcomRecord - The GEDCOM family record
     * @returns {GedFamily} New GedFamily instance
     */
    static fromGedcomRecord(gedcomRecord) {
        const family = new GedFamily();

        if (!gedcomRecord || !gedcomRecord.children) {
            return family;
        }

        // Process GEDCOM children to extract data
        for (const child of gedcomRecord.children) {
            switch (child.tag) {
                case 'HUSB':
                    // Extract father ID from GEDCOM reference
                    const fatherId = GedFamily.extractGedcomId(child.value);
                    family.setFather(fatherId);
                    break;

                case 'WIFE':
                    // Extract mother ID from GEDCOM reference
                    const motherId = GedFamily.extractGedcomId(child.value);
                    family.setMother(motherId);
                    break;

                case 'CHIL':
                    // Extract child ID from GEDCOM reference and add to children
                    const childId = GedFamily.extractGedcomId(child.value);
                    family.addChild(childId);
                    break;

                case 'MARR':
                    // Process marriage event
                    const marriageEvent = new GedEvent('MARR');
                    if (child.children) {
                        for (const grandchild of child.children) {
                            if (grandchild.tag === 'DATE') {
                                marriageEvent.setDate(grandchild.value);
                            } else if (grandchild.tag === 'PLAC') {
                                marriageEvent.setPlace(grandchild.value);
                            } else if (grandchild.tag === 'SOUR') {
                                marriageEvent.addSource(grandchild.value);
                            } else if (grandchild.tag === 'NOTE') {
                                marriageEvent.addNote(grandchild.value);
                            }
                        }
                    }
                    family.setMarriage(marriageEvent);
                    break;

                case 'ENGA':
                    // Handle engagement as a type of marriage event if no marriage found
                    if (family.marriage.isEmpty()) {
                        const engagementEvent = new GedEvent('ENGA');
                        if (child.children) {
                            for (const grandchild of child.children) {
                                if (grandchild.tag === 'DATE') {
                                    engagementEvent.setDate(grandchild.value);
                                } else if (grandchild.tag === 'PLAC') {
                                    engagementEvent.setPlace(grandchild.value);
                                } else if (grandchild.tag === 'SOUR') {
                                    engagementEvent.addSource(grandchild.value);
                                } else if (grandchild.tag === 'NOTE') {
                                    engagementEvent.addNote(grandchild.value);
                                }
                            }
                        }
                        family.setMarriage(engagementEvent);
                    }
                    break;

                case 'DIV':
                    // Handle divorce - could add as attribute to marriage event
                    if (child.children) {
                        for (const grandchild of child.children) {
                            if (grandchild.tag === 'DATE') {
                                family.marriage.setAttribute('divorce_date', grandchild.value);
                            } else if (grandchild.tag === 'PLAC') {
                                family.marriage.setAttribute('divorce_place', grandchild.value);
                            }
                        }
                    }
                    break;
            }
        }

        return family;
    }
}

module.exports = GedFamily;

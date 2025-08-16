/**
 * EntryModel - A class for handling genealogical entries
 * Contains people, families, and their relationships within an entry
 * 
 * @author Steve Turley
 * @version 1.0.0
 */

const PersonModel = require('./PersonModel');
const FamilyModel = require('./FamilyModel');

class EntryModel {
    /**
     * Create a new EntryModel
     * @param {string} id - The entry ID
     */
    constructor(id) {
        this.id = typeof id === 'string' ? id : '';
        this.personDict = {}; // uid -> person id mapping
        this.people = {}; // person id -> PersonModel mapping
        this.families = {}; // family id -> FamilyModel mapping
        this.relationships = {}; // person id -> relationship string mapping
    }

    /**
     * Add a person to the entry
     * @param {number} personId - Unique integer person ID
     * @param {string} uid - String UID for the person
     * @param {PersonModel} person - PersonModel instance
     * @returns {boolean} True if person was added, false if ID or UID already exists
     */
    addPerson(personId, uid, person) {
        // Validate inputs
        if (typeof personId !== 'number' || typeof uid !== 'string' || !person || !(person instanceof PersonModel)) {
            return false;
        }

        // Check for uniqueness of personId and uid
        if (this.people.hasOwnProperty(personId)) {
            return false; // Person ID already exists
        }

        if (this.personDict.hasOwnProperty(uid)) {
            return false; // UID already exists
        }

        // Add person to both dictionaries
        this.people[personId] = person.clone();
        this.personDict[uid] = personId;

        // Clear relationships cache since structure changed
        this.relationships = {};

        return true;
    }

    /**
     * Add a family to the entry
     * @param {number} familyId - Unique integer family ID
     * @param {FamilyModel} family - FamilyModel instance
     * @returns {boolean} True if family was added, false if ID already exists
     */
    addFamily(familyId, family) {
        // Validate inputs
        if (typeof familyId !== 'number' || !family || !(family instanceof FamilyModel)) {
            return false;
        }

        // Check for uniqueness of family ID
        if (this.families.hasOwnProperty(familyId)) {
            return false; // Family ID already exists
        }

        // Add family to dictionary
        this.families[familyId] = family.clone();

        // Add family ID to related people's family lists
        const husband = family.getHusband();
        const wife = family.getWife();
        const children = family.getChildren();

        if (husband !== null && this.people.hasOwnProperty(husband)) {
            this.people[husband].addFamily(familyId);
        }

        if (wife !== null && this.people.hasOwnProperty(wife)) {
            this.people[wife].addFamily(familyId);
        }

        for (const childId of children) {
            if (this.people.hasOwnProperty(childId)) {
                this.people[childId].addFamily(familyId);
            }
        }

        // Clear relationships cache since structure changed
        this.relationships = {};

        return true;
    }

    /**
     * Cross-reference a person UID to get their person ID
     * @param {string} uid - The person's UID
     * @returns {number} Person ID if found, -1 if not found
     */
    crossReference(uid) {
        if (typeof uid !== 'string' || !this.personDict.hasOwnProperty(uid)) {
            return -1;
        }
        return this.personDict[uid];
    }

    /**
     * Get the relationship string for a person
     * @param {number} personId - The person's ID
     * @returns {string} Relationship string, or empty string if person not found
     */
    Relationship(personId) {
        if (typeof personId !== 'number' || !this.people.hasOwnProperty(personId)) {
            return '';
        }

        // If relationships haven't been calculated yet, calculate them
        if (Object.keys(this.relationships).length === 0) {
            this._calculateRelationships();
        }

        return this.relationships[personId] || '';
    }

    /**
     * Alias for Relationship method for backward compatibility
     * @param {number} personId - The person's ID
     * @returns {string} Relationship string, or empty string if person not found
     */
    getRelationship(personId) {
        return this.Relationship(personId);
    }

    /**
     * Calculate relationship strings for all people in the entry
     * @private
     */
    _calculateRelationships() {
        this.relationships = {};
        const processed = new Set();
        const peopleIds = Object.keys(this.people).map(id => parseInt(id));
        let treeNumber = 0;

        for (const personId of peopleIds) {
            if (!processed.has(personId)) {
                // Start new tree with this person as trunk
                this._processTree(personId, treeNumber.toString(), processed);
                treeNumber++;
            }
        }
    }

    /**
     * Process a family tree starting from a trunk person
     * @param {number} trunkPersonId - ID of the trunk person
     * @param {string} baseRelationship - Base relationship string for the trunk
     * @param {Set} processed - Set of already processed person IDs
     * @private
     */
    _processTree(trunkPersonId, baseRelationship, processed) {
        const queue = [{personId: trunkPersonId, relationship: baseRelationship}];
        
        while (queue.length > 0) {
            const {personId, relationship} = queue.shift();
            
            if (processed.has(personId)) {
                continue;
            }

            processed.add(personId);
            this.relationships[personId] = relationship;

            // Get all families this person is part of
            const person = this.people[personId];
            const familyIds = person.getFamilies();

            for (const familyId of familyIds) {
                if (this.families.hasOwnProperty(familyId)) {
                    const family = this.families[familyId];
                    this._addFamilyRelationships(family, personId, relationship, queue, processed);
                }
            }
        }
    }

    /**
     * Add relationships for family members
     * @param {FamilyModel} family - The family
     * @param {number} currentPersonId - Current person's ID
     * @param {string} currentRelationship - Current person's relationship string
     * @param {Array} queue - Queue for breadth-first processing
     * @param {Set} processed - Set of processed person IDs
     * @private
     */
    _addFamilyRelationships(family, currentPersonId, currentRelationship, queue, processed) {
        const husband = family.getHusband();
        const wife = family.getWife();
        const children = family.getChildren();

        // Determine current person's role in this family
        let isHusband = husband === currentPersonId;
        let isWife = wife === currentPersonId;
        let isChild = children.includes(currentPersonId);

        if (isHusband) {
            // Add wife
            if (wife !== null && !processed.has(wife)) {
                queue.push({personId: wife, relationship: currentRelationship + 'W'});
            }
            // Add children
            for (const childId of children) {
                if (!processed.has(childId)) {
                    queue.push({personId: childId, relationship: currentRelationship + 'C'});
                }
            }
        } else if (isWife) {
            // Add husband
            if (husband !== null && !processed.has(husband)) {
                queue.push({personId: husband, relationship: currentRelationship + 'H'});
            }
            // Add children
            for (const childId of children) {
                if (!processed.has(childId)) {
                    queue.push({personId: childId, relationship: currentRelationship + 'C'});
                }
            }
        } else if (isChild) {
            // Add parents
            if (husband !== null && !processed.has(husband)) {
                queue.push({personId: husband, relationship: currentRelationship + 'F'});
            }
            if (wife !== null && !processed.has(wife)) {
                queue.push({personId: wife, relationship: currentRelationship + 'M'});
            }
            // Add siblings
            for (const siblingId of children) {
                if (siblingId !== currentPersonId && !processed.has(siblingId)) {
                    queue.push({personId: siblingId, relationship: currentRelationship + 'S'});
                }
            }
        }
    }

    /**
     * Get all people in the entry
     * @returns {Object} Copy of people dictionary
     */
    getPeople() {
        const result = {};
        for (const [id, person] of Object.entries(this.people)) {
            result[id] = person.clone();
        }
        return result;
    }

    /**
     * Get all families in the entry
     * @returns {Object} Copy of families dictionary
     */
    getFamilies() {
        const result = {};
        for (const [id, family] of Object.entries(this.families)) {
            result[id] = family.clone();
        }
        return result;
    }

    /**
     * Get person by ID
     * @param {number} personId - Person ID
     * @returns {PersonModel|null} Person model or null if not found
     */
    getPerson(personId) {
        if (this.people.hasOwnProperty(personId)) {
            return this.people[personId].clone();
        }
        return null;
    }

    /**
     * Get family by ID
     * @param {number} familyId - Family ID
     * @returns {FamilyModel|null} Family model or null if not found
     */
    getFamily(familyId) {
        if (this.families.hasOwnProperty(familyId)) {
            return this.families[familyId].clone();
        }
        return null;
    }

    /**
     * Get person by UID
     * @param {string} uid - Person UID
     * @returns {PersonModel|null} Person model or null if not found
     */
    getPersonByUID(uid) {
        const personId = this.crossReference(uid);
        if (personId !== -1) {
            return this.getPerson(personId);
        }
        return null;
    }

    /**
     * Check if entry is empty
     * @returns {boolean} True if entry has no people or families
     */
    isEmpty() {
        return Object.keys(this.people).length === 0 && Object.keys(this.families).length === 0;
    }

    /**
     * Get summary information about the entry
     * @returns {Object} Summary with counts and basic info
     */
    getSummary() {
        return {
            id: this.id,
            peopleCount: Object.keys(this.people).length,
            familiesCount: Object.keys(this.families).length,
            relationshipsCalculated: Object.keys(this.relationships).length > 0
        };
    }

    /**
     * Create a copy of this EntryModel
     * @returns {EntryModel} New EntryModel instance with the same data
     */
    clone() {
        const newEntry = new EntryModel(this.id);
        
        // Copy people
        for (const [personId, person] of Object.entries(this.people)) {
            const uid = Object.keys(this.personDict).find(key => this.personDict[key] === parseInt(personId));
            if (uid) {
                newEntry.addPerson(parseInt(personId), uid, person);
            }
        }

        // Copy families
        for (const [familyId, family] of Object.entries(this.families)) {
            newEntry.addFamily(parseInt(familyId), family);
        }

        return newEntry;
    }

    /**
     * Get string representation of the entry
     * @returns {string} Entry summary
     */
    toString() {
        if (this.isEmpty()) {
            return `<Empty Entry: ${this.id}>`;
        }
        
        const summary = this.getSummary();
        return `<Entry: ${summary.id} - ${summary.peopleCount} people, ${summary.familiesCount} families>`;
    }

    /**
     * Fill missing surnames for people in this entry based on family relationships
     * @param {Object} pageModelPeople - Reference to the PageModel's people dictionary for synchronization
     */
    fillSurname(pageModelPeople) {
        // Iterate through each person in the entry
        for (const personId in this.people) {
            const person = this.people[personId];
            const numericPersonId = parseInt(personId);
            
            // Check if person has a missing surname
            if (person && person.name && person.name.surname === '') {
                let newSurname = null;
                
                // Check all families to see if this person is involved
                for (const familyId in this.families) {
                    const family = this.families[familyId];
                    if (!family) continue;
                    
                    const husband = family.getHusband();
                    const children = family.getChildren();
                    
                    // Case 1: Person is a child, get father's surname
                    if (children.includes(numericPersonId) && husband !== null && this.people[husband]) {
                        const father = this.people[husband];
                        if (father && father.name && father.name.surname !== '') {
                            newSurname = father.name.surname;
                            break; // Found surname from father
                        }
                    }
                    
                    // Case 2: Person is a husband, get child's surname
                    if (husband === numericPersonId) {
                        for (const childId of children) {
                            if (this.people[childId]) {
                                const child = this.people[childId];
                                if (child && child.name && child.name.surname !== '') {
                                    newSurname = child.name.surname;
                                    break; // Found surname from child
                                }
                            }
                        }
                        if (newSurname) break; // Stop looking if we found a surname
                    }
                }
                
                // If we found a surname, update both the entry person and PageModel person
                if (newSurname) {
                    person.name.surname = newSurname;
                    
                    // Also update the corresponding person in the PageModel's people dictionary
                    if (pageModelPeople && pageModelPeople[personId]) {
                        pageModelPeople[personId].name.surname = newSurname;
                    }
                }
            }
        }
    }
}

module.exports = EntryModel;

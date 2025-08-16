/**
 * PageModel - A class for managing collections of genealogical entries, people, and families
 * Contains dictionaries for EntryModel entries, PersonModel people, and FamilyModel families
 * 
 * @author Steve Turley
 * @version 1.0.0
 */

const EntryModel = require('./EntryModel');
const PersonModel = require('./PersonModel');
const FamilyModel = require('./FamilyModel');

class PageModel {
    /**
     * Create a new PageModel with empty dictionaries
     */
    constructor() {
        this.entries = {}; // Dictionary indexed by string entry id
        this.people = {};  // Dictionary indexed by integer person id
        this.families = {}; // Dictionary indexed by integer family id
        this.location = ''; // Location extracted from filename
    }

    /**
     * Add an entry to the PageModel, handling ID conflicts and updating references
     * @param {EntryModel} entry - The EntryModel to add
     * @returns {boolean} True if successfully added, false otherwise
     */
    addEntry(entry) {
        if (!entry || !(entry instanceof EntryModel)) {
            return false;
        }

        const entryId = entry.id;
        if (!entryId || entryId === '') {
            return false;
        }

        // Use the entry ID as the key
        const entryKey = entryId;

        // Add the entry to entries dictionary
        this.entries[entryKey] = entry.clone();

        // Get people and families from the entry
        const entryPeople = entry.getPeople();
        const entryFamilies = entry.getFamilies();

        // Track ID mappings for updates
        const personIdMap = new Map(); // old ID -> new ID
        const familyIdMap = new Map(); // old ID -> new ID

        // Process people first
        for (const [personId, person] of Object.entries(entryPeople)) {
            const oldId = parseInt(personId);
            let newId = oldId;

            // Find lowest unused positive integer if ID conflicts
            while (this.people.hasOwnProperty(newId)) {
                newId++;
            }

            personIdMap.set(oldId, newId);
            this.people[newId] = person.clone();
        }

        // Process families and update person references
        for (const [familyId, family] of Object.entries(entryFamilies)) {
            const oldId = parseInt(familyId);
            let newId = oldId;

            // Find lowest unused positive integer if ID conflicts
            while (this.families.hasOwnProperty(newId)) {
                newId++;
            }

            familyIdMap.set(oldId, newId);
            
            // Clone the family and update person references
            const clonedFamily = family.clone();
            
            // Update husband ID if it exists and was remapped
            const husbandId = clonedFamily.getHusband();
            if (husbandId !== -1 && personIdMap.has(husbandId)) {
                clonedFamily.setHusband(personIdMap.get(husbandId));
            }

            // Update wife ID if it exists and was remapped
            const wifeId = clonedFamily.getWife();
            if (wifeId !== -1 && personIdMap.has(wifeId)) {
                clonedFamily.setWife(personIdMap.get(wifeId));
            }

            // Update children IDs if they were remapped
            const children = clonedFamily.getChildren();
            const updatedChildren = children.map(childId => 
                personIdMap.has(childId) ? personIdMap.get(childId) : childId
            );
            clonedFamily.setChildren(updatedChildren);

            this.families[newId] = clonedFamily;
        }

        // Update family references in people
        for (const [oldPersonId, newPersonId] of personIdMap) {
            const person = this.people[newPersonId];
            const familyIds = person.getFamilies();
            const updatedFamilyIds = familyIds.map(familyId => 
                familyIdMap.has(familyId) ? familyIdMap.get(familyId) : familyId
            );
            person.setFamilies(updatedFamilyIds);
        }

        // Create a new entry with updated IDs since EntryModel doesn't have remove methods
        const newEntry = new EntryModel(entryKey);
        
        // Add people with new IDs (need to find UIDs from original entry)
        const originalPeople = entry.getPeople();
        const originalPersonDict = {};
        
        // Build reverse lookup from personId to UID from the original entry
        for (const [personId, person] of Object.entries(originalPeople)) {
            const oldId = parseInt(personId);
            const newId = personIdMap.get(oldId);
            const uid = person.getUid(); // Use the person's UID attribute
            if (uid && uid !== '') {
                newEntry.addPerson(newId, uid, this.people[newId]);
            } else {
                // Generate a UID if person doesn't have one
                const generatedUid = `person_${newId}_${Date.now()}`;
                this.people[newId].setUid(generatedUid);
                newEntry.addPerson(newId, generatedUid, this.people[newId]);
            }
        }

        // Add families with new IDs
        for (const [oldId, newId] of familyIdMap) {
            newEntry.addFamily(newId, this.families[newId]);
        }

        // Replace the entry with the updated one
        this.entries[entryKey] = newEntry;

        return true;
    }

    /**
     * Add a person to the PageModel and associated entry
     * @param {PersonModel} person - The PersonModel to add
     * @param {number} personId - The integer person ID (must be unique)
     * @throws {Error} If personId already exists in people dictionary
     * @returns {boolean} True if successfully added, false otherwise
     */
    addPerson(person, personId) {
        if (!person || !(person instanceof PersonModel)) {
            return false;
        }

        if (typeof personId !== 'number' || !Number.isInteger(personId)) {
            return false;
        }

        // Check if personId already exists
        if (this.people.hasOwnProperty(personId)) {
            throw new Error(`Person ID ${personId} already exists in people dictionary`);
        }

        // Get the entry ID from the person's source attribute
        const entryId = person.getSource();
        if (!entryId || entryId === '') {
            return false;
        }

        // Create entry if it doesn't exist
        if (!this.entries.hasOwnProperty(entryId)) {
            this.entries[entryId] = new EntryModel(entryId);
        }

        // Add person to PageModel people dictionary
        this.people[personId] = person.clone();

        // Get or generate UID for the person
        let uid = person.getUid();
        if (!uid || uid === '') {
            uid = `person_${personId}_${Date.now()}`;
            this.people[personId].setUid(uid);
        }

        // Add person to the entry
        const entry = this.entries[entryId];
        entry.addPerson(personId, uid, this.people[personId]);

        return true;
    }

    /**
     * Add a family to the PageModel
     * @param {FamilyModel} family - The FamilyModel to add
     * @param {number} familyId - The integer family ID (must be unique)
     * @throws {Error} If familyId already exists in families dictionary
     * @returns {boolean} True if successfully added, false otherwise
     */
    addFamily(family, familyId) {
        if (!family || !(family instanceof FamilyModel)) {
            return false;
        }

        if (typeof familyId !== 'number' || !Number.isInteger(familyId)) {
            return false;
        }

        // Check if familyId already exists
        if (this.families.hasOwnProperty(familyId)) {
            throw new Error(`Family ID ${familyId} already exists in families dictionary`);
        }

        // Add family to PageModel families dictionary
        this.families[familyId] = family.clone();

        return true;
    }

    /**
     * Get all entries
     * @returns {Object} Dictionary of entries indexed by entry id
     */
    getEntries() {
        return { ...this.entries };
    }

    /**
     * Get all people
     * @returns {Object} Dictionary of people indexed by person id
     */
    getPeople() {
        return { ...this.people };
    }

    /**
     * Get all families
     * @returns {Object} Dictionary of families indexed by family id
     */
    getFamilies() {
        return { ...this.families };
    }

    /**
     * Get an entry by ID
     * @param {string} entryId - The entry ID
     * @returns {EntryModel|null} The entry or null if not found
     */
    getEntry(entryId) {
        return this.entries[entryId] || null;
    }

    /**
     * Get a person by ID
     * @param {number} personId - The person ID
     * @returns {PersonModel|null} The person or null if not found
     */
    getPerson(personId) {
        return this.people[personId] || null;
    }

    /**
     * Get a family by ID
     * @param {number} familyId - The family ID
     * @returns {FamilyModel|null} The family or null if not found
     */
    getFamily(familyId) {
        return this.families[familyId] || null;
    }

    /**
     * Check if the PageModel is empty
     * @returns {boolean} True if all dictionaries are empty
     */
    isEmpty() {
        return Object.keys(this.entries).length === 0 &&
               Object.keys(this.people).length === 0 &&
               Object.keys(this.families).length === 0;
    }

    /**
     * Get the count of entries
     * @returns {number} Number of entries
     */
    getEntryCount() {
        return Object.keys(this.entries).length;
    }

    /**
     * Get the count of people
     * @returns {number} Number of people
     */
    getPeopleCount() {
        return Object.keys(this.people).length;
    }

    /**
     * Get the count of families
     * @returns {number} Number of families
     */
    getFamilyCount() {
        return Object.keys(this.families).length;
    }

    /**
     * Remove an entry and all associated people and families
     * @param {string} entryId - The entry ID to remove
     * @returns {boolean} True if successfully removed, false if not found
     */
    removeEntry(entryId) {
        if (!this.entries.hasOwnProperty(entryId)) {
            return false;
        }

        const entry = this.entries[entryId];
        const entryPeople = entry.getPeople();
        const entryFamilies = entry.getFamilies();

        // Remove people associated with this entry
        for (const personId of Object.keys(entryPeople)) {
            delete this.people[parseInt(personId)];
        }

        // Remove families associated with this entry
        for (const familyId of Object.keys(entryFamilies)) {
            delete this.families[parseInt(familyId)];
        }

        // Remove the entry itself
        delete this.entries[entryId];

        return true;
    }

    /**
     * Create a copy of this PageModel
     * @returns {PageModel} A new PageModel instance with the same data
     */
    clone() {
        const cloned = new PageModel();
        
        // Clone entries
        for (const [entryId, entry] of Object.entries(this.entries)) {
            cloned.entries[entryId] = entry.clone();
        }

        // Clone people
        for (const [personId, person] of Object.entries(this.people)) {
            cloned.people[parseInt(personId)] = person.clone();
        }

        // Clone families
        for (const [familyId, family] of Object.entries(this.families)) {
            cloned.families[parseInt(familyId)] = family.clone();
        }

        return cloned;
    }

    /**
     * Get a string representation of the PageModel
     * @returns {string} Summary of the PageModel contents
     */
    toString() {
        if (this.isEmpty()) {
            return '<Empty PageModel>';
        }

        const entryCount = this.getEntryCount();
        const peopleCount = this.getPeopleCount();
        const familyCount = this.getFamilyCount();

        return `<PageModel: ${entryCount} entries, ${peopleCount} people, ${familyCount} families>`;
    }

    /**
     * Fill events for all people and families using the location from the filename
     */
    fillEvents() {
        if (!this.location || this.location === '') {
            return; // No location to fill with
        }

        // Fill events for all people in the people dictionary
        for (const personId in this.people) {
            const person = this.people[personId];
            if (person && typeof person.fillEvents === 'function') {
                person.fillEvents(this.location);
            }
        }

        // Fill marriage events for all families in the families dictionary
        for (const familyId in this.families) {
            const family = this.families[familyId];
            if (family && typeof family.fillMarriage === 'function') {
                family.fillMarriage(this.location);
            }
        }

        // Fill events for all entries
        for (const entryId in this.entries) {
            const entry = this.entries[entryId];
            if (entry) {
                // Fill events for people in this entry
                if (entry.people) {
                    for (const personId in entry.people) {
                        const person = entry.people[personId];
                        if (person && typeof person.fillEvents === 'function') {
                            person.fillEvents(this.location);
                        }
                    }
                }

                // Fill marriage events for families in this entry
                if (entry.families) {
                    for (const familyId in entry.families) {
                        const family = entry.families[familyId];
                        if (family && typeof family.fillMarriage === 'function') {
                            family.fillMarriage(this.location);
                        }
                    }
                }
            }
        }
    }

    /**
     * Fill missing surnames for all people in all entries based on family relationships
     */
    fillSurname() {
        // Iterate through all entries and call fillSurname for each
        for (const entryId in this.entries) {
            const entry = this.entries[entryId];
            if (entry && typeof entry.fillSurname === 'function') {
                entry.fillSurname(this.people); // Pass reference to PageModel's people dictionary
            }
        }
    }
}

module.exports = PageModel;

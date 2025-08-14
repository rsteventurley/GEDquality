/**
 * PersonModel - A class for handling genealogical persons
 * Contains a NameModel for the person's name and an EventModel for birth information
 * 
 * @author Steve Turley
 * @version 1.0.0
 */

const NameModel = require('./NameModel');
const EventModel = require('./EventModel');

class PersonModel {
    /**
     * Create a new PersonModel
     * @param {NameModel} [name] - Optional NameModel for the person's name
     * @param {EventModel} [birth] - Optional EventModel for the person's birth
     * @param {EventModel} [death] - Optional EventModel for the person's death
     * @param {EventModel} [christening] - Optional EventModel for the person's christening
     * @param {EventModel} [burial] - Optional EventModel for the person's burial
     * @param {Array<number>} [families] - Optional array of family IDs
     * @param {Array<string>} [references] - Optional array of reference strings
     * @param {string} [source] - Optional source string
     */
    constructor(name, birth, death, christening, burial, families, references, source) {
        this.name = name ? name.clone() : new NameModel();
        this.birth = birth ? birth.clone() : new EventModel();
        this.death = death ? death.clone() : new EventModel();
        this.christening = christening ? christening.clone() : new EventModel();
        this.burial = burial ? burial.clone() : new EventModel();
        this.families = families ? [...families] : [];
        this.references = references ? [...references] : [];
        this.source = source || '';
    }

    /**
     * Check if this PersonModel is empty (has default initialization values)
     * @returns {boolean} True if all attributes are empty
     */
    isEmpty() {
        return this.name.isEmpty() && 
               this.birth.isEmpty() && 
               this.death.isEmpty() && 
               this.christening.isEmpty() && 
               this.burial.isEmpty() && 
               this.families.length === 0 && 
               this.references.length === 0 && 
               this.source === '';
    }

    /**
     * Check if this person is valid (has at least some data)
     * @returns {boolean} True if the person has valid data
     */
    isValid() {
        return this.name.isValid() || 
               this.birth.isValid() || 
               this.death.isValid() || 
               this.christening.isValid() || 
               this.burial.isValid() || 
               this.families.length > 0 || 
               this.references.length > 0 || 
               this.source !== '';
    }

    /**
     * Get a string representation of the person
     * @returns {string} Person's name and key life events
     */
    toString() {
        if (this.isEmpty()) {
            return '<Empty Person>';
        }
        
        const nameStr = this.name.toString();
        const birthStr = this.birth.toString();
        const deathStr = this.death.toString();
        
        let result = nameStr || '<Unknown Name>';
        
        if (birthStr && birthStr !== '<Empty>') {
            result += ` born ${birthStr}`;
        }
        
        if (deathStr && deathStr !== '<Empty>') {
            result += ` died ${deathStr}`;
        }
        
        if (result === '<Unknown Name>') {
            return '<Empty Person>';
        }
        
        return result;
    }

    /**
     * Set the person's name
     * @param {NameModel} name - The NameModel to set
     */
    setName(name) {
        this.name = name ? name.clone() : new NameModel();
    }

    /**
     * Set the person's birth event
     * @param {EventModel} birth - The EventModel to set for birth
     */
    setBirth(birth) {
        this.birth = birth ? birth.clone() : new EventModel();
    }

    /**
     * Set the person's death event
     * @param {EventModel} death - The EventModel to set for death
     */
    setDeath(death) {
        this.death = death ? death.clone() : new EventModel();
    }

    /**
     * Set the person's christening event
     * @param {EventModel} christening - The EventModel to set for christening
     */
    setChristening(christening) {
        this.christening = christening ? christening.clone() : new EventModel();
    }

    /**
     * Set the person's burial event
     * @param {EventModel} burial - The EventModel to set for burial
     */
    setBurial(burial) {
        this.burial = burial ? burial.clone() : new EventModel();
    }

    /**
     * Set the person's families list
     * @param {Array<number>} families - Array of family IDs
     */
    setFamilies(families) {
        this.families = families ? [...families] : [];
    }

    /**
     * Set the person's references list
     * @param {Array<string>} references - Array of reference strings
     */
    setReferences(references) {
        this.references = references ? [...references] : [];
    }

    /**
     * Set the person's source
     * @param {string} source - The source string
     */
    setSource(source) {
        this.source = source || '';
    }

    /**
     * Get the person's name
     * @returns {NameModel} The person's name
     */
    getName() {
        return this.name;
    }

    /**
     * Get the person's birth event
     * @returns {EventModel} The person's birth event
     */
    getBirth() {
        return this.birth;
    }

    /**
     * Get the person's death event
     * @returns {EventModel} The person's death event
     */
    getDeath() {
        return this.death;
    }

    /**
     * Get the person's christening event
     * @returns {EventModel} The person's christening event
     */
    getChristening() {
        return this.christening;
    }

    /**
     * Get the person's burial event
     * @returns {EventModel} The person's burial event
     */
    getBurial() {
        return this.burial;
    }

    /**
     * Get the person's families list
     * @returns {Array<number>} Array of family IDs
     */
    getFamilies() {
        return [...this.families];
    }

    /**
     * Get the person's references list
     * @returns {Array<string>} Array of reference strings
     */
    getReferences() {
        return [...this.references];
    }

    /**
     * Get the person's source
     * @returns {string} The source string
     */
    getSource() {
        return this.source;
    }

    /**
     * Create a copy of this PersonModel
     * @returns {PersonModel} A new PersonModel instance with the same data
     */
    clone() {
        return new PersonModel(
            this.name, 
            this.birth, 
            this.death, 
            this.christening, 
            this.burial, 
            this.families, 
            this.references, 
            this.source
        );
    }

    /**
     * Get the person's full name in genealogical format
     * @returns {string} Name in "Surname, Given Name" format
     */
    getGenealogicalName() {
        return this.name.toGenealogicalFormat();
    }

    /**
     * Get the person's birth date in GEDCOM format
     * @returns {string} Birth date in GEDCOM format
     */
    getBirthDateGEDCOM() {
        return this.birth.getDateGEDCOM();
    }

    /**
     * Get the person's birth place
     * @returns {string} Birth place
     */
    getBirthPlace() {
        return this.birth.getPlace();
    }

    /**
     * Get the person's birth place with German translations
     * @returns {string} Translated birth place
     */
    getBirthPlaceTranslated() {
        return this.birth.translatePlace();
    }

    /**
     * Check if the person has an exact birth date
     * @returns {boolean} True if the birth date is exact
     */
    hasExactBirthDate() {
        return this.birth.hasExactDate();
    }

    /**
     * Get the person's initials
     * @returns {string} Initials from the person's name
     */
    getInitials() {
        return this.name.getInitials();
    }

    /**
     * Get the person's death date in GEDCOM format
     * @returns {string} Death date in GEDCOM format
     */
    getDeathDateGEDCOM() {
        return this.death.getDateGEDCOM();
    }

    /**
     * Get the person's death place
     * @returns {string} Death place
     */
    getDeathPlace() {
        return this.death.getPlace();
    }

    /**
     * Get the person's death place with German translations
     * @returns {string} Translated death place
     */
    getDeathPlaceTranslated() {
        return this.death.translatePlace();
    }

    /**
     * Get the person's christening date in GEDCOM format
     * @returns {string} Christening date in GEDCOM format
     */
    getChristeningDateGEDCOM() {
        return this.christening.getDateGEDCOM();
    }

    /**
     * Get the person's burial date in GEDCOM format
     * @returns {string} Burial date in GEDCOM format
     */
    getBurialDateGEDCOM() {
        return this.burial.getDateGEDCOM();
    }

    /**
     * Check if the person has an exact death date
     * @returns {boolean} True if the death date is exact
     */
    hasExactDeathDate() {
        return this.death.hasExactDate();
    }

    /**
     * Add a family ID to the families list
     * @param {number} familyId - The family ID to add
     */
    addFamily(familyId) {
        if (typeof familyId === 'number' && !this.families.includes(familyId)) {
            this.families.push(familyId);
        }
    }

    /**
     * Remove a family ID from the families list
     * @param {number} familyId - The family ID to remove
     */
    removeFamily(familyId) {
        const index = this.families.indexOf(familyId);
        if (index > -1) {
            this.families.splice(index, 1);
        }
    }

    /**
     * Add a reference to the references list
     * @param {string} reference - The reference to add
     */
    addReference(reference) {
        if (typeof reference === 'string' && reference !== '' && !this.references.includes(reference)) {
            this.references.push(reference);
        }
    }

    /**
     * Remove a reference from the references list
     * @param {string} reference - The reference to remove
     */
    removeReference(reference) {
        const index = this.references.indexOf(reference);
        if (index > -1) {
            this.references.splice(index, 1);
        }
    }

    /**
     * Check if the person is deceased (has death information)
     * @returns {boolean} True if the person has death information
     */
    isDeceased() {
        return this.death.isValid();
    }

    /**
     * Get a comprehensive life summary
     * @returns {string} Summary of the person's life events
     */
    getLifeSummary() {
        const parts = [];
        const nameStr = this.name.toString() || '<Unknown Name>';
        
        parts.push(nameStr);
        
        if (this.birth.isValid()) {
            parts.push(`born ${this.birth.toString()}`);
        }
        
        if (this.christening.isValid()) {
            parts.push(`christened ${this.christening.toString()}`);
        }
        
        if (this.death.isValid()) {
            parts.push(`died ${this.death.toString()}`);
        }
        
        if (this.burial.isValid()) {
            parts.push(`buried ${this.burial.toString()}`);
        }
        
        if (parts.length === 1) {
            return parts[0];
        }
        
        return parts.join(', ');
    }

    /**
     * Check if at least one event matches between this person and another person
     * @param {PersonModel} otherPerson - The other PersonModel to compare with
     * @returns {boolean} True if at least one non-empty event matches
     */
    eventMatch(otherPerson) {
        if (!otherPerson || !(otherPerson instanceof PersonModel)) {
            return false;
        }
        
        // Check birth event match
        if (this.birth.isValid() && otherPerson.birth.isValid()) {
            if (this.birth.toString() === otherPerson.birth.toString()) {
                return true;
            }
        }
        
        // Check death event match
        if (this.death.isValid() && otherPerson.death.isValid()) {
            if (this.death.toString() === otherPerson.death.toString()) {
                return true;
            }
        }
        
        // Check christening event match
        if (this.christening.isValid() && otherPerson.christening.isValid()) {
            if (this.christening.toString() === otherPerson.christening.toString()) {
                return true;
            }
        }
        
        // Check burial event match
        if (this.burial.isValid() && otherPerson.burial.isValid()) {
            if (this.burial.toString() === otherPerson.burial.toString()) {
                return true;
            }
        }
        
        return false;
    }

    /**
     * Check if all events match between this person and another person
     * Returns true if all events are either empty or match exactly
     * @param {PersonModel} otherPerson - The other PersonModel to compare with
     * @returns {boolean} True if all events are empty or match
     */
    eventsMatch(otherPerson) {
        if (!otherPerson || !(otherPerson instanceof PersonModel)) {
            return false;
        }
        
        // Check birth event - must be empty for both or match exactly
        if (this.birth.isValid() || otherPerson.birth.isValid()) {
            if (this.birth.isValid() !== otherPerson.birth.isValid()) {
                return false; // One is valid, other is not
            }
            if (this.birth.isValid() && this.birth.toString() !== otherPerson.birth.toString()) {
                return false; // Both valid but don't match
            }
        }
        
        // Check death event - must be empty for both or match exactly
        if (this.death.isValid() || otherPerson.death.isValid()) {
            if (this.death.isValid() !== otherPerson.death.isValid()) {
                return false; // One is valid, other is not
            }
            if (this.death.isValid() && this.death.toString() !== otherPerson.death.toString()) {
                return false; // Both valid but don't match
            }
        }
        
        // Check christening event - must be empty for both or match exactly
        if (this.christening.isValid() || otherPerson.christening.isValid()) {
            if (this.christening.isValid() !== otherPerson.christening.isValid()) {
                return false; // One is valid, other is not
            }
            if (this.christening.isValid() && this.christening.toString() !== otherPerson.christening.toString()) {
                return false; // Both valid but don't match
            }
        }
        
        // Check burial event - must be empty for both or match exactly
        if (this.burial.isValid() || otherPerson.burial.isValid()) {
            if (this.burial.isValid() !== otherPerson.burial.isValid()) {
                return false; // One is valid, other is not
            }
            if (this.burial.isValid() && this.burial.toString() !== otherPerson.burial.toString()) {
                return false; // Both valid but don't match
            }
        }
        
        return true; // All events either empty or match
    }

    /**
     * Fill empty places in events that have exact dates
     * @param {string} place - The place to set for events with exact dates but no place
     */
    fillEvents(place) {
        if (!place || typeof place !== 'string') {
            return;
        }
        
        // Check birth event
        if (this.birth.isValid() && this.birth.hasExactDate() && this.birth.getPlace() === '') {
            this.birth.setPlace(place);
        }
        
        // Check death event
        if (this.death.isValid() && this.death.hasExactDate() && this.death.getPlace() === '') {
            this.death.setPlace(place);
        }
        
        // Check christening event
        if (this.christening.isValid() && this.christening.hasExactDate() && this.christening.getPlace() === '') {
            this.christening.setPlace(place);
        }
        
        // Check burial event
        if (this.burial.isValid() && this.burial.hasExactDate() && this.burial.getPlace() === '') {
            this.burial.setPlace(place);
        }
    }
}

module.exports = PersonModel;

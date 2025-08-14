/**
 * IndividualModel - A class for representing GEDCOM individuals as structured objects
 * Contains gender, name, events, source, and references information
 * 
 * @author Steve Turley
 * @version 1.0.0
 */

const GedName = require('./GedName');
const GedEvent = require('./GedEvent');

class IndividualModel {
    /**
     * Create a new IndividualModel
     * @param {string} [gender] - Gender character (M, F, or empty)
     * @param {GedName} [name] - GedName for the person's name
     * @param {GedEvent} [birth] - GedEvent for birth event
     * @param {GedEvent} [christening] - GedEvent for christening event
     * @param {GedEvent} [death] - GedEvent for death event
     * @param {GedEvent} [burial] - GedEvent for burial event
     * @param {string} [source] - Source string
     * @param {Array<string>} [references] - Array of reference strings
     */
    constructor(gender = '', name = null, birth = null, christening = null, death = null, burial = null, source = '', references = []) {
        this.gender = gender || '';
        this.name = name ? name.clone() : new GedName();
        this.birth = birth ? birth.clone() : new GedEvent('BIRT');
        this.christening = christening ? christening.clone() : new GedEvent('CHR');
        this.death = death ? death.clone() : new GedEvent('DEAT');
        this.burial = burial ? burial.clone() : new GedEvent('BURI');
        this.source = source || '';
        this.references = references ? [...references] : [];
    }

    /**
     * Set the gender
     * @param {string} gender - Gender character (M, F, or empty)
     */
    setGender(gender) {
        this.gender = gender || '';
    }

    /**
     * Set the name
     * @param {GedName} name - GedName for the person's name
     */
    setName(name) {
        this.name = name ? name.clone() : new GedName();
    }

    /**
     * Set the birth event
     * @param {GedEvent} birth - GedEvent for birth event
     */
    setBirth(birth) {
        this.birth = birth ? birth.clone() : new GedEvent('BIRT');
    }

    /**
     * Set the christening event
     * @param {GedEvent} christening - GedEvent for christening event
     */
    setChristening(christening) {
        this.christening = christening ? christening.clone() : new GedEvent('CHR');
    }

    /**
     * Set the death event
     * @param {GedEvent} death - GedEvent for death event
     */
    setDeath(death) {
        this.death = death ? death.clone() : new GedEvent('DEAT');
    }

    /**
     * Set the burial event
     * @param {GedEvent} burial - GedEvent for burial event
     */
    setBurial(burial) {
        this.burial = burial ? burial.clone() : new GedEvent('BURI');
    }

    /**
     * Set the source
     * @param {string} source - Source string
     */
    setSource(source) {
        this.source = source || '';
    }

    /**
     * Set the references
     * @param {Array<string>} references - Array of reference strings
     */
    setReferences(references) {
        this.references = references ? [...references] : [];
    }

    /**
     * Add a reference
     * @param {string} reference - Reference string to add
     */
    addReference(reference) {
        if (reference && !this.references.includes(reference)) {
            this.references.push(reference);
        }
    }

    /**
     * Get the gender
     * @returns {string} Gender character
     */
    getGender() {
        return this.gender;
    }

    /**
     * Get the name
     * @returns {GedName} The person's name
     */
    getName() {
        return this.name;
    }

    /**
     * Get the birth event
     * @returns {GedEvent} The birth event
     */
    getBirth() {
        return this.birth;
    }

    /**
     * Get the christening event
     * @returns {GedEvent} The christening event
     */
    getChristening() {
        return this.christening;
    }

    /**
     * Get the death event
     * @returns {GedEvent} The death event
     */
    getDeath() {
        return this.death;
    }

    /**
     * Get the burial event
     * @returns {GedEvent} The burial event
     */
    getBurial() {
        return this.burial;
    }

    /**
     * Get the source
     * @returns {string} The source string
     */
    getSource() {
        return this.source;
    }

    /**
     * Get the references
     * @returns {Array<string>} Array of reference strings
     */
    getReferences() {
        return [...this.references];
    }

    /**
     * Check if this IndividualModel is empty
     * @returns {boolean} True if all attributes are empty
     */
    isEmpty() {
        return this.gender === '' &&
               this.name.isEmpty() &&
               this.birth.isEmpty() &&
               this.christening.isEmpty() &&
               this.death.isEmpty() &&
               this.burial.isEmpty() &&
               this.source === '' &&
               this.references.length === 0;
    }

    /**
     * Check if this individual is valid (has at least some data)
     * @returns {boolean} True if the individual has valid data
     */
    isValid() {
        return this.gender !== '' ||
               !this.name.isEmpty() ||
               !this.birth.isEmpty() ||
               !this.christening.isEmpty() ||
               !this.death.isEmpty() ||
               !this.burial.isEmpty() ||
               this.source !== '' ||
               this.references.length > 0;
    }

    /**
     * Get a string representation of the individual
     * @returns {string} Individual's name and key information
     */
    toString() {
        if (this.isEmpty()) {
            return '<Empty Individual>';
        }

        const nameStr = this.name.getFormattedName();
        const genderStr = this.gender ? ` (${this.gender})` : '';
        const birthStr = this.birth.toString();
        const deathStr = this.death.toString();

        let result = nameStr || '<Unknown Name>';
        result += genderStr;

        if (!this.birth.isEmpty()) {
            result += ` born ${birthStr}`;
        }

        if (!this.death.isEmpty()) {
            result += ` died ${deathStr}`;
        }

        if (result === '<Unknown Name>') {
            return '<Empty Individual>';
        }

        return result;
    }

    /**
     * Create a copy of this IndividualModel
     * @returns {IndividualModel} A new IndividualModel instance with the same data
     */
    clone() {
        return new IndividualModel(
            this.gender,
            this.name,
            this.birth,
            this.christening,
            this.death,
            this.burial,
            this.source,
            this.references
        );
    }

    /**
     * Create an IndividualModel from a GEDCOM individual record
     * @param {Object} gedcomRecord - The GEDCOM individual record
     * @returns {IndividualModel} New IndividualModel instance
     */
    static fromGedcomRecord(gedcomRecord) {
        const individual = new IndividualModel();

        if (!gedcomRecord || !gedcomRecord.children) {
            return individual;
        }

        // Process GEDCOM children to extract data
        for (const child of gedcomRecord.children) {
            switch (child.tag) {
                case 'SEX':
                    individual.setGender(child.value);
                    break;

                case 'NAME':
                    // Use the first name found (could be enhanced to handle multiple names)
                    if (individual.name.isEmpty()) {
                        const gedName = new GedName(child.value);
                        individual.setName(gedName);
                    }
                    break;

                case 'BIRT':
                    // Process birth event
                    const birthEvent = new GedEvent('BIRT');
                    if (child.children) {
                        for (const grandchild of child.children) {
                            if (grandchild.tag === 'DATE') {
                                birthEvent.setDate(grandchild.value);
                            } else if (grandchild.tag === 'PLAC') {
                                birthEvent.setPlace(grandchild.value);
                            } else if (grandchild.tag === 'SOUR') {
                                birthEvent.addSource(grandchild.value);
                            } else if (grandchild.tag === 'NOTE') {
                                birthEvent.addNote(grandchild.value);
                            }
                        }
                    }
                    individual.setBirth(birthEvent);
                    break;

                case 'CHR':
                    // Process christening event
                    const christeningEvent = new GedEvent('CHR');
                    if (child.children) {
                        for (const grandchild of child.children) {
                            if (grandchild.tag === 'DATE') {
                                christeningEvent.setDate(grandchild.value);
                            } else if (grandchild.tag === 'PLAC') {
                                christeningEvent.setPlace(grandchild.value);
                            } else if (grandchild.tag === 'SOUR') {
                                christeningEvent.addSource(grandchild.value);
                            } else if (grandchild.tag === 'NOTE') {
                                christeningEvent.addNote(grandchild.value);
                            }
                        }
                    }
                    individual.setChristening(christeningEvent);
                    break;

                case 'DEAT':
                    // Process death event
                    const deathEvent = new GedEvent('DEAT');
                    if (child.children) {
                        for (const grandchild of child.children) {
                            if (grandchild.tag === 'DATE') {
                                deathEvent.setDate(grandchild.value);
                            } else if (grandchild.tag === 'PLAC') {
                                deathEvent.setPlace(grandchild.value);
                            } else if (grandchild.tag === 'SOUR') {
                                deathEvent.addSource(grandchild.value);
                            } else if (grandchild.tag === 'NOTE') {
                                deathEvent.addNote(grandchild.value);
                            }
                        }
                    }
                    individual.setDeath(deathEvent);
                    break;

                case 'BURI':
                    // Process burial event
                    const burialEvent = new GedEvent('BURI');
                    if (child.children) {
                        for (const grandchild of child.children) {
                            if (grandchild.tag === 'DATE') {
                                burialEvent.setDate(grandchild.value);
                            } else if (grandchild.tag === 'PLAC') {
                                burialEvent.setPlace(grandchild.value);
                            } else if (grandchild.tag === 'SOUR') {
                                burialEvent.addSource(grandchild.value);
                            } else if (grandchild.tag === 'NOTE') {
                                burialEvent.addNote(grandchild.value);
                            }
                        }
                    }
                    individual.setBurial(burialEvent);
                    break;

                case 'SOUR':
                    // Extract PAGE value from SOUR record and store as source string
                    if (!individual.source && child.children) {
                        for (const grandchild of child.children) {
                            if (grandchild.tag === 'PAGE') {
                                individual.setSource(grandchild.value);
                                break; // Use the first PAGE found
                            }
                        }
                    }
                    break;

                case 'EVEN':
                    // Process EVEN records to find Cref events
                    if (child.children) {
                        let isCrefEvent = false;
                        let eventValue = child.value || '';
                        
                        // Check if this is a Cref event
                        for (const grandchild of child.children) {
                            if (grandchild.tag === 'TYPE' && grandchild.value === 'Cref') {
                                isCrefEvent = true;
                                break;
                            }
                        }
                        
                        // If it's a Cref event, add the event value to references
                        if (isCrefEvent && eventValue) {
                            individual.addReference(eventValue);
                        }
                    }
                    break;
            }
        }

        return individual;
    }
}

module.exports = IndividualModel;

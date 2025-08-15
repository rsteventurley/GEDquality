/**
 * XmlPerson - A class for representing XML person information
 * Contains name, events, and references from XML person elements
 * 
 * @author Steve Turley
 * @version 1.0.0
 */

const XmlName = require('./XmlName');
const XmlEvent = require('./XmlEvent');

class XmlPerson {
    /**
     * Create a new XmlPerson
     * @param {string} [id] - Person ID
     * @param {string} [sex] - Person's sex (M/F)
     * @param {XmlName} [name] - Person's name
     * @param {XmlEvent} [birth] - Birth event
     * @param {XmlEvent} [christening] - Christening event
     * @param {XmlEvent} [death] - Death event
     * @param {XmlEvent} [burial] - Burial event
     * @param {Array<string>} [references] - Array of xref values
     * @param {string} [occupation] - Person's occupation
     */
    constructor(id = '', sex = '', name = null, birth = null, christening = null, death = null, burial = null, references = [], occupation = '') {
        this.id = id;
        this.sex = sex;
        this.name = name ? name.clone() : new XmlName();
        this.birth = birth ? birth.clone() : new XmlEvent('birth');
        this.christening = christening ? christening.clone() : new XmlEvent('christening');
        this.death = death ? death.clone() : new XmlEvent('death');
        this.burial = burial ? burial.clone() : new XmlEvent('burial');
        this.references = [...references];
        this.occupation = occupation;
    }

    /**
     * Get the person ID
     * @returns {string} Person ID
     */
    getId() {
        return this.id;
    }

    /**
     * Get the person's sex
     * @returns {string} Sex (M/F)
     */
    getSex() {
        return this.sex;
    }

    /**
     * Get the person's name
     * @returns {XmlName} Person's name
     */
    getName() {
        return this.name;
    }

    /**
     * Get the birth event
     * @returns {XmlEvent} Birth event
     */
    getBirth() {
        return this.birth;
    }

    /**
     * Get the christening event
     * @returns {XmlEvent} Christening event
     */
    getChristening() {
        return this.christening;
    }

    /**
     * Get the death event
     * @returns {XmlEvent} Death event
     */
    getDeath() {
        return this.death;
    }

    /**
     * Get the burial event
     * @returns {XmlEvent} Burial event
     */
    getBurial() {
        return this.burial;
    }

    /**
     * Get the references array
     * @returns {Array<string>} Array of references
     */
    getReferences() {
        return [...this.references];
    }

    /**
     * Get the occupation
     * @returns {string} Person's occupation
     */
    getOccupation() {
        return this.occupation;
    }

    /**
     * Add a reference
     * @param {string} reference - Reference to add
     */
    addReference(reference) {
        if (reference && !this.references.includes(reference)) {
            this.references.push(reference);
        }
    }

    /**
     * Set the person's name
     * @param {XmlName} name - Person's name
     */
    setName(name) {
        this.name = name ? name.clone() : new XmlName();
    }

    /**
     * Set the birth event
     * @param {XmlEvent} birth - Birth event
     */
    setBirth(birth) {
        this.birth = birth ? birth.clone() : new XmlEvent('birth');
    }

    /**
     * Set the christening event
     * @param {XmlEvent} christening - Christening event
     */
    setChristening(christening) {
        this.christening = christening ? christening.clone() : new XmlEvent('christening');
    }

    /**
     * Set the death event
     * @param {XmlEvent} death - Death event
     */
    setDeath(death) {
        this.death = death ? death.clone() : new XmlEvent('death');
    }

    /**
     * Set the burial event
     * @param {XmlEvent} burial - Burial event
     */
    setBurial(burial) {
        this.burial = burial ? burial.clone() : new XmlEvent('burial');
    }

    /**
     * Set the occupation
     * @param {string} occupation - Person's occupation
     */
    setOccupation(occupation) {
        this.occupation = occupation || '';
    }

    /**
     * Check if this person is empty
     * @returns {boolean} True if all significant fields are empty
     */
    isEmpty() {
        return !this.id && 
               !this.sex && 
               this.name.isEmpty() && 
               this.birth.isEmpty() && 
               this.death.isEmpty() && 
               this.christening.isEmpty() && 
               this.burial.isEmpty() && 
               this.references.length === 0 &&
               !this.occupation;
    }

    /**
     * Convert to string representation
     * @returns {string} String representation of the person
     */
    toString() {
        if (this.isEmpty()) {
            return '<Empty Person>';
        }

        const parts = [];
        if (this.id) {
            parts.push(`ID: ${this.id}`);
        }
        if (!this.name.isEmpty()) {
            parts.push(`Name: ${this.name.toString()}`);
        }
        if (this.sex) {
            parts.push(`Sex: ${this.sex}`);
        }

        return parts.length > 0 ? parts.join(', ') : '<Empty Person>';
    }

    /**
     * Convert this XmlPerson to a PersonModel from the DataModel system
     * @returns {PersonModel} PersonModel representation of this person
     */
    toPersonModel() {
        const PersonModel = require('../DataModel/PersonModel');
        const NameModel = require('../DataModel/NameModel');
        const EventModel = require('../DataModel/EventModel');
        
        // Create NameModel from XmlName
        const nameModel = new NameModel(this.name.getGiven(), this.name.getSurname());
        
        // Convert events to EventModels
        let birthModel, deathModel, christeningModel, burialModel;
        
        if (this.birth && this.birth.getType()) {
            birthModel = this.birth.toEventModel();
        }
        
        if (this.christening && this.christening.getType()) {
            christeningModel = this.christening.toEventModel();
        }
        
        if (this.death && this.death.getType()) {
            deathModel = this.death.toEventModel();
        }
        
        if (this.burial && this.burial.getType()) {
            burialModel = this.burial.toEventModel();
        }
        
        // Create PersonModel with proper parameters
        const personModel = new PersonModel(
            nameModel,
            birthModel,
            deathModel,
            christeningModel,
            burialModel,
            [], // families - will be set separately
            this.references, // references
            '', // source
            this.id // uid
        );
        
        return personModel;
    }

    /**
     * Create a copy of this XmlPerson
     * @returns {XmlPerson} A new XmlPerson instance with the same data
     */
    clone() {
        return new XmlPerson(
            this.id,
            this.sex,
            this.name,
            this.birth,
            this.christening,
            this.death,
            this.burial,
            this.references,
            this.occupation
        );
    }
}

module.exports = XmlPerson;

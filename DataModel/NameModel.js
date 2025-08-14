/**
 * NameModel - A class for handling genealogical names
 * Contains givenName and surname properties for representing personal names
 * 
 * @author Steve Turley
 * @version 1.0.0
 */

class NameModel {
    /**
     * Create a new NameModel
     * @param {string} [givenName] - Optional given name (first name)
     * @param {string} [surname] - Optional surname (last name)
     */
    constructor(givenName, surname) {
        this.givenName = givenName || '';
        this.surname = surname || '';
    }

    /**
     * Get a string representation of the name
     * @returns {string} Given name followed by a space and surname
     */
    toString() {
        if (this.givenName === '' && this.surname === '') {
            return '';
        }
        
        if (this.givenName === '') {
            return this.surname;
        }
        
        if (this.surname === '') {
            return this.givenName;
        }
        
        return `${this.givenName} ${this.surname}`;
    }

    /**
     * Check if this NameModel is empty (has default initialization values)
     * @returns {boolean} True if both givenName and surname are empty
     */
    isEmpty() {
        return this.givenName === '' && this.surname === '';
    }

    /**
     * Check if this name is valid (has at least one name component)
     * @returns {boolean} True if the name has at least a given name or surname
     */
    isValid() {
        return this.givenName !== '' || this.surname !== '';
    }

    /**
     * Set the given name
     * @param {string} givenName - The given name to set
     */
    setGivenName(givenName) {
        this.givenName = givenName || '';
    }

    /**
     * Set the surname
     * @param {string} surname - The surname to set
     */
    setSurname(surname) {
        this.surname = surname || '';
    }

    /**
     * Get the given name
     * @returns {string} The given name
     */
    getGivenName() {
        return this.givenName;
    }

    /**
     * Get the surname
     * @returns {string} The surname
     */
    getSurname() {
        return this.surname;
    }

    /**
     * Create a copy of this NameModel
     * @returns {NameModel} A new NameModel instance with the same data
     */
    clone() {
        return new NameModel(this.givenName, this.surname);
    }

    /**
     * Get the full name in "surname, givenName" format (commonly used in genealogy)
     * @returns {string} Surname followed by comma and given name
     */
    toGenealogicalFormat() {
        if (this.givenName === '' && this.surname === '') {
            return '';
        }
        
        if (this.givenName === '') {
            return this.surname;
        }
        
        if (this.surname === '') {
            return this.givenName;
        }
        
        return `${this.surname}, ${this.givenName}`;
    }

    /**
     * Get initials from the name
     * @returns {string} Initials of given name and surname
     */
    getInitials() {
        let initials = '';
        
        if (this.givenName !== '') {
            initials += this.givenName.charAt(0).toUpperCase();
        }
        
        if (this.surname !== '') {
            initials += this.surname.charAt(0).toUpperCase();
        }
        
        return initials;
    }
}

module.exports = NameModel;

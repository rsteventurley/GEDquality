/**
 * GedName - A class for storing GEDCOM name information
 * Contains given and surname information for genealogical names
 * 
 * @author Steve Turley
 * @version 1.0.0
 */

class GedName {
    /**
     * Create a new GedName
     * @param {string} [fullName] - The full name string (e.g., "John /Doe/")
     */
    constructor(fullName = '') {
        this.fullName = fullName;
        this.givenName = '';
        this.surname = '';
        this.nickname = '';
        this.namePrefix = '';
        this.nameSuffix = '';
        this.sources = []; // Array of source references
        this.notes = []; // Array of notes
        this.attributes = {}; // Additional attributes

        // Parse the full name if provided
        if (fullName) {
            this._parseFullName(fullName);
        }
    }

    /**
     * Parse a full name string in GEDCOM format
     * @param {string} fullName - Full name string (e.g., "John /Doe/", "Dr. John /Doe/ Jr.")
     * @private
     */
    _parseFullName(fullName) {
        if (!fullName) return;

        // GEDCOM name format: Given names /Surname/ Suffix
        // Example: "John William /Doe/ Jr."
        
        const surnameMatch = fullName.match(/\/([^\/]*)\//);
        if (surnameMatch) {
            this.surname = surnameMatch[1].trim();
            
            // Remove surname part and split the rest
            const withoutSurname = fullName.replace(/\/[^\/]*\//, '').trim();
            const parts = withoutSurname.split(/\s+/).filter(part => part);
            
            // First parts are typically given names, last parts might be suffixes
            if (parts.length > 0) {
                // Simple heuristic: if last part looks like a suffix, separate it
                const lastPart = parts[parts.length - 1];
                if (this._isSuffix(lastPart)) {
                    this.nameSuffix = lastPart;
                    this.givenName = parts.slice(0, -1).join(' ');
                } else {
                    this.givenName = parts.join(' ');
                }
            }
        } else {
            // No surname delimiters, treat as given name
            this.givenName = fullName.trim();
        }
    }

    /**
     * Check if a word looks like a name suffix
     * @param {string} word - Word to check
     * @returns {boolean} True if word looks like a suffix
     * @private
     */
    _isSuffix(word) {
        const suffixes = ['Jr', 'Jr.', 'Sr', 'Sr.', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
        return suffixes.includes(word);
    }

    /**
     * Set the full name and reparse
     * @param {string} fullName - The full name string
     */
    setFullName(fullName) {
        this.fullName = fullName || '';
        this._parseFullName(this.fullName);
    }

    /**
     * Set the given name
     * @param {string} givenName - The given name
     */
    setGivenName(givenName) {
        this.givenName = givenName || '';
    }

    /**
     * Set the surname
     * @param {string} surname - The surname
     */
    setSurname(surname) {
        this.surname = surname || '';
    }

    /**
     * Set the nickname
     * @param {string} nickname - The nickname
     */
    setNickname(nickname) {
        this.nickname = nickname || '';
    }

    /**
     * Set the name prefix
     * @param {string} prefix - The name prefix (Dr., Mr., etc.)
     */
    setNamePrefix(prefix) {
        this.namePrefix = prefix || '';
    }

    /**
     * Set the name suffix
     * @param {string} suffix - The name suffix (Jr., Sr., etc.)
     */
    setNameSuffix(suffix) {
        this.nameSuffix = suffix || '';
    }

    /**
     * Add a source reference
     * @param {string} sourceRef - The source reference
     */
    addSource(sourceRef) {
        if (sourceRef && !this.sources.includes(sourceRef)) {
            this.sources.push(sourceRef);
        }
    }

    /**
     * Add a note
     * @param {string} note - The note text
     */
    addNote(note) {
        if (note) {
            this.notes.push(note);
        }
    }

    /**
     * Set an additional attribute
     * @param {string} key - The attribute key
     * @param {string} value - The attribute value
     */
    setAttribute(key, value) {
        this.attributes[key] = value;
    }

    /**
     * Get the full name
     * @returns {string} The full name
     */
    getFullName() {
        return this.fullName;
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
     * Get the nickname
     * @returns {string} The nickname
     */
    getNickname() {
        return this.nickname;
    }

    /**
     * Get the name prefix
     * @returns {string} The name prefix
     */
    getNamePrefix() {
        return this.namePrefix;
    }

    /**
     * Get the name suffix
     * @returns {string} The name suffix
     */
    getNameSuffix() {
        return this.nameSuffix;
    }

    /**
     * Get formatted name in "Surname, Given" format
     * @returns {string} Formatted name
     */
    getFormattedName() {
        const parts = [];
        
        if (this.surname) {
            parts.push(this.surname);
        }
        
        const givenParts = [];
        if (this.namePrefix) givenParts.push(this.namePrefix);
        if (this.givenName) givenParts.push(this.givenName);
        if (this.nameSuffix) givenParts.push(this.nameSuffix);
        
        if (givenParts.length > 0) {
            if (parts.length > 0) {
                parts.push(', ');
            }
            parts.push(givenParts.join(' '));
        }
        
        return parts.join('');
    }

    /**
     * Check if name is empty
     * @returns {boolean} True if no name information
     */
    isEmpty() {
        return this.fullName === '' && 
               this.givenName === '' && 
               this.surname === '' && 
               this.nickname === '' &&
               this.namePrefix === '' &&
               this.nameSuffix === '';
    }

    /**
     * Get a string representation of the name
     * @returns {string} Name summary
     */
    toString() {
        if (this.isEmpty()) {
            return '<Empty Name>';
        }

        if (this.fullName) {
            return this.fullName;
        }

        // Construct from parts
        const parts = [];
        if (this.namePrefix) parts.push(this.namePrefix);
        if (this.givenName) parts.push(this.givenName);
        if (this.surname) parts.push(`/${this.surname}/`);
        if (this.nameSuffix) parts.push(this.nameSuffix);

        return parts.join(' ') || '<Unknown Name>';
    }

    /**
     * Create a copy of this GedName
     * @returns {GedName} A new GedName instance with the same data
     */
    clone() {
        const cloned = new GedName(this.fullName);
        cloned.givenName = this.givenName;
        cloned.surname = this.surname;
        cloned.nickname = this.nickname;
        cloned.namePrefix = this.namePrefix;
        cloned.nameSuffix = this.nameSuffix;
        cloned.sources = [...this.sources];
        cloned.notes = [...this.notes];
        cloned.attributes = { ...this.attributes };
        return cloned;
    }
}

module.exports = GedName;

/**
 * GedEvent - A class for storing GEDCOM event information
 * Contains date and place information for genealogical events
 * 
 * @author Steve Turley
 * @version 1.0.0
 */

class GedEvent {
    /**
     * Create a new GedEvent
     * @param {string} type - The event type (BIRT, DEAT, CHR, BURI, MARR, etc.)
     * @param {string} [date] - The event date
     * @param {string} [place] - The event place
     */
    constructor(type, date = '', place = '') {
        this.type = type;
        this.date = date;
        this.place = place;
        this.sources = []; // Array of source references
        this.notes = []; // Array of notes
        this.attributes = {}; // Additional attributes
    }

    /**
     * Set the event date
     * @param {string} date - The date string
     */
    setDate(date) {
        this.date = date || '';
    }

    /**
     * Set the event place
     * @param {string} place - The place string
     */
    setPlace(place) {
        this.place = place || '';
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
     * Get the event type
     * @returns {string} The event type
     */
    getType() {
        return this.type;
    }

    /**
     * Get the event date
     * @returns {string} The event date
     */
    getDate() {
        return this.date;
    }

    /**
     * Get the event place
     * @returns {string} The event place
     */
    getPlace() {
        return this.place;
    }

    /**
     * Get all sources
     * @returns {Array<string>} Array of source references
     */
    getSources() {
        return [...this.sources];
    }

    /**
     * Get all notes
     * @returns {Array<string>} Array of notes
     */
    getNotes() {
        return [...this.notes];
    }

    /**
     * Get an attribute value
     * @param {string} key - The attribute key
     * @returns {string|undefined} The attribute value
     */
    getAttribute(key) {
        return this.attributes[key];
    }

    /**
     * Check if event has date information
     * @returns {boolean} True if event has date
     */
    hasDate() {
        return this.date !== '';
    }

    /**
     * Check if event has place information
     * @returns {boolean} True if event has place
     */
    hasPlace() {
        return this.place !== '';
    }

    /**
     * Check if event is empty (no date, place, sources, or notes)
     * @returns {boolean} True if event is empty
     */
    isEmpty() {
        return this.date === '' && 
               this.place === '' && 
               this.sources.length === 0 && 
               this.notes.length === 0 &&
               Object.keys(this.attributes).length === 0;
    }

    /**
     * Get a string representation of the event
     * @returns {string} Event summary
     */
    toString() {
        if (this.isEmpty()) {
            return `<Empty ${this.type} Event>`;
        }

        let parts = [this.type];
        if (this.date) parts.push(`Date: ${this.date}`);
        if (this.place) parts.push(`Place: ${this.place}`);
        if (this.sources.length > 0) parts.push(`Sources: ${this.sources.length}`);

        return `<${parts.join(', ')}>`;
    }

    /**
     * Create a copy of this GedEvent
     * @returns {GedEvent} A new GedEvent instance with the same data
     */
    clone() {
        const cloned = new GedEvent(this.type, this.date, this.place);
        cloned.sources = [...this.sources];
        cloned.notes = [...this.notes];
        cloned.attributes = { ...this.attributes };
        return cloned;
    }
}

module.exports = GedEvent;

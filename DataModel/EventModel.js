/**
 * EventModel - A class for handling genealogical events
 * Contains a DateModel for the event date and a string for the event place
 * 
 * @author Steve Turley
 * @version 1.0.0
 */

const DateModel = require('./DateModel');

class EventModel {
    /**
     * Create a new EventModel
     * @param {DateModel} [dateModel] - Optional DateModel to set
     * @param {string} [place] - Optional place string to set
     */
    constructor(dateModel, place) {
        // Event properties
        this.date = dateModel ? dateModel.clone() : new DateModel();
        this.place = place || '';
    }

    /**
     * Check if this EventModel is empty (has default initialization values)
     * @returns {boolean} True if the EventModel has all default values
     */
    isEmpty() {
        return this.date.isEmpty() && this.place === '';
    }

    /**
     * Get a human-readable string representation
     * @returns {string} Human-readable event string with date and place
     */
    toString() {
        const dateStr = this.date.toString();
        
        if (this.isEmpty()) {
            return '<Empty>';
        }
        
        if (this.place === '') {
            return dateStr;
        }
        
        return `${dateStr} ${this.place}`;
    }

    /**
     * Create a copy of this EventModel
     * @returns {EventModel} A new EventModel instance with the same data
     */
    clone() {
        const clone = new EventModel();
        clone.date = this.date.clone();
        clone.place = this.place;
        return clone;
    }

    /**
     * Check if this event is valid (has at least a valid date or a place)
     * @returns {boolean} True if the event has valid data
     */
    isValid() {
        return this.date.isValid() || this.place !== '';
    }

    /**
     * Set the event date by parsing a date string
     * @param {string} dateString - The date string to parse
     * @throws {Error} If the date format is invalid or date values are out of range
     */
    setDate(dateString) {
        this.date.parseDateString(dateString);
    }

    /**
     * Set the event place
     * @param {string} place - The place string
     */
    setPlace(place) {
        this.place = place || '';
    }

    /**
     * Get the event date as a DateModel
     * @returns {DateModel} The date of the event
     */
    getDate() {
        return this.date;
    }

    /**
     * Get the event place
     * @returns {string} The place of the event
     */
    getPlace() {
        return this.place;
    }

    /**
     * Check if the event has an exact date
     * @returns {boolean} True if the event date is exact
     */
    hasExactDate() {
        return this.date.isExact();
    }

    /**
     * Get the event date in GEDCOM format
     * @returns {string} GEDCOM formatted date string
     */
    getDateGEDCOM() {
        return this.date.toGEDCOM();
    }

    /**
     * Get the event date in ISO format
     * @returns {string} ISO formatted date string
     */
    getDateISO() {
        return this.date.toISO();
    }

    /**
     * Get the event place with German country names translated to English
     * @returns {string} Translated place string
     */
    translatePlace() {
        let translatedPlace = this.place;
        
        // Define translation mappings
        const translations = {
            'Schweiz': 'Switzerland',
            'Frankreich': 'France',
            'Deutschland': 'Germany',
            'Österreich': 'Austria'
        };
        
        // Apply translations
        for (const [german, english] of Object.entries(translations)) {
            translatedPlace = translatedPlace.replace(new RegExp(german, 'g'), english);
        }
        
        return translatedPlace;
    }
}

module.exports = EventModel;

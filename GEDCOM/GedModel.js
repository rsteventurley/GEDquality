/**
 * GedModel - A class for storing parsed GEDCOM file information
 * Contains individuals, families, and other GEDCOM records
 * 
 * @author Steve Turley
 * @version 1.0.0
 */

const GedIndividual = require('./GedIndividual');
const GedFamily = require('./GedFamily');

class GedModel {
    /**
     * Create a new GedModel
     */
    constructor() {
        this.header = {}; // HEAD record information
        this.individuals = {}; // Dictionary indexed by individual ID (@I1@, @I2@, etc.)
        this.families = {}; // Dictionary indexed by family ID (@F1@, @F2@, etc.)
        this.sources = {}; // Dictionary indexed by source ID (@S1@, @S2@, etc.)
        this.notes = {}; // Dictionary indexed by note ID (@N1@, @N2@, etc.)
        this.submitters = {}; // Dictionary indexed by submitter ID (@SUBM1@, etc.)
        this.repositories = {}; // Dictionary indexed by repository ID (@R1@, @R2@, etc.)
        this.trailer = {}; // TRLR record information
        this.unknownRecords = []; // Array for any unrecognized records
    }

    /**
     * Add an individual record
     * @param {string} id - The individual ID (e.g., "@I1@")
     * @param {Object} individual - The individual record data
     */
    addIndividual(id, individual) {
        // Convert raw GEDCOM record to GedIndividual
        if (individual && typeof individual === 'object' && individual.tag === 'INDI') {
            this.individuals[id] = GedIndividual.fromGedcomRecord(individual);
        } else {
            // Fallback to raw data if not a proper GEDCOM record
            this.individuals[id] = individual;
        }
    }

    /**
     * Add a family record
     * @param {string} id - The family ID (e.g., "@F1@")
     * @param {Object} family - The family record data
     */
    addFamily(id, family) {
        // Convert raw GEDCOM record to GedFamily
        if (family && typeof family === 'object' && family.tag === 'FAM') {
            this.families[id] = GedFamily.fromGedcomRecord(family);
        } else {
            // Fallback to raw data if not a proper GEDCOM record
            this.families[id] = family;
        }
    }

    /**
     * Add a source record
     * @param {string} id - The source ID (e.g., "@S1@")
     * @param {Object} source - The source record data
     */
    addSource(id, source) {
        this.sources[id] = source;
    }

    /**
     * Add a note record
     * @param {string} id - The note ID (e.g., "@N1@")
     * @param {Object} note - The note record data
     */
    addNote(id, note) {
        this.notes[id] = note;
    }

    /**
     * Add a submitter record
     * @param {string} id - The submitter ID (e.g., "@SUBM1@")
     * @param {Object} submitter - The submitter record data
     */
    addSubmitter(id, submitter) {
        this.submitters[id] = submitter;
    }

    /**
     * Add a repository record
     * @param {string} id - The repository ID (e.g., "@R1@")
     * @param {Object} repository - The repository record data
     */
    addRepository(id, repository) {
        this.repositories[id] = repository;
    }

    /**
     * Set the header information
     * @param {Object} header - The header record data
     */
    setHeader(header) {
        this.header = header;
    }

    /**
     * Set the trailer information
     * @param {Object} trailer - The trailer record data
     */
    setTrailer(trailer) {
        this.trailer = trailer;
    }

    /**
     * Add an unknown record
     * @param {Object} record - The unknown record data
     */
    addUnknownRecord(record) {
        this.unknownRecords.push(record);
    }

    /**
     * Get an individual by ID
     * @param {string} id - The individual ID
     * @returns {GedIndividual|Object|null} The individual model or record, or null if not found
     */
    getIndividual(id) {
        return this.individuals[id] || null;
    }

    /**
     * Get a family by ID
     * @param {string} id - The family ID
     * @returns {GedFamily|Object|null} The family model or record, or null if not found
     */
    getFamily(id) {
        return this.families[id] || null;
    }

    /**
     * Get a source by ID
     * @param {string} id - The source ID
     * @returns {Object|null} The source record or null if not found
     */
    getSource(id) {
        return this.sources[id] || null;
    }

    /**
     * Get all individuals
     * @returns {Object} Dictionary of all individuals (as GedIndividual instances)
     */
    getIndividuals() {
        return { ...this.individuals };
    }

    /**
     * Get all families
     * @returns {Object} Dictionary of all families (as GedFamily instances)
     */
    getFamilies() {
        return { ...this.families };
    }

    /**
     * Get all sources
     * @returns {Object} Dictionary of all sources
     */
    getSources() {
        return { ...this.sources };
    }

    /**
     * Get the count of individuals
     * @returns {number} Number of individuals
     */
    getIndividualCount() {
        return Object.keys(this.individuals).length;
    }

    /**
     * Get the count of families
     * @returns {number} Number of families
     */
    getFamilyCount() {
        return Object.keys(this.families).length;
    }

    /**
     * Get the count of sources
     * @returns {number} Number of sources
     */
    getSourceCount() {
        return Object.keys(this.sources).length;
    }

    /**
     * Check if the model is empty
     * @returns {boolean} True if no records have been added
     */
    isEmpty() {
        return Object.keys(this.individuals).length === 0 &&
               Object.keys(this.families).length === 0 &&
               Object.keys(this.sources).length === 0 &&
               Object.keys(this.notes).length === 0 &&
               Object.keys(this.submitters).length === 0 &&
               Object.keys(this.repositories).length === 0;
    }

    /**
     * Get a summary of the GEDCOM data
     * @returns {Object} Summary information
     */
    getSummary() {
        return {
            individuals: this.getIndividualCount(),
            families: this.getFamilyCount(),
            sources: this.getSourceCount(),
            notes: Object.keys(this.notes).length,
            submitters: Object.keys(this.submitters).length,
            repositories: Object.keys(this.repositories).length,
            unknownRecords: this.unknownRecords.length
        };
    }

    /**
     * Get all individuals as GedIndividual instances
     * @returns {Array<GedIndividual>} Array of GedIndividual instances
     */
    getIndividualModels() {
        return Object.values(this.individuals).filter(ind => ind instanceof GedIndividual);
    }

    /**
     * Get all families as GedFamily instances
     * @returns {Array<GedFamily>} Array of GedFamily instances
     */
    getFamilyModels() {
        return Object.values(this.families).filter(fam => fam instanceof GedFamily);
    }

    /**
     * Get individual by numeric ID (extracts from GEDCOM format)
     * @param {number} numericId - The numeric ID (e.g., 123 for @I123@)
     * @returns {GedIndividual|Object|null} The individual model or null if not found
     */
    getIndividualByNumericId(numericId) {
        const gedcomId = `@I${numericId}@`;
        return this.getIndividual(gedcomId);
    }

    /**
     * Get family by numeric ID (extracts from GEDCOM format)
     * @param {number} numericId - The numeric ID (e.g., 456 for @F456@)
     * @returns {GedFamily|Object|null} The family model or null if not found
     */
    getFamilyByNumericId(numericId) {
        const gedcomId = `@F${numericId}@`;
        return this.getFamily(gedcomId);
    }

    /**
     * Convert all existing raw records to model instances
     * Useful for converting data loaded from older formats
     */
    convertToModels() {
        // Convert individuals
        for (const [id, individual] of Object.entries(this.individuals)) {
            if (!(individual instanceof GedIndividual) && individual && typeof individual === 'object') {
                this.individuals[id] = GedIndividual.fromGedcomRecord(individual);
            }
        }

        // Convert families
        for (const [id, family] of Object.entries(this.families)) {
            if (!(family instanceof GedFamily) && family && typeof family === 'object') {
                this.families[id] = GedFamily.fromGedcomRecord(family);
            }
        }
    }

    /**
     * Get a string representation of the model
     * @returns {string} Summary string
     */
    toString() {
        if (this.isEmpty()) {
            return '<Empty GedModel>';
        }

        const summary = this.getSummary();
        return `<GedModel: ${summary.individuals} individuals, ${summary.families} families, ${summary.sources} sources>`;
    }

    /**
     * Convert this GedModel to a PageModel
     * @returns {PageModel} A new PageModel instance with converted data
     */
    toPageModel() {
        const PageModel = require('../DataModel/PageModel');
        const pageModel = new PageModel();

        // First, iterate through the individuals attribute
        for (const [gedcomId, individual] of Object.entries(this.individuals)) {
            if (individual instanceof GedIndividual) {
                // Extract numeric ID from GEDCOM format (@I123@ -> 123)
                const match = gedcomId.match(/@I(\d+)@/);
                if (match) {
                    const personId = parseInt(match[1]);
                    
                    // Convert GedIndividual to PersonModel
                    const personModel = individual.toPersonModel();
                    
                    try {
                        // Add PersonModel to PageModel
                        pageModel.addPerson(personModel, personId);
                    } catch (error) {
                        console.warn(`Failed to add person ${personId}: ${error.message}`);
                    }
                }
            }
        }

        // Next, iterate through the families attribute
        for (const [gedcomId, family] of Object.entries(this.families)) {
            if (family instanceof GedFamily) {
                // Extract numeric ID from GEDCOM format (@F456@ -> 456)
                const match = gedcomId.match(/@F(\d+)@/);
                if (match) {
                    const familyId = parseInt(match[1]);
                    
                    // Convert GedFamily to FamilyModel
                    const familyModel = family.toFamilyModel();
                    
                    try {
                        // Add FamilyModel to PageModel
                        pageModel.addFamily(familyModel, familyId);
                    } catch (error) {
                        console.warn(`Failed to add family ${familyId}: ${error.message}`);
                    }
                }
            }
        }

        return pageModel;
    }
}

module.exports = GedModel;

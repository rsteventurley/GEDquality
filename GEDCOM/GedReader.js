/**
 * GedReader - A class for reading and parsing GEDCOM files
 * Parses GEDCOM format genealogical data files
 * 
 * @author Steve Turley
 * @version 1.0.0
 */

const fs = require('fs');
const path = require('path');
const GedModel = require('./GedModel');
const GedEvent = require('./GedEvent');
const GedName = require('./GedName');

class GedReader {
    /**
     * Create a new GedReader
     */
    constructor() {
        this.gedModel = null;
    }

    /**
     * Read and parse a GEDCOM file
     * @param {string} filePath - Path to the GEDCOM file
     * @returns {GedModel} The parsed GEDCOM data model
     * @throws {Error} If file cannot be read or parsed
     */
    read(filePath) {
        try {
            // Check if file exists
            if (!fs.existsSync(filePath)) {
                throw new Error(`GEDCOM file not found: ${filePath}`);
            }

            // Read the file content
            const content = fs.readFileSync(filePath, 'utf8');
            
            // Create new GedModel to store parsed data
            this.gedModel = new GedModel();

            // Parse the content
            this._parseContent(content);

            return this.gedModel;

        } catch (error) {
            throw new Error(`Error reading GEDCOM file: ${error.message}`);
        }
    }

    /**
     * Parse the GEDCOM file content
     * @param {string} content - The file content to parse
     * @private
     */
    _parseContent(content) {
        // Split content into lines and filter out empty lines
        const lines = content.split(/\r?\n/).filter(line => line.trim() !== '');
        
        let records = [];
        let currentRecord = null;
        let stack = []; // Stack to track nested levels

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const parsedLine = this._parseLine(line, i + 1);
            
            if (!parsedLine) continue;

            const { level, tag, value, id } = parsedLine;

            const newRecord = {
                level: level,
                tag: tag,
                value: value,
                id: id,
                children: []
            };

            if (level === 0) {
                // Top-level record
                if (currentRecord) {
                    records.push(currentRecord);
                }
                currentRecord = newRecord;
                stack = [currentRecord];
            } else {
                // Find the correct parent based on level
                while (stack.length > level) {
                    stack.pop();
                }
                
                if (stack.length > 0) {
                    stack[stack.length - 1].children.push(newRecord);
                }
                
                stack.push(newRecord);
            }
        }

        // Add the last record
        if (currentRecord) {
            records.push(currentRecord);
        }

        // Process all records
        for (const record of records) {
            this._saveRecord(record);
        }
    }

    /**
     * Parse a single GEDCOM line
     * @param {string} line - The line to parse
     * @param {number} lineNumber - Line number for error reporting
     * @returns {Object|null} Parsed line data or null if invalid
     * @private
     */
    _parseLine(line, lineNumber) {
        const trimmed = line.trim();
        if (trimmed === '') return null;

        // GEDCOM line format: LEVEL [ID] TAG [VALUE]
        // Examples:
        // 0 @I1@ INDI
        // 1 NAME John /Doe/
        // 2 GIVN John

        const parts = trimmed.split(' ');
        if (parts.length < 2) {
            console.warn(`Warning: Invalid GEDCOM line ${lineNumber}: ${line}`);
            return null;
        }

        const level = parseInt(parts[0]);
        if (isNaN(level)) {
            console.warn(`Warning: Invalid level on line ${lineNumber}: ${line}`);
            return null;
        }

        let tag, value, id;

        // Check if second part is an ID (starts and ends with @)
        if (parts[1].startsWith('@') && parts[1].endsWith('@')) {
            id = parts[1];
            tag = parts[2] || '';
            value = parts.slice(3).join(' ');
        } else {
            tag = parts[1];
            value = parts.slice(2).join(' ');
            id = null;
        }

        return {
            level: level,
            tag: tag,
            value: value,
            id: id
        };
    }

    /**
     * Save a parsed record to the appropriate collection in GedModel
     * @param {Object} record - The record to save
     * @private
     */
    _saveRecord(record) {
        switch (record.tag) {
            case 'HEAD':
                this.gedModel.setHeader(record);
                break;
            case 'TRLR':
                this.gedModel.setTrailer(record);
                break;
            case 'INDI':
                if (record.id) {
                    // Process individual with events, names, and special handling
                    this._processIndividual(record);
                    this.gedModel.addIndividual(record.id, record);
                }
                break;
            case 'FAM':
                if (record.id) {
                    // Process family with marriage events
                    this._processFamily(record);
                    this.gedModel.addFamily(record.id, record);
                }
                break;
            case 'SOUR':
                if (record.id) {
                    this.gedModel.addSource(record.id, record);
                }
                break;
            case 'NOTE':
                if (record.id) {
                    this.gedModel.addNote(record.id, record);
                }
                break;
            case 'SUBM':
                if (record.id) {
                    this.gedModel.addSubmitter(record.id, record);
                }
                break;
            case 'REPO':
                if (record.id) {
                    this.gedModel.addRepository(record.id, record);
                }
                break;
            default:
                // Store unknown records (silently ignore unknown record types)
                this.gedModel.addUnknownRecord(record);
                break;
        }
    }

    /**
     * Process special SOUR entries under INDI records
     * These require special treatment as mentioned in the requirements
     * @param {Object} individualRecord - The individual record to process
     * @private
     */
    _processIndividualSources(individualRecord) {
        if (!individualRecord.children) return;

        // Find all SOUR entries in the individual record
        const sourceEntries = individualRecord.children.filter(child => child.tag === 'SOUR');
        
        for (const sourceEntry of sourceEntries) {
            // Special processing for SOUR entries under INDI
            // Mark them as individual-specific sources
            sourceEntry.parentType = 'INDI';
            sourceEntry.parentId = individualRecord.id;
            
            // You can add additional special processing here
            // For example, extracting page numbers, confidence levels, etc.
            if (sourceEntry.children) {
                for (const subEntry of sourceEntry.children) {
                    if (subEntry.tag === 'PAGE') {
                        sourceEntry.page = subEntry.value;
                    } else if (subEntry.tag === 'QUAY') {
                        sourceEntry.quality = subEntry.value;
                    } else if (subEntry.tag === 'DATA') {
                        sourceEntry.data = subEntry;
                    }
                }
            }
        }
    }

    /**
     * Get the last parsed GedModel
     * @returns {GedModel|null} The parsed model or null if none
     */
    getGedModel() {
        return this.gedModel;
    }

    /**
     * Process an individual record to extract events and names
     * @param {Object} record - The individual record
     * @private
     */
    _processIndividual(record) {
        // Handle special SOUR entries under INDI (existing functionality)
        this._processIndividualSources(record);
        
        // Initialize collections
        record.events = record.events || [];
        record.names = record.names || [];
        
        // Process children to extract events and names
        if (record.children) {
            for (let child of record.children) {
                // Process names
                if (child.tag === 'NAME') {
                    const gedName = new GedName(child.value);
                    record.names.push(gedName);
                }
                
                // Process events
                if (['BIRT', 'DEAT', 'CHR', 'BURI'].includes(child.tag)) {
                    const gedEvent = new GedEvent(child.tag);
                    this._populateEventFromRecord(gedEvent, child);
                    record.events.push(gedEvent);
                }
                
                // Handle cref events with special string array storage
                if (child.tag === 'cref') {
                    if (!record.crefs) {
                        record.crefs = [];
                    }
                    record.crefs.push(child.value || '');
                }
            }
        }
    }

    /**
     * Process a family record to extract marriage events
     * @param {Object} record - The family record
     * @private
     */
    _processFamily(record) {
        // Initialize events collection
        record.events = record.events || [];
        
        // Process children to extract marriage events
        if (record.children) {
            for (let child of record.children) {
                if (child.tag === 'MARR') {
                    const gedEvent = new GedEvent('MARR');
                    this._populateEventFromRecord(gedEvent, child);
                    record.events.push(gedEvent);
                }
            }
        }
    }

    /**
     * Populate a GedEvent from a GEDCOM record
     * @param {GedEvent} gedEvent - The event to populate
     * @param {Object} record - The GEDCOM record containing event data
     * @private
     */
    _populateEventFromRecord(gedEvent, record) {
        // Process event children for date, place, sources, notes
        if (record.children) {
            for (let child of record.children) {
                switch (child.tag) {
                    case 'DATE':
                        gedEvent.setDate(child.value);
                        break;
                    case 'PLAC':
                        gedEvent.setPlace(child.value);
                        break;
                    case 'SOUR':
                        gedEvent.addSource(child.value, {
                            parentType: record.tag,
                            parentId: record.id || 'unknown'
                        });
                        break;
                    case 'NOTE':
                        gedEvent.addNote(child.value);
                        break;
                    default:
                        // Store other attributes
                        gedEvent.setAttribute(child.tag, child.value);
                        break;
                }
            }
        }
    }

    /**
     * Get statistics about the last parsed file
     * @returns {Object|null} Statistics or null if no file parsed
     */
    getStatistics() {
        if (!this.gedModel) return null;
        return this.gedModel.getSummary();
    }

    /**
     * Validate that a file appears to be a valid GEDCOM file
     * @param {string} filePath - Path to the file to validate
     * @returns {boolean} True if file appears to be GEDCOM format
     * @throws {Error} If file cannot be read
     */
    validateGedcomFile(filePath) {
        try {
            if (!fs.existsSync(filePath)) {
                throw new Error(`File not found: ${filePath}`);
            }

            // Read first few lines to check for GEDCOM header
            const content = fs.readFileSync(filePath, 'utf8');
            const lines = content.split(/\r?\n/).slice(0, 10);

            // Look for GEDCOM header pattern
            for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed.startsWith('0 HEAD') || trimmed === '0 HEAD') {
                    return true;
                }
            }

            return false;

        } catch (error) {
            throw new Error(`Error validating GEDCOM file: ${error.message}`);
        }
    }
}

module.exports = GedReader;

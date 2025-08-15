/**
 * XmlReader - A class for reading and parsing XML genealogical files
 * Parses XML format genealogical data files into structured objects
 * 
 * @author Steve Turley
 * @version 1.0.0
 */

const fs = require('fs');
const xml2js = require('xml2js');
const XmlModel = require('./XmlModel');
const XmlEntry = require('./XmlEntry');
const XmlPerson = require('./XmlPerson');
const XmlFamily = require('./XmlFamily');
const XmlEvent = require('./XmlEvent');
const XmlName = require('./XmlName');
const XmlDate = require('./XmlDate');

class XmlReader {
    /**
     * Create a new XmlReader
     */
    constructor() {
        this.parser = new xml2js.Parser({
            explicitArray: false,
            mergeAttrs: true,
            explicitRoot: false,
            trim: true
        });
    }

    /**
     * Read and parse an XML file
     * @param {string} filePath - Path to the XML file
     * @returns {Promise<XmlModel>} The parsed XML data model
     * @throws {Error} If file cannot be read or parsed
     */
    async readXml(filePath) {
        try {
            // Check if file exists
            if (!fs.existsSync(filePath)) {
                throw new Error(`XML file not found: ${filePath}`);
            }

            // Read the file content
            const content = fs.readFileSync(filePath, 'utf8');
            
            // Parse the XML content
            const parsedData = await this.parser.parseStringPromise(content);

            // Create and populate XmlModel
            const xmlModel = new XmlModel();
            
            // Process the parsed data
            this._processXmlData(parsedData, xmlModel);

            return xmlModel;

        } catch (error) {
            throw new Error(`Error reading XML file: ${error.message}`);
        }
    }

    /**
     * Process the parsed XML data and populate the XmlModel
     * @param {Object} parsedData - Parsed XML data from xml2js
     * @param {XmlModel} xmlModel - XmlModel to populate
     * @private
     */
    _processXmlData(parsedData, xmlModel) {
        // Handle the root <record> element
        let recordData = parsedData;
        if (parsedData.record) {
            recordData = parsedData.record;
        }
        
        // Handle both single entry and multiple entries
        let entries = [];
        
        if (recordData.entry) {
            // If there's a single entry, convert to array
            if (Array.isArray(recordData.entry)) {
                entries = recordData.entry;
            } else {
                entries = [recordData.entry];
            }
        }

        // Process each entry
        for (const entryData of entries) {
            const xmlEntry = this._processEntry(entryData);
            xmlModel.addXmlEntry(xmlEntry);
        }
    }

    /**
     * Process a single entry element
     * @param {Object} entryData - Entry data from parsed XML
     * @returns {XmlEntry} Processed XmlEntry object
     * @private
     */
    _processEntry(entryData) {
        const id = entryData.id || '';
        const surname = entryData.surname || '';
        
        const xmlEntry = new XmlEntry(id, surname);

        // Process people
        if (entryData.person) {
            const people = Array.isArray(entryData.person) ? entryData.person : [entryData.person];
            for (const personData of people) {
                const xmlPerson = this._processPerson(personData);
                xmlEntry.addPerson(xmlPerson);
            }
        }

        // Process families
        if (entryData.family) {
            const families = Array.isArray(entryData.family) ? entryData.family : [entryData.family];
            for (const familyData of families) {
                const xmlFamily = this._processFamily(familyData);
                xmlEntry.addFamily(xmlFamily);
            }
        }

        return xmlEntry;
    }

    /**
     * Process a single person element
     * @param {Object} personData - Person data from parsed XML
     * @returns {XmlPerson} Processed XmlPerson object
     * @private
     */
    _processPerson(personData) {
        const id = personData.id || '';
        const sex = personData.sex || '';
        const occupation = personData.occupation || '';

        const xmlPerson = new XmlPerson(id, sex);
        xmlPerson.setOccupation(occupation);

        // Process name
        if (personData.name) {
            const xmlName = this._processName(personData.name);
            xmlPerson.setName(xmlName);
        }

        // Process events
        if (personData.event) {
            const events = Array.isArray(personData.event) ? personData.event : [personData.event];
            for (const eventData of events) {
                const xmlEvent = this._processEvent(eventData);
                
                // Set the appropriate event based on type
                switch (xmlEvent.getType().toLowerCase()) {
                    case 'birth':
                        xmlPerson.setBirth(xmlEvent);
                        break;
                    case 'christening':
                    case 'baptism':
                        xmlPerson.setChristening(xmlEvent);
                        break;
                    case 'death':
                        xmlPerson.setDeath(xmlEvent);
                        break;
                    case 'burial':
                        xmlPerson.setBurial(xmlEvent);
                        break;
                }
            }
        }

        // Process references (xref elements)
        if (personData.xref) {
            const xrefs = Array.isArray(personData.xref) ? personData.xref : [personData.xref];
            for (const xref of xrefs) {
                xmlPerson.addReference(String(xref));
            }
        }

        return xmlPerson;
    }

    /**
     * Process a single family element
     * @param {Object} familyData - Family data from parsed XML
     * @returns {XmlFamily} Processed XmlFamily object
     * @private
     */
    _processFamily(familyData) {
        const father = familyData.father || '';
        const mother = familyData.mother || '';
        
        const xmlFamily = new XmlFamily(father, mother);

        // Process children
        if (familyData.child) {
            const children = Array.isArray(familyData.child) ? familyData.child : [familyData.child];
            for (const child of children) {
                xmlFamily.addChild(String(child));
            }
        }

        // Process marriage event
        if (familyData.event) {
            const events = Array.isArray(familyData.event) ? familyData.event : [familyData.event];
            for (const eventData of events) {
                if (eventData.type && eventData.type.toLowerCase() === 'marriage') {
                    const xmlEvent = this._processEvent(eventData);
                    xmlFamily.setMarriage(xmlEvent);
                    break;
                }
            }
        }

        return xmlFamily;
    }

    /**
     * Process a single name element
     * @param {Object} nameData - Name data from parsed XML
     * @returns {XmlName} Processed XmlName object
     * @private
     */
    _processName(nameData) {
        const orig = nameData.orig || '';
        const given = nameData.given || '';
        const surname = nameData.surname || '';

        return new XmlName(orig, given, surname);
    }

    /**
     * Process a single event element
     * @param {Object} eventData - Event data from parsed XML
     * @returns {XmlEvent} Processed XmlEvent object
     * @private
     */
    _processEvent(eventData) {
        const type = eventData.type || '';
        const place = eventData.place || '';

        let xmlDate = new XmlDate();
        
        // Process date if present
        if (eventData.date) {
            const orig = eventData.date.orig || '';
            const std = eventData.date.std || '';
            xmlDate = new XmlDate(orig, std);
        }

        return new XmlEvent(type, xmlDate, place);
    }
}

module.exports = XmlReader;

/**
 * GedcomIntegrityChecker - Validates internal integrity of GEDCOM files
 * Checks for data consistency, completeness, and validity
 *
 * @author Steve Turley
 * @version 1.0.0
 */

const { createDefaultGivenNames } = require('./names');

class GedcomIntegrityChecker {
    /**
     * Create a new GedcomIntegrityChecker
     * @param {GedModel} gedModel - The parsed GEDCOM model to check
     */
    constructor(gedModel) {
        this.gedModel = gedModel;
        this.warnings = [];
        this.errors = [];
        this.givenNames = createDefaultGivenNames();
    }

    /**
     * Run all integrity checks
     * @returns {Object} Comprehensive integrity report
     */
    checkIntegrity() {
        this.warnings = [];
        this.errors = [];

        // Run all checks
        this.checkPeopleFamilyMembership();
        this.checkPageConsistency();
        this.checkDateFormats();
        this.checkDateConsistency();
        this.checkGivenNames();
        this.checkGenderConsistency();
        this.checkSourceReferences();
        this.checkSurnameConsistency();

        // Generate summary
        const summary = this.generateSummary();

        return {
            summary,
            warnings: [...this.warnings],
            errors: [...this.errors],
            hasIssues: this.warnings.length > 0 || this.errors.length > 0
        };
    }

    /**
     * Check that each person is in at least one family
     */
    checkPeopleFamilyMembership() {
        const individuals = this.gedModel.getIndividuals();
        const families = this.gedModel.getFamilies();

        // Build a set of all people referenced in families
        const peopleInFamilies = new Set();

        for (const [famId, family] of Object.entries(families)) {
            if (family.father > 0) peopleInFamilies.add(family.father);
            if (family.mother > 0) peopleInFamilies.add(family.mother);
            for (const childId of family.children) {
                peopleInFamilies.add(childId);
            }
        }

        // Check each individual
        for (const [gedcomId, individual] of Object.entries(individuals)) {
            const match = gedcomId.match(/@I(\d+)@/);
            if (!match) continue;

            const personId = parseInt(match[1]);
            const entryLabel = this.getEntryLabel(individual);

            // Check if person is in at least one family
            if (!peopleInFamilies.has(personId)) {
                // Only allow this if the person is the only one in their entry
                if (this.isOnlyPersonInEntry(entryLabel)) {
                    // This is OK - single person entry
                } else {
                    this.warnings.push({
                        type: 'family_membership',
                        personId: gedcomId,
                        personName: individual.name ? individual.name.toString() : 'Unknown',
                        entry: entryLabel,
                        message: `Person ${this.formatPersonIdForError(individual)} (${gedcomId}) is not in any family`
                    });
                }
            }
        }
    }

    /**
     * Check that all people are on the same page (from SOUR records)
     */
    checkPageConsistency() {
        const individuals = this.gedModel.getIndividuals();
        const pages = new Set();
        const peopleByPage = {};

        for (const [gedcomId, individual] of Object.entries(individuals)) {
            const page = this.getPageFromSource(individual);
            if (page) {
                pages.add(page);
                if (!peopleByPage[page]) {
                    peopleByPage[page] = [];
                }
                peopleByPage[page].push({
                    id: gedcomId,
                    name: this.formatPersonName(individual)
                });
            }
        }

        if (pages.size > 1) {
            this.warnings.push({
                type: 'page_consistency',
                message: `People are from ${pages.size} different pages: ${Array.from(pages).join(', ')}`,
                details: peopleByPage
            });
        }
    }

    /**
     * Check that dates are valid GEDCOM dates and properly formatted
     */
    checkDateFormats() {
        const individuals = this.gedModel.getIndividuals();
        const families = this.gedModel.getFamilies();

        // Check individual events
        for (const [gedcomId, individual] of Object.entries(individuals)) {
            if (individual.birth && individual.birth.date) {
                this.validateDateFormat(gedcomId, individual, 'birth', individual.birth.date);
            }
            if (individual.death && individual.death.date) {
                this.validateDateFormat(gedcomId, individual, 'death', individual.death.date);
            }
            if (individual.christening && individual.christening.date) {
                this.validateDateFormat(gedcomId, individual, 'christening', individual.christening.date);
            }
            if (individual.burial && individual.burial.date) {
                this.validateDateFormat(gedcomId, individual, 'burial', individual.burial.date);
            }
        }

        // Check family events
        for (const [famId, family] of Object.entries(families)) {
            if (family.marriage && family.marriage.date) {
                this.validateDateFormat(famId, null, 'marriage', family.marriage.date);
            }
        }
    }

    /**
     * Check date consistency (birth before death, children after parents' marriage, etc.)
     */
    checkDateConsistency() {
        const individuals = this.gedModel.getIndividuals();
        const families = this.gedModel.getFamilies();

        // Check individual date consistency
        for (const [gedcomId, individual] of Object.entries(individuals)) {
            this.checkPersonDateConsistency(gedcomId, individual);
        }

        // Check family date consistency
        for (const [famId, family] of Object.entries(families)) {
            this.checkFamilyDateConsistency(famId, family);
        }
    }

    /**
     * Check that given names are common for the region
     */
    checkGivenNames() {
        const individuals = this.gedModel.getIndividuals();

        for (const [gedcomId, individual] of Object.entries(individuals)) {
            if (!individual.name) continue;

            const givenName = individual.name.given || '';
            if (!givenName) continue;

            // Split compound names and check the first part
            const firstGiven = givenName.split(/[\s-]+/)[0];

            if (!this.givenNames.isCommon(firstGiven)) {
                this.warnings.push({
                    type: 'unusual_given_name',
                    personId: gedcomId,
                    personName: this.formatPersonName(individual),
                    entry: this.getEntryLabel(individual),
                    givenName: firstGiven,
                    message: `Unusual given name: "${firstGiven}" for ${this.formatPersonIdForError(individual)}`
                });
            }
        }
    }

    /**
     * Check that gender matches given name
     */
    checkGenderConsistency() {
        const individuals = this.gedModel.getIndividuals();

        for (const [gedcomId, individual] of Object.entries(individuals)) {
            if (!individual.name || !individual.gender) continue;

            const givenName = individual.name.given || '';
            if (!givenName) continue;

            // Split compound names and check the first part
            const firstGiven = givenName.split(/[\s-]+/)[0];

            const matchResult = this.givenNames.matchesGender(firstGiven, individual.gender);

            if (matchResult === false) {
                // Gender mismatch
                const expectedGender = this.givenNames.getExpectedGender(firstGiven);
                this.warnings.push({
                    type: 'gender_mismatch',
                    personId: gedcomId,
                    personName: this.formatPersonName(individual),
                    entry: this.getEntryLabel(individual),
                    givenName: firstGiven,
                    recordedGender: individual.gender,
                    expectedGender: expectedGender,
                    message: `Gender mismatch for ${this.formatPersonIdForError(individual)}: "${firstGiven}" is typically ${expectedGender === 'M' ? 'male' : 'female'}, but person is marked as ${individual.gender}`
                });
            }
        }
    }

    /**
     * Check that each person has a SOUR record with entry label
     */
    checkSourceReferences() {
        const individuals = this.gedModel.getIndividuals();

        for (const [gedcomId, individual] of Object.entries(individuals)) {
            const entryLabel = this.getEntryLabel(individual);

            if (!entryLabel) {
                this.warnings.push({
                    type: 'missing_source',
                    personId: gedcomId,
                    personName: this.formatPersonName(individual),
                    message: `Person ${this.formatPersonIdForError(individual)} (${gedcomId}) has no SOUR record with entry label`
                });
            }
        }
    }

    /**
     * Check surname consistency within families
     */
    checkSurnameConsistency() {
        const families = this.gedModel.getFamilies();
        const individuals = this.gedModel.getIndividuals();

        for (const [famId, family] of Object.entries(families)) {
            const father = this.gedModel.getIndividualByNumericId(family.father);
            const childSurnames = new Set();
            let fatherSurname = null;

            if (father && father.name) {
                fatherSurname = father.name.surname;
            }

            // Check each child's surname
            for (const childId of family.children) {
                const child = this.gedModel.getIndividualByNumericId(childId);
                if (child && child.name && child.name.surname) {
                    childSurnames.add(child.name.surname);

                    // Check against father's surname
                    if (fatherSurname && child.name.surname !== fatherSurname) {
                        const childEntry = this.getEntryLabel(child);
                        const fatherEntry = this.getEntryLabel(father);
                        this.warnings.push({
                            type: 'surname_mismatch',
                            familyId: famId,
                            childId: `@I${childId}@`,
                            childName: this.formatPersonName(child),
                            childSurname: child.name.surname,
                            fatherName: father ? this.formatPersonName(father) : 'Unknown',
                            fatherSurname: fatherSurname,
                            entry: childEntry,
                            message: `Child ${this.formatPersonIdForError(child)} has surname "${child.name.surname}" different from father's "${fatherSurname}" [Family: ${famId}, Entry: ${childEntry || fatherEntry || 'unknown'}]`
                        });
                    }
                }
            }

            // Check for inconsistent surnames among children
            if (childSurnames.size > 1) {
                const childNames = family.children.map(id => {
                    const child = this.gedModel.getIndividualByNumericId(id);
                    return child ? `${this.formatPersonName(child)} (${child.name.surname})` : 'Unknown';
                });

                // Get entry label from father or first child
                let entryLabel = '';
                if (father) {
                    entryLabel = this.getEntryLabel(father);
                } else if (family.children.length > 0) {
                    const firstChild = this.gedModel.getIndividualByNumericId(family.children[0]);
                    if (firstChild) {
                        entryLabel = this.getEntryLabel(firstChild);
                    }
                }

                this.warnings.push({
                    type: 'inconsistent_child_surnames',
                    familyId: famId,
                    surnames: Array.from(childSurnames),
                    children: childNames,
                    message: `Children in family ${famId} [Entry: ${entryLabel || 'unknown'}] have inconsistent surnames: ${Array.from(childSurnames).join(', ')}`
                });
            }
        }
    }

    /**
     * Helper: Check person date consistency
     */
    checkPersonDateConsistency(gedcomId, individual) {
        const birthDate = this.parseDate(individual.birth?.date);
        const deathDate = this.parseDate(individual.death?.date);

        // Check birth before death
        if (birthDate && deathDate && birthDate > deathDate) {
            this.warnings.push({
                type: 'birth_after_death',
                personId: gedcomId,
                personName: this.formatPersonName(individual),
                entry: this.getEntryLabel(individual),
                birthDate: individual.birth.date,
                deathDate: individual.death.date,
                message: `Person born after death: ${this.formatPersonIdForError(individual)}`
            });
        }

        // Check lifespan (more than 120 years)
        if (birthDate && deathDate) {
            const years = (deathDate - birthDate) / (365.25 * 24 * 60 * 60 * 1000);
            if (years > 120) {
                this.warnings.push({
                    type: 'excessive_lifespan',
                    personId: gedcomId,
                    personName: this.formatPersonName(individual),
                    entry: this.getEntryLabel(individual),
                    birthDate: individual.birth.date,
                    deathDate: individual.death.date,
                    years: Math.round(years),
                    message: `Unlikely lifespan of ${Math.round(years)} years for ${this.formatPersonIdForError(individual)}`
                });
            }
        }
    }

    /**
     * Helper: Check family date consistency
     */
    checkFamilyDateConsistency(famId, family) {
        const marriageDate = this.parseDate(family.marriage?.date);
        const father = this.gedModel.getIndividualByNumericId(family.father);
        const mother = this.gedModel.getIndividualByNumericId(family.mother);

        for (const childId of family.children) {
            const child = this.gedModel.getIndividualByNumericId(childId);
            if (!child) continue;

            const childBirthDate = this.parseDate(child.birth?.date);

            // Check child born before marriage
            if (childBirthDate && marriageDate && childBirthDate < marriageDate) {
                const entryLabel = this.getEntryLabel(child) || this.getEntryLabel(father) || this.getEntryLabel(mother);
                this.warnings.push({
                    type: 'child_before_marriage',
                    familyId: famId,
                    childId: `@I${childId}@`,
                    childName: this.formatPersonName(child),
                    entry: this.getEntryLabel(child),
                    childBirthDate: child.birth.date,
                    marriageDate: family.marriage.date,
                    message: `Child ${this.formatPersonIdForError(child)} born before parents' marriage [Family: ${famId}, Entry: ${entryLabel || 'unknown'}]`
                });
            }

            // Check child born after mother's death
            if (mother && childBirthDate) {
                const motherDeathDate = this.parseDate(mother.death?.date);
                if (motherDeathDate && childBirthDate > motherDeathDate) {
                    const entryLabel = this.getEntryLabel(child) || this.getEntryLabel(mother);
                    this.warnings.push({
                        type: 'child_after_mother_death',
                        familyId: famId,
                        childId: `@I${childId}@`,
                        childName: this.formatPersonName(child),
                        entry: this.getEntryLabel(child),
                        childBirthDate: child.birth.date,
                        motherDeathDate: mother.death.date,
                        message: `Child ${this.formatPersonIdForError(child)} born after mother's death [Family: ${famId}, Entry: ${entryLabel || 'unknown'}]`
                    });
                }

                // Check mother's age at child's birth
                const motherBirthDate = this.parseDate(mother.birth?.date);
                if (motherBirthDate && childBirthDate) {
                    const motherAge = (childBirthDate - motherBirthDate) / (365.25 * 24 * 60 * 60 * 1000);
                    if (motherAge > 50) {
                        const entryLabel = this.getEntryLabel(child) || this.getEntryLabel(mother);
                        this.warnings.push({
                            type: 'mother_too_old',
                            familyId: famId,
                            childId: `@I${childId}@`,
                            childName: this.formatPersonName(child),
                            entry: this.getEntryLabel(child),
                            motherAge: Math.round(motherAge),
                            message: `Mother was ${Math.round(motherAge)} years old when ${this.formatPersonIdForError(child)} was born [Family: ${famId}, Entry: ${entryLabel || 'unknown'}]`
                        });
                    }
                }
            }
        }
    }

    /**
     * Validate GEDCOM date format
     */
    validateDateFormat(id, individual, eventType, dateStr) {
        if (!dateStr || dateStr.trim() === '') return;

        // GEDCOM date formats:
        // DD MMM YYYY (e.g., 15 JAN 1900)
        // MMM YYYY (e.g., JAN 1900)
        // YYYY (e.g., 1900)
        // ABT/BEF/AFT/EST/CAL DD MMM YYYY
        // BET date AND date
        // FROM date TO date

        const datePattern = /^(ABT|BEF|AFT|EST|CAL|BET|FROM)?\s*(\d{1,2})?\s*(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)?\s*(\d{4})?(\s+(AND|TO)\s+.*)?$/i;

        if (!datePattern.test(dateStr.trim())) {
            const personName = individual ? this.formatPersonIdForError(individual) : id;
            const entry = individual ? this.getEntryLabel(individual) : '';

            this.warnings.push({
                type: 'invalid_date_format',
                id: id,
                personName: personName,
                entry: entry,
                eventType: eventType,
                date: dateStr,
                message: `Invalid GEDCOM date format: "${dateStr}" for ${eventType} of ${personName}`
            });
        }
    }

    /**
     * Parse a GEDCOM date string to a JavaScript Date (approximate)
     */
    parseDate(dateStr) {
        if (!dateStr) return null;

        // Remove qualifiers
        const cleaned = dateStr.replace(/^(ABT|BEF|AFT|EST|CAL)\s+/i, '').trim();

        // Handle ranges - take the first date
        const betMatch = cleaned.match(/^BET\s+(.+?)\s+AND/i);
        if (betMatch) {
            return this.parseDate(betMatch[1]);
        }

        const fromMatch = cleaned.match(/^FROM\s+(.+?)\s+TO/i);
        if (fromMatch) {
            return this.parseDate(fromMatch[1]);
        }

        // Parse DD MMM YYYY
        const months = {
            'JAN': 0, 'FEB': 1, 'MAR': 2, 'APR': 3, 'MAY': 4, 'JUN': 5,
            'JUL': 6, 'AUG': 7, 'SEP': 8, 'OCT': 9, 'NOV': 10, 'DEC': 11
        };

        const parts = cleaned.split(/\s+/);
        let day = 1, month = 0, year = null;

        for (const part of parts) {
            if (/^\d{4}$/.test(part)) {
                year = parseInt(part);
            } else if (/^\d{1,2}$/.test(part)) {
                day = parseInt(part);
            } else if (months.hasOwnProperty(part.toUpperCase())) {
                month = months[part.toUpperCase()];
            }
        }

        if (year) {
            return new Date(year, month, day);
        }

        return null;
    }

    /**
     * Get entry label from individual's source
     */
    getEntryLabel(individual) {
        if (!individual) return '';
        return individual.source || '';
    }

    /**
     * Get page number from source
     */
    getPageFromSource(individual) {
        // Extract page number from source record
        // This would depend on how sources are structured in your GEDCOM
        const source = individual.source || '';
        const pageMatch = source.match(/Page\s+(\d+)/i);
        return pageMatch ? pageMatch[1] : null;
    }

    /**
     * Check if person is the only one in their entry
     */
    isOnlyPersonInEntry(entryLabel) {
        if (!entryLabel) return false;

        const individuals = this.gedModel.getIndividuals();
        let count = 0;

        for (const [_, individual] of Object.entries(individuals)) {
            if (this.getEntryLabel(individual) === entryLabel) {
                count++;
                if (count > 1) return false;
            }
        }

        return count === 1;
    }

    /**
     * Format person name for display
     */
    formatPersonName(individual) {
        if (!individual || !individual.name) return 'Unknown';
        return individual.name.toString();
    }

    /**
     * Format person identification for error messages
     * Includes name, entry label, and birth date if available
     */
    formatPersonIdForError(individual) {
        if (!individual || !individual.name) return 'Unknown';

        let result = individual.name.toString();
        const entryLabel = this.getEntryLabel(individual);

        if (entryLabel) {
            result += ` [${entryLabel}]`;
        }

        if (individual.birth && individual.birth.date) {
            result += ` (b. ${individual.birth.date})`;
        }

        return result;
    }

    /**
     * Generate summary report
     */
    generateSummary() {
        const individuals = this.gedModel.getIndividuals();
        const families = this.gedModel.getFamilies();

        // Count entries
        const entries = new Set();
        for (const [_, individual] of Object.entries(individuals)) {
            const entry = this.getEntryLabel(individual);
            if (entry) entries.add(entry);
        }

        // Sort entry labels
        const sortedEntries = Array.from(entries).sort((a, b) => {
            // Try numeric sort first
            const numA = parseInt(a);
            const numB = parseInt(b);
            if (!isNaN(numA) && !isNaN(numB)) {
                return numA - numB;
            }
            // Fall back to alphabetical
            return a.localeCompare(b);
        });

        // Count people and families per entry
        const entryDetails = {};
        for (const entry of sortedEntries) {
            const peopleInEntry = Object.entries(individuals)
                .filter(([_, ind]) => this.getEntryLabel(ind) === entry)
                .length;

            const familiesInEntry = Object.entries(families)
                .filter(([_, fam]) => {
                    const father = this.gedModel.getIndividualByNumericId(fam.father);
                    const mother = this.gedModel.getIndividualByNumericId(fam.mother);
                    return (father && this.getEntryLabel(father) === entry) ||
                           (mother && this.getEntryLabel(mother) === entry);
                })
                .length;

            entryDetails[entry] = {
                people: peopleInEntry,
                families: familiesInEntry
            };
        }

        return {
            totalEntries: sortedEntries.length,
            entryLabels: sortedEntries,
            totalPeople: Object.keys(individuals).length,
            totalFamilies: Object.keys(families).length,
            entryDetails: entryDetails,
            warningCount: this.warnings.length,
            errorCount: this.errors.length
        };
    }
}

module.exports = GedcomIntegrityChecker;

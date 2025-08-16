/**
 * CompareModels - A class for comparing data between two PageModel objects
 * Provides various comparison methods to analyze differences between genealogical datasets
 * 
 * @author Steve Turley
 * @version 1.0.0
 */

class CompareModels {
    /**
     * Create a new CompareModels object
     * @param {PageModel} pageModel1 - The first PageModel to compare
     * @param {PageModel} pageModel2 - The second PageModel to compare
     */
    constructor(pageModel1, pageModel2) {
        this.pageModel1 = pageModel1;
        this.pageModel2 = pageModel2;
    }

    /**
     * Compare entries between the two PageModels
     * @returns {Object} Object containing arrays of entry IDs that are unique to each model
     * @returns {Array<string>} returns.onlyInFirst - Entry IDs that appear only in the first PageModel
     * @returns {Array<string>} returns.onlyInSecond - Entry IDs that appear only in the second PageModel
     */
    compareEntries() {
        // Get entry IDs from both PageModels
        const entriesFirst = Object.keys(this.pageModel1.entries);
        const entriesSecond = Object.keys(this.pageModel2.entries);

        // Convert to Sets for efficient comparison
        const setFirst = new Set(entriesFirst);
        const setSecond = new Set(entriesSecond);

        // Find entries that are only in the first PageModel
        const onlyInFirst = entriesFirst.filter(entryId => !setSecond.has(entryId));

        // Find entries that are only in the second PageModel
        const onlyInSecond = entriesSecond.filter(entryId => !setFirst.has(entryId));

        return {
            onlyInFirst,
            onlyInSecond
        };
    }

    /**
     * Compare people between entries in the two PageModels
     * @returns {Object} Object containing detailed people comparison results
     */
    comparePeople() {
        const results = {
            entriesCompared: 0,
            totalMatches: 0,
            exactNameMatches: 0,
            eventReferenceMatches: 0,
            relationshipSimilarMatches: 0,
            similarNameMatches: 0,
            unmatchedInFirst: 0,
            unmatchedInSecond: 0,
            // Precision metrics
            preciseMatches: 0,
            impreciseMatches: 0,
            precisionRate: 0.0,
            details: []
        };

        // Get common entries (entries that exist in both PageModels)
        const entriesFirst = Object.keys(this.pageModel1.entries);
        const entriesSecond = Object.keys(this.pageModel2.entries);
        const commonEntries = entriesFirst.filter(entryId => entriesSecond.includes(entryId));

        results.entriesCompared = commonEntries.length;

        // Compare people in each common entry
        for (const entryId of commonEntries) {
            const entry1 = this.pageModel1.entries[entryId];
            const entry2 = this.pageModel2.entries[entryId];

            const entryResult = this._comparePeopleInEntry(entry1, entry2, entryId);
            results.details.push(entryResult);

            // Aggregate statistics
            results.totalMatches += entryResult.matches.length;
            results.exactNameMatches += entryResult.exactNameMatches;
            results.eventReferenceMatches += entryResult.eventReferenceMatches;
            results.relationshipSimilarMatches += entryResult.relationshipSimilarMatches;
            results.similarNameMatches += entryResult.similarNameMatches;
            results.unmatchedInFirst += entryResult.unmatchedInFirst.length;
            results.unmatchedInSecond += entryResult.unmatchedInSecond.length;
            
            // Calculate precision for each match
            for (const match of entryResult.matches) {
                const person1 = this.pageModel1.people[match.person1Id];
                const person2 = this.pageModel2.people[match.person2Id];
                
                if (person1 && person2) {
                    if (person1.name.exactMatch(person2.name)) {
                        results.preciseMatches++;
                    } else {
                        results.impreciseMatches++;
                    }
                } else {
                    // If people not found in dictionary, count as imprecise
                    results.impreciseMatches++;
                }
            }
        }

        // Calculate overall precision rate
        if (results.totalMatches > 0) {
            results.precisionRate = (results.preciseMatches / results.totalMatches) * 100;
        }

        return results;
    }

    /**
     * Compare people within a single entry between the two models
     * @param {EntryModel} entry1 - Entry from first PageModel
     * @param {EntryModel} entry2 - Entry from second PageModel
     * @param {string} entryId - The entry ID being compared
     * @returns {Object} Detailed comparison results for this entry
     * @private
     */
    _comparePeopleInEntry(entry1, entry2, entryId) {
        const result = {
            entryId: entryId,
            people1Count: Object.keys(entry1.people).length,
            people2Count: Object.keys(entry2.people).length,
            matches: [],
            unmatchedInFirst: [],
            unmatchedInSecond: [],
            exactNameMatches: 0,
            eventReferenceMatches: 0,
            relationshipSimilarMatches: 0,
            similarNameMatches: 0
        };

        const people1 = Object.keys(entry1.people).map(id => ({ id: parseInt(id), person: entry1.people[id] }));
        const people2 = Object.keys(entry2.people).map(id => ({ id: parseInt(id), person: entry2.people[id] }));
        
        const matched1 = new Set();
        const matched2 = new Set();

        // Priority 1: Exact name matches that are unique within the entry
        this._findExactNameMatches(people1, people2, entry1, entry2, result, matched1, matched2);

        // Priority 2: Same events or references
        this._findEventReferenceMatches(people1, people2, result, matched1, matched2);

        // Priority 3: Similar names with same relationship
        this._findRelationshipSimilarMatches(people1, people2, entry1, entry2, result, matched1, matched2);

        // Priority 4: Similar names (fallback)
        this._findSimilarNameMatches(people1, people2, result, matched1, matched2);

        // Priority 5: Final pass for exact name matches (in case ambiguities were resolved)
        this._findExactNameMatchesFinalPass(people1, people2, entry1, entry2, result, matched1, matched2);

        // Record unmatched people
        result.unmatchedInFirst = people1.filter(p => !matched1.has(p.id)).map(p => ({
            id: p.id,
            name: p.person.name.toString()
        }));
        
        result.unmatchedInSecond = people2.filter(p => !matched2.has(p.id)).map(p => ({
            id: p.id,
            name: p.person.name.toString()
        }));

        return result;
    }

    /**
     * Find people with exact name matches that are unique within the entry
     * @private
     */
    _findExactNameMatches(people1, people2, entry1, entry2, result, matched1, matched2) {
        for (const person1 of people1) {
            if (matched1.has(person1.id)) continue;

            // Check if this name is unique in entry1
            const sameNameInEntry1 = people1.filter(p => p.person.name.exactMatch(person1.person.name));
            if (sameNameInEntry1.length > 1) continue; // Skip if not unique

            for (const person2 of people2) {
                if (matched2.has(person2.id)) continue;

                if (person1.person.name.exactMatch(person2.person.name)) {
                    // Check if this name is unique in entry2
                    const sameNameInEntry2 = people2.filter(p => p.person.name.exactMatch(person2.person.name));
                    if (sameNameInEntry2.length === 1) { // Must be unique
                        result.matches.push({
                            person1Id: person1.id,
                            person2Id: person2.id,
                            person1Name: person1.person.name.toString(),
                            person2Name: person2.person.name.toString(),
                            matchType: 'exactNameUnique'
                        });
                        matched1.add(person1.id);
                        matched2.add(person2.id);
                        result.exactNameMatches++;
                        break;
                    }
                }
            }
        }
    }

    /**
     * Find people with matching events or references
     * @private
     */
    _findEventReferenceMatches(people1, people2, result, matched1, matched2) {
        for (const person1 of people1) {
            if (matched1.has(person1.id)) continue;

            for (const person2 of people2) {
                if (matched2.has(person2.id)) continue;

                if (this._hasMatchingEventsOrReferences(person1.person, person2.person)) {
                    result.matches.push({
                        person1Id: person1.id,
                        person2Id: person2.id,
                        person1Name: person1.person.name.toString(),
                        person2Name: person2.person.name.toString(),
                        matchType: 'eventReference'
                    });
                    matched1.add(person1.id);
                    matched2.add(person2.id);
                    result.eventReferenceMatches++;
                    break;
                }
            }
        }
    }

    /**
     * Find people with similar names and same relationship
     * @private
     */
    _findRelationshipSimilarMatches(people1, people2, entry1, entry2, result, matched1, matched2) {
        for (const person1 of people1) {
            if (matched1.has(person1.id)) continue;

            for (const person2 of people2) {
                if (matched2.has(person2.id)) continue;

                if (person1.person.name.similarMatch(person2.person.name)) {
                    // Additional check: surnames should be similar too for relationship matching
                    // Don't match people with completely different surnames unless they have other evidence
                    const surname1 = person1.person.name.surname.toLowerCase();
                    const surname2 = person2.person.name.surname.toLowerCase();
                    
                    // Create temporary NameModel objects to test surname similarity
                    const NameModel = require('./NameModel');
                    const surnameTest1 = new NameModel('Test', person1.person.name.surname);
                    const surnameTest2 = new NameModel('Test', person2.person.name.surname);
                    
                    // If surnames are not similar, skip this match
                    if (!surnameTest1.similarMatch(surnameTest2)) {
                        continue;
                    }
                    
                    const relationship1 = entry1.getRelationship(person1.id);
                    const relationship2 = entry2.getRelationship(person2.id);
                    
                    if (relationship1 === relationship2 && relationship1 !== '') {
                        // For exact name matches, check for uniqueness to avoid ambiguous matches
                        if (person1.person.name.exactMatch(person2.person.name)) {
                            const sameNameInEntry1 = people1.filter(p => p.person.name.exactMatch(person1.person.name));
                            const sameNameInEntry2 = people2.filter(p => p.person.name.exactMatch(person2.person.name));
                            
                            // Skip if name is not unique in either entry (ambiguous match)
                            if (sameNameInEntry1.length > 1 || sameNameInEntry2.length > 1) {
                                continue;
                            }
                        }
                        
                        result.matches.push({
                            person1Id: person1.id,
                            person2Id: person2.id,
                            person1Name: person1.person.name.toString(),
                            person2Name: person2.person.name.toString(),
                            matchType: 'relationshipSimilar',
                            relationship: relationship1
                        });
                        matched1.add(person1.id);
                        matched2.add(person2.id);
                        result.relationshipSimilarMatches++;
                        break;
                    }
                }
            }
        }
    }

    /**
     * Find people with similar names (fallback matching)
     * @private
     */
    _findSimilarNameMatches(people1, people2, result, matched1, matched2) {
        for (const person1 of people1) {
            if (matched1.has(person1.id)) continue;

            for (const person2 of people2) {
                if (matched2.has(person2.id)) continue;

                if (person1.person.name.similarMatch(person2.person.name)) {
                    // For exact name matches, check for uniqueness to avoid ambiguous matches
                    if (person1.person.name.exactMatch(person2.person.name)) {
                        const sameNameInEntry1 = people1.filter(p => p.person.name.exactMatch(person1.person.name));
                        const sameNameInEntry2 = people2.filter(p => p.person.name.exactMatch(person2.person.name));
                        
                        // Skip if name is not unique in either entry (ambiguous match)
                        if (sameNameInEntry1.length > 1 || sameNameInEntry2.length > 1) {
                            continue;
                        }
                    }
                    
                    result.matches.push({
                        person1Id: person1.id,
                        person2Id: person2.id,
                        person1Name: person1.person.name.toString(),
                        person2Name: person2.person.name.toString(),
                        matchType: 'similarName'
                    });
                    matched1.add(person1.id);
                    matched2.add(person2.id);
                    result.similarNameMatches++;
                    break;
                }
            }
        }
    }

    /**
     * Final pass for exact name matches after other matching phases
     * This handles cases where names were initially ambiguous but ambiguity was resolved
     * by other matches (events, relationships, etc.)
     * @private
     */
    _findExactNameMatchesFinalPass(people1, people2, entry1, entry2, result, matched1, matched2) {
        for (const person1 of people1) {
            if (matched1.has(person1.id)) continue;

            for (const person2 of people2) {
                if (matched2.has(person2.id)) continue;

                if (person1.person.name.exactMatch(person2.person.name)) {
                    // Check if this name is now unique among unmatched people
                    const unmatchedPeople1 = people1.filter(p => !matched1.has(p.id));
                    const unmatchedPeople2 = people2.filter(p => !matched2.has(p.id));
                    
                    const sameNameInUnmatched1 = unmatchedPeople1.filter(p => p.person.name.exactMatch(person1.person.name));
                    const sameNameInUnmatched2 = unmatchedPeople2.filter(p => p.person.name.exactMatch(person2.person.name));
                    
                    // Only match if the name is unique among remaining unmatched people
                    if (sameNameInUnmatched1.length === 1 && sameNameInUnmatched2.length === 1) {
                        result.matches.push({
                            person1Id: person1.id,
                            person2Id: person2.id,
                            person1Name: person1.person.name.toString(),
                            person2Name: person2.person.name.toString(),
                            matchType: 'exactNameResolved'
                        });
                        matched1.add(person1.id);
                        matched2.add(person2.id);
                        result.exactNameMatches++;
                        break;
                    }
                }
            }
        }
    }

    /**
     * Check if two people have matching events or references
     * @param {PersonModel} person1 - First person to compare
     * @param {PersonModel} person2 - Second person to compare
     * @returns {boolean} True if they have at least one matching event or reference
     * @private
     */
    _hasMatchingEventsOrReferences(person1, person2) {
        // Compare references
        const refs1 = person1.references || [];
        const refs2 = person2.references || [];
        
        for (const ref1 of refs1) {
            if (refs2.includes(ref1)) {
                return true; // Found matching reference
            }
        }

        // Compare events (birth, death, christening, burial)
        const events1 = [person1.birth, person1.death, person1.christening, person1.burial];
        const events2 = [person2.birth, person2.death, person2.christening, person2.burial];

        for (let i = 0; i < events1.length; i++) {
            if (this._eventsMatch(events1[i], events2[i])) {
                return true; // Found matching event
            }
        }

        return false;
    }

    /**
     * Check if two events match (same date and/or place)
     * @param {EventModel} event1 - First event to compare
     * @param {EventModel} event2 - Second event to compare
     * @returns {boolean} True if events have matching non-empty data
     * @private
     */
    _eventsMatch(event1, event2) {
        if (!event1 || !event2) return false;
        
        // If either event is empty, they don't match
        if (event1.isEmpty() || event2.isEmpty()) return false;
        
        // Events match if they have the same non-empty date or place
        const date1Str = event1.date ? event1.date.toString() : '';
        const date2Str = event2.date ? event2.date.toString() : '';
        const place1 = event1.place || '';
        const place2 = event2.place || '';

        return (date1Str !== '' && date1Str === date2Str) ||
               (place1 !== '' && place1 === place2);
    }

    /**
     * Get a summary of the comparison between the two PageModels
     * @returns {Object} Summary statistics about the comparison
     */
    getSummary() {
        const entryComparison = this.compareEntries();

        return {
            pageModel1: {
                totalEntries: Object.keys(this.pageModel1.entries).length,
                totalPeople: Object.keys(this.pageModel1.people).length,
                totalFamilies: Object.keys(this.pageModel1.families).length,
                location: this.pageModel1.location || 'Unknown'
            },
            pageModel2: {
                totalEntries: Object.keys(this.pageModel2.entries).length,
                totalPeople: Object.keys(this.pageModel2.people).length,
                totalFamilies: Object.keys(this.pageModel2.families).length,
                location: this.pageModel2.location || 'Unknown'
            },
            entriesOnlyInFirst: entryComparison.onlyInFirst.length,
            entriesOnlyInSecond: entryComparison.onlyInSecond.length,
            commonEntries: Object.keys(this.pageModel1.entries).length - entryComparison.onlyInFirst.length
        };
    }

    /**
     * Generate a detailed report of the comparison
     * @returns {string} Formatted report string
     */
    generateReport() {
        const entryComparison = this.compareEntries();
        const summary = this.getSummary();

        let report = '=== PageModel Comparison Report ===\n\n';
        
        report += `First PageModel (${summary.pageModel1.location}):\n`;
        report += `  - Entries: ${summary.pageModel1.totalEntries}\n`;
        report += `  - People: ${summary.pageModel1.totalPeople}\n`;
        report += `  - Families: ${summary.pageModel1.totalFamilies}\n\n`;

        report += `Second PageModel (${summary.pageModel2.location}):\n`;
        report += `  - Entries: ${summary.pageModel2.totalEntries}\n`;
        report += `  - People: ${summary.pageModel2.totalPeople}\n`;
        report += `  - Families: ${summary.pageModel2.totalFamilies}\n\n`;

        report += `Comparison Results:\n`;
        report += `  - Common entries: ${summary.commonEntries}\n`;
        report += `  - Entries only in first: ${summary.entriesOnlyInFirst}\n`;
        report += `  - Entries only in second: ${summary.entriesOnlyInSecond}\n\n`;

        if (entryComparison.onlyInFirst.length > 0) {
            report += `Entries only in first PageModel:\n`;
            entryComparison.onlyInFirst.forEach(entryId => {
                report += `  - ${entryId}\n`;
            });
            report += '\n';
        }

        if (entryComparison.onlyInSecond.length > 0) {
            report += `Entries only in second PageModel:\n`;
            entryComparison.onlyInSecond.forEach(entryId => {
                report += `  - ${entryId}\n`;
            });
            report += '\n';
        }

        return report;
    }

    /**
     * Compare cross-references between people in the two PageModels
     * First matches people using the same algorithm as comparePeople, then checks if their references match
     * @returns {Object} Object containing cross-reference comparison results
     */
    compareReferences() {
        const results = {
            entriesCompared: 0,
            totalMatches: 0,
            crossReferenceRecallErrors: 0,
            crossReferencePrecisionErrors: 0,
            recallErrorRate: 0.0,
            precisionErrorRate: 0.0,
            details: []
        };

        // Get common entries (entries that exist in both PageModels)
        const entriesFirst = Object.keys(this.pageModel1.entries);
        const entriesSecond = Object.keys(this.pageModel2.entries);
        const commonEntries = entriesFirst.filter(entryId => entriesSecond.includes(entryId));

        results.entriesCompared = commonEntries.length;

        // Compare references in each common entry
        for (const entryId of commonEntries) {
            const entry1 = this.pageModel1.entries[entryId];
            const entry2 = this.pageModel2.entries[entryId];

            const entryResult = this._compareReferencesInEntry(entry1, entry2, entryId);
            results.details.push(entryResult);

            // Aggregate statistics
            results.totalMatches += entryResult.matches.length;
            results.crossReferenceRecallErrors += entryResult.recallErrors.length;
            results.crossReferencePrecisionErrors += entryResult.precisionErrors.length;
        }

        // Calculate error rates
        if (results.totalMatches > 0) {
            results.recallErrorRate = (results.crossReferenceRecallErrors / results.totalMatches) * 100;
            results.precisionErrorRate = (results.crossReferencePrecisionErrors / results.totalMatches) * 100;
        }

        return results;
    }

    /**
     * Compare cross-references within a single entry between the two models
     * @param {EntryModel} entry1 - Entry from first PageModel
     * @param {EntryModel} entry2 - Entry from second PageModel
     * @param {string} entryId - The entry ID being compared
     * @returns {Object} Detailed cross-reference comparison results for this entry
     * @private
     */
    _compareReferencesInEntry(entry1, entry2, entryId) {
        const result = {
            entryId: entryId,
            matches: [],
            recallErrors: [],
            precisionErrors: []
        };

        const people1 = Object.keys(entry1.people).map(id => ({ id: parseInt(id), person: entry1.people[id] }));
        const people2 = Object.keys(entry2.people).map(id => ({ id: parseInt(id), person: entry2.people[id] }));
        
        const matched1 = new Set();
        const matched2 = new Set();

        // Use the same matching algorithm as comparePeople to find corresponding people
        this._findExactNameMatches(people1, people2, entry1, entry2, result, matched1, matched2);
        this._findEventReferenceMatches(people1, people2, result, matched1, matched2);
        this._findRelationshipSimilarMatches(people1, people2, entry1, entry2, result, matched1, matched2);
        this._findSimilarNameMatches(people1, people2, result, matched1, matched2);
        this._findExactNameMatchesFinalPass(people1, people2, entry1, entry2, result, matched1, matched2);

        // Now compare cross-references for matched people
        for (const match of result.matches) {
            const person1 = this.pageModel1.people[match.person1Id];
            const person2 = this.pageModel2.people[match.person2Id];

            if (person1 && person2) {
                const referenceComparison = this._comparePersonReferences(person1, person2, match);
                
                if (referenceComparison && referenceComparison.type === 'recall') {
                    result.recallErrors.push(referenceComparison);
                } else if (referenceComparison && referenceComparison.type === 'precision') {
                    result.precisionErrors.push(referenceComparison);
                }
            }
        }

        return result;
    }

    /**
     * Compare cross-references between two matched people
     * @param {PersonModel} person1 - Person from first PageModel
     * @param {PersonModel} person2 - Person from second PageModel
     * @param {Object} match - The match object containing person IDs and names
     * @returns {Object|null} Reference comparison result or null if references match perfectly
     * @private
     */
    _comparePersonReferences(person1, person2, match) {
        const refs1 = person1.references || [];
        const refs2 = person2.references || [];

        // Check if the number of references differs (recall error)
        if (refs1.length !== refs2.length) {
            const missingRefs = refs1.length > refs2.length 
                ? refs1.filter(ref => !refs2.includes(ref))
                : refs2.filter(ref => !refs1.includes(ref));

            return {
                type: 'recall',
                person1Id: match.person1Id,
                person2Id: match.person2Id,
                person1Name: match.person1Name,
                person2Name: match.person2Name,
                person1References: refs1,
                person2References: refs2,
                missingReferences: missingRefs,
                expectedCount: Math.max(refs1.length, refs2.length),
                actualCount: Math.min(refs1.length, refs2.length)
            };
        }

        // If counts match, check if the actual references are the same (precision error)
        if (refs1.length > 0 && refs2.length > 0) {
            const refs1Set = new Set(refs1);
            const refs2Set = new Set(refs2);
            
            const differentRefs1 = refs1.filter(ref => !refs2Set.has(ref));
            const differentRefs2 = refs2.filter(ref => !refs1Set.has(ref));

            if (differentRefs1.length > 0 || differentRefs2.length > 0) {
                return {
                    type: 'precision',
                    person1Id: match.person1Id,
                    person2Id: match.person2Id,
                    person1Name: match.person1Name,
                    person2Name: match.person2Name,
                    person1References: refs1,
                    person2References: refs2,
                    differentReferences1: differentRefs1,
                    differentReferences2: differentRefs2
                };
            }
        }

        // References match perfectly
        return null;
    }
}

module.exports = CompareModels;

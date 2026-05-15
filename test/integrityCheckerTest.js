/**
 * Unit tests for GedcomIntegrityChecker
 *
 * @author Steve Turley
 */

const assert = require('assert');
const GedcomIntegrityChecker = require('../utils/GedcomIntegrityChecker');

function makeChecker(individuals) {
    const gedModel = {
        getIndividualByNumericId(id) {
            return individuals[id] !== undefined ? individuals[id] : null;
        }
    };
    return new GedcomIntegrityChecker(gedModel);
}

function makeChild(birthDate) {
    return {
        birth: birthDate ? { date: birthDate } : null,
        death: null,
        name: { toString() { return 'Test Child'; } },
        source: ''
    };
}

describe('GedcomIntegrityChecker', function() {
    describe('checkFamilyDateConsistency - child born before marriage', function() {

        it('should not warn when approximate year-only birth (um 1792) is same year as marriage (NOV 1792)', function() {
            // Regression: German approximate prefix "um 1792" was parsed as Jan 1 1792,
            // falsely triggering a warning against a NOV 1792 marriage.
            const checker = makeChecker({ 1: makeChild('um 1792') });
            checker.checkFamilyDateConsistency('F1', {
                marriage: { date: 'NOV 1792' },
                father: null,
                mother: null,
                children: [1]
            });
            const warnings = checker.warnings.filter(w => w.type === 'child_before_marriage');
            assert.strictEqual(warnings.length, 0,
                'Year-only birth "um 1792" must not be flagged against same-year marriage "NOV 1792"');
        });

        it('should not warn when ABT year-only birth is same year as marriage', function() {
            const checker = makeChecker({ 1: makeChild('ABT 1792') });
            checker.checkFamilyDateConsistency('F1', {
                marriage: { date: 'NOV 1792' },
                father: null,
                mother: null,
                children: [1]
            });
            const warnings = checker.warnings.filter(w => w.type === 'child_before_marriage');
            assert.strictEqual(warnings.length, 0,
                'Year-only birth "ABT 1792" must not be flagged against same-year marriage "NOV 1792"');
        });

        it('should not warn when bare year birth is same year as marriage', function() {
            const checker = makeChecker({ 1: makeChild('1792') });
            checker.checkFamilyDateConsistency('F1', {
                marriage: { date: 'NOV 1792' },
                father: null,
                mother: null,
                children: [1]
            });
            const warnings = checker.warnings.filter(w => w.type === 'child_before_marriage');
            assert.strictEqual(warnings.length, 0,
                'Year-only birth "1792" must not be flagged against same-year marriage "NOV 1792"');
        });

        it('should warn when precise birth date is before marriage in the same year', function() {
            const checker = makeChecker({ 1: makeChild('15 JAN 1792') });
            checker.checkFamilyDateConsistency('F1', {
                marriage: { date: 'NOV 1792' },
                father: null,
                mother: null,
                children: [1]
            });
            const warnings = checker.warnings.filter(w => w.type === 'child_before_marriage');
            assert.strictEqual(warnings.length, 1,
                'Precise birth "15 JAN 1792" before marriage "NOV 1792" should still warn');
        });

        it('should warn when year-only birth is in an earlier year than the marriage', function() {
            const checker = makeChecker({ 1: makeChild('um 1791') });
            checker.checkFamilyDateConsistency('F1', {
                marriage: { date: 'NOV 1792' },
                father: null,
                mother: null,
                children: [1]
            });
            const warnings = checker.warnings.filter(w => w.type === 'child_before_marriage');
            assert.strictEqual(warnings.length, 1,
                'Year-only birth "um 1791" in an earlier year than marriage "NOV 1792" should still warn');
        });

    });
});

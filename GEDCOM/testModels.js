/**
 * Test script to verify GedIndividual and GedFamily integration with GedModel
 * This tests the new model conversion functionality
 */

const GedModel = require('./GedModel');
const GedIndividual = require('./GedIndividual');
const GedFamily = require('./GedFamily');

console.log('Testing GedIndividual and GedFamily integration...\n');

// Create a GedModel instance
const gedModel = new GedModel();

// Test 1: Create a mock GEDCOM individual record
console.log('Test 1: Adding individual with GEDCOM record...');
const mockIndividualRecord = {
    tag: 'INDI',
    children: [
        { tag: 'NAME', value: 'John /Smith/' },
        { tag: 'SEX', value: 'M' },
        { 
            tag: 'BIRT', 
            children: [
                { tag: 'DATE', value: '1 JAN 1950' },
                { tag: 'PLAC', value: 'New York, NY' }
            ]
        },
        {
            tag: 'DEAT',
            children: [
                { tag: 'DATE', value: '15 DEC 2020' },
                { tag: 'PLAC', value: 'Los Angeles, CA' }
            ]
        },
        { tag: 'SOUR', value: 'Family Bible' },
        { tag: 'cref', value: 'REF123' },
        { tag: 'FAMS', value: '@F1@' }
    ]
};

gedModel.addIndividual('@I1@', mockIndividualRecord);
const individual = gedModel.getIndividual('@I1@');

console.log('Individual converted:', individual instanceof GedIndividual);
console.log('Individual name:', individual.getName().getFormattedName());
console.log('Individual gender:', individual.getGender());
console.log('Birth date:', individual.getBirth().getDate());
console.log('Birth place:', individual.getBirth().getPlace());
console.log('Death date:', individual.getDeath().getDate());
console.log('Death place:', individual.getDeath().getPlace());
console.log('Source:', individual.getSource());
console.log('References:', individual.getReferences());
console.log('Individual toString:', individual.toString());
console.log('');

// Test 2: Create a mock GEDCOM family record
console.log('Test 2: Adding family with GEDCOM record...');
const mockFamilyRecord = {
    tag: 'FAM',
    children: [
        { tag: 'HUSB', value: '@I1@' },
        { tag: 'WIFE', value: '@I2@' },
        { tag: 'CHIL', value: '@I3@' },
        { tag: 'CHIL', value: '@I4@' },
        {
            tag: 'MARR',
            children: [
                { tag: 'DATE', value: '14 FEB 1975' },
                { tag: 'PLAC', value: 'Las Vegas, NV' }
            ]
        }
    ]
};

gedModel.addFamily('@F1@', mockFamilyRecord);
const family = gedModel.getFamily('@F1@');

console.log('Family converted:', family instanceof GedFamily);
console.log('Father ID:', family.getFather());
console.log('Mother ID:', family.getMother());
console.log('Children IDs:', family.getChildren());
console.log('Marriage date:', family.getMarriage().getDate());
console.log('Marriage place:', family.getMarriage().getPlace());
console.log('Has parents:', family.hasParents());
console.log('Has children:', family.hasChildren());
console.log('Child count:', family.getChildCount());
console.log('Family toString:', family.toString());
console.log('');

// Test 3: Test GedModel summary and additional methods
console.log('Test 3: GedModel methods...');
console.log('Summary:', gedModel.getSummary());
console.log('Individual models count:', gedModel.getIndividualModels().length);
console.log('Family models count:', gedModel.getFamilyModels().length);
console.log('Individual by numeric ID 1:', gedModel.getIndividualByNumericId(1) instanceof GedIndividual);
console.log('Family by numeric ID 1:', gedModel.getFamilyByNumericId(1) instanceof GedFamily);
console.log('');

// Test 4: Test empty and validation methods
console.log('Test 4: Validation methods...');
const emptyIndividual = new GedIndividual();
const emptyFamily = new GedFamily();

console.log('Empty individual isEmpty:', emptyIndividual.isEmpty());
console.log('Empty individual isValid:', emptyIndividual.isValid());
console.log('Empty family isEmpty:', emptyFamily.isEmpty());
console.log('Empty family isValid:', emptyFamily.isValid());

console.log('Filled individual isEmpty:', individual.isEmpty());
console.log('Filled individual isValid:', individual.isValid());
console.log('Filled family isEmpty:', family.isEmpty());
console.log('Filled family isValid:', family.isValid());
console.log('');

console.log('All tests completed successfully!');

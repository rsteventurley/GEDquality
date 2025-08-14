/**
 * Quick test to verify FamilyModel can be imported through index.js
 */

const { DateModel, EventModel, NameModel, PersonModel, FamilyModel } = require('./index.js');

console.log('Testing imports...');

// Test FamilyModel import and basic functionality
const family = new FamilyModel(1, 2, [3, 4]);
console.log('FamilyModel imported successfully:', family.toString());

// Test fillMarriage method
const marriageDate = new DateModel();
marriageDate.parseDateString('1875-06-15');
const marriageEvent = new EventModel(marriageDate, '');
const testFamily = new FamilyModel(10, 11, [], marriageEvent);

console.log('Before fillMarriage:', testFamily.getMarriage().toString());
testFamily.fillMarriage('Test Church, Test City');
console.log('After fillMarriage:', testFamily.getMarriage().toString());

console.log('✅ All imports working correctly!');

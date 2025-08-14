/**
 * DataModel Library - Index file
 * Export all genealogical data models for easy importing
 * 
 * @author Steve Turley
 * @version 1.0.0
 */

const DateModel = require('./DateModel');
const EventModel = require('./EventModel');
const NameModel = require('./NameModel');
const PersonModel = require('./PersonModel');
const FamilyModel = require('./FamilyModel');
const EntryModel = require('./EntryModel');
const PageModel = require('./PageModel');

module.exports = {
    DateModel,
    EventModel,
    NameModel,
    PersonModel,
    FamilyModel,
    EntryModel,
    PageModel
};

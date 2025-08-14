# GEDCOM Model Integration Documentation

## Overview

The GEDCOM system has been successfully updated to convert individuals and families from raw GEDCOM records into structured model objects with specific attributes as requested.

## New Classes

### GedIndividual

**Attributes:**
- `gender` (character) - M, F, or empty string
- `name` (GedName) - Structured name object with GEDCOM parsing
- `birth` (GedEvent) - Birth event with date, place, sources, notes
- `christening` (GedEvent) - Christening/baptism event
- `death` (GedEvent) - Death event
- `burial` (GedEvent) - Burial event
- `source` (string) - Primary source reference
- `references` (array of string) - Family references, GEDCOM IDs, etc.

**Key Methods:**
- `fromGedcomRecord(gedcomRecord)` - Static method to create from GEDCOM data
- Getters/setters for all attributes
- `isEmpty()`, `isValid()` - Validation methods
- `toString()` - Human-readable summary
- `clone()` - Deep copy functionality

### GedFamily

**Attributes:**
- `father` (int) - Numeric ID for father (extracted from @I123@ format)
- `mother` (int) - Numeric ID for mother
- `children` (array of int) - Array of numeric IDs for children
- `marriage` (GedEvent) - Marriage event with date, place, sources, notes

**Key Methods:**
- `fromGedcomRecord(gedcomRecord)` - Static method to create from GEDCOM data
- `extractGedcomId(refString)` - Utility to convert @I123@ to 123
- Getters/setters for all attributes
- `addChild()`, `removeChild()` - Child management
- `hasParents()`, `hasChildren()`, `getChildCount()` - Helper methods
- `isEmpty()`, `isValid()` - Validation methods
- `toString()` - Human-readable summary
- `clone()` - Deep copy functionality

## GedModel Integration

The `GedModel` class has been updated to automatically convert GEDCOM records:

- `addIndividual()` now creates `GedIndividual` instances from GEDCOM data
- `addFamily()` now creates `GedFamily` instances from GEDCOM data
- New methods added:
  - `getIndividualModels()` - Get array of GedIndividual instances
  - `getFamilyModels()` - Get array of GedFamily instances
  - `getIndividualByNumericId(id)` - Access by numeric ID (123 instead of @I123@)
  - `getFamilyByNumericId(id)` - Access by numeric ID (456 instead of @F456@)
  - `convertToModels()` - Convert existing raw data to models

## Integration with Existing Classes

- **GedEvent**: Used for birth, christening, death, burial, and marriage events
- **GedName**: Used for structured name storage with GEDCOM parsing
- **GedReader**: Automatically creates model objects when parsing GEDCOM files

## Usage Example

```javascript
const GedReader = require('./GedReader');
const reader = new GedReader();
const gedModel = reader.read('family.ged');

// Access individuals as GedIndividual objects
const individuals = gedModel.getIndividuals();
for (const [id, individual] of Object.entries(individuals)) {
    console.log(`Name: ${individual.getName().getFormattedName()}`);
    console.log(`Gender: ${individual.getGender()}`);
    console.log(`Birth: ${individual.getBirth().getDate()}`);
}

// Access families as GedFamily objects
const families = gedModel.getFamilies();
for (const [id, family] of Object.entries(families)) {
    console.log(`Father ID: ${family.getFather()}`);
    console.log(`Mother ID: ${family.getMother()}`);
    console.log(`Children: ${family.getChildren()}`);
    console.log(`Marriage: ${family.getMarriage().getDate()}`);
}

// Numeric ID access
const person1 = gedModel.getIndividualByNumericId(1); // Gets @I1@
const family1 = gedModel.getFamilyByNumericId(1); // Gets @F1@
```

## Data Conversion

### Individual Records
- `SEX` tag → `gender` attribute
- `NAME` tag → `name` (GedName object)
- `BIRT` tag → `birth` (GedEvent object)
- `CHR` tag → `christening` (GedEvent object)
- `DEAT` tag → `death` (GedEvent object)
- `BURI` tag → `burial` (GedEvent object)
- `SOUR` tag → `source` string
- `cref`, `FAMS`, `FAMC` tags → `references` array

### Family Records
- `HUSB` tag → `father` (numeric ID)
- `WIFE` tag → `mother` (numeric ID)
- `CHIL` tag → `children` array (numeric IDs)
- `MARR` tag → `marriage` (GedEvent object)
- `ENGA` tag → `marriage` if no MARR found
- `DIV` tag → added as attributes to marriage event

## Files Created/Modified

### New Files
- `GedIndividual.js` - Individual model class
- `GedFamily.js` - Family model class
- `testModels.js` - Unit tests for model functionality
- `demonstrateModels.js` - Real GEDCOM file demonstration

### Modified Files
- `GedModel.js` - Updated to use model classes with automatic conversion

## Test Results

All tests pass successfully:
- ✅ Individual conversion from GEDCOM records
- ✅ Family conversion with numeric ID extraction
- ✅ Integration with existing GedEvent and GedName classes
- ✅ Validation and utility methods
- ✅ Real GEDCOM file parsing and conversion
- ✅ Numeric ID access methods

The system now automatically converts GEDCOM individuals to `GedIndividual` objects with the specified attributes (gender, name, birth, christening, death, burial, source, references) and families to `GedFamily` objects with the specified attributes (father, mother, children, marriage), exactly as requested.

# DataModel Library

A comprehensive library for handling genealogical data objects commonly found in GEDCOM and XML files.

## Overview

This library provides robust data models for storing and manipulating genealogical information with proper parsing, validation, and formatting capabilities.

## Models

### DateModel

The `DateModel` class handles genealogical dates with strict ISO 8601 format parsing and validation.

#### Key Features

- **ISO 8601 format support**: Requires dates in YYYY-MM-DD format
- **Date validation**: Validates year range (1400-2000), month (1-12), and day consistency
- **ABT modifier support**: Handles "about" dates with ABT prefix
- **Date ranges**: Supports BET...AND range format
- **Leap year handling**: Proper validation for February 29th
- **Error handling**: Throws descriptive errors for invalid dates
- **Format conversion**: GEDCOM, ISO, JavaScript Date objects

#### Usage Examples

```javascript
const { DateModel } = require('./DataModel');

// Create and parse single dates
const date1 = new DateModel();
date1.parseDateString('1995-12-25');

const date2 = new DateModel();
date2.parseDateString('ABT 1850-06-15');

// Create and parse date ranges
const range = new DateModel();
range.parseDateString('BET 1850-01-01 AND 1860-12-31');

// Format conversion
console.log(date1.toGEDCOM()); // "25 DEC 1995"
console.log(date1.toISO());    // "1995-12-25"
console.log(date1.toDate());   // JavaScript Date object

// Date comparison
const comparison = date1.compare(date2); // -1, 0, or 1

// Validation
console.log(date1.isValid()); // true
```

#### Supported Date Formats

**Input format (required):**
- `YYYY-MM-DD` (e.g., "1995-12-25")

**With modifiers:**
- `ABT YYYY-MM-DD` (e.g., "ABT 1850-06-15")
- `BEF YYYY-MM-DD` (e.g., "BEF 1900-12-31")
- `AFT YYYY-MM-DD` (e.g., "AFT 1850-01-01")

**Date ranges:**
- `BET YYYY-MM-DD AND YYYY-MM-DD` (e.g., "BET 1850-01-01 AND 1860-12-31")

#### Validation Rules

**Year validation:**
- Must be between 1400 and 2000 (inclusive)

**Month validation:**
- Must be between 1 and 12 (inclusive)

**Day validation:**
- Must be valid for the given month and year
- Handles leap years correctly (1600, 1996 are leap years; 1700, 1997 are not)

#### Properties

**Basic properties:**
- `originalString` - The original input string
- `day`, `month`, `year` - Parsed date components (numbers)
- `isValid()` - Returns true if the date has at least a year

**Range properties:**
- `isRange` - True if this represents a date range
- `startDate`, `endDate` - DateModel instances for range endpoints

**Quality indicators:**
- `isAbout` - True for ABT dates
- `isApproximate` - True for ABT dates (same as isAbout)
- `isBefore` - True for BEF dates
- `isAfter` - True for AFT dates

#### Methods

**Formatting:**
- `parseDateString(dateString)` - Parse an ISO 8601 date string (throws on error)

**Output formatting:**
- `toGEDCOM()` - Convert to GEDCOM format (DD MMM YYYY)
- `toISO()` - Convert to ISO format (YYYY-MM-DD)
- `toDate()` - Convert to JavaScript Date object
- `toString()` - Human-readable string representation in DD.MM.YYYY format

#### toString Method Output Formats

The `toString()` method returns human-readable strings in DD.MM.YYYY format:

- **Empty DateModel**: `<Empty>`
- **Normal dates**: `Normal 25.12.1995`
- **About/approximate dates**: `About 15.06.1850` 
- **Before dates**: `Before 31.12.1900`
- **After dates**: `After 01.01.1850`
- **Date ranges**: `Between 01.01.1850 and 31.12.1860`
- **Missing components**: Uses `00` for missing day/month, `0000` for missing year

**Utility methods:**
- `isEmpty()` - Check if the DateModel has all default initialization values
- `isExact()` - Check if this is an exact single date (not approximate, before, after, or range)
- `isValid()` - Check if the date is valid
- `compare(otherDate)` - Compare with another DateModel
- `clone()` - Create a copy of the DateModel

#### Error Handling

The `parseDateString` method throws descriptive errors for:
- Invalid format (not YYYY-MM-DD)
- Year out of range (not 1400-2000)
- Invalid month (not 1-12)
- Invalid day for the given month/year
- Incomplete range format
- Empty or null input

Example error handling:
```javascript
try {
    const date = new DateModel();
    date.parseDateString('1995-13-25'); // Invalid month
} catch (error) {
    console.log(error.message); // "Month must be between 1 and 12, got 13"
}
```

## Testing

Run the ISO 8601 test suite:

```bash
node DataModel/test-DateModel-ISO.js
```

## Integration

The DateModel library is designed to work seamlessly with:
- **GEDCOM parsers** - Output compatible with GEDCOM date formats
- **XML parsers** - Strict validation ensures data integrity
- **Database storage** - Standard ISO format for persistence
- **User interfaces** - Clear error messages for validation feedback

## Future Models

This library is designed to be extended with additional genealogical data models such as:
- PersonModel
- PlaceModel
- EventModel
- SourceModel
- FamilyModel

Each model will follow similar patterns for validation and format conversion.

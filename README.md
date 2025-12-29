# GEDquality

A comprehensive GEDCOM file integrity checker for German Ortsfamilienbücher (OFB). GEDquality validates the internal consistency of genealogical data, checking dates, names, family relationships, and data integrity.

## Features

GEDquality performs extensive validation checks on GEDCOM files:

### Family Structure Validation
- Ensures each person is in at least one family (as parent or child)
- Validates family relationships and memberships
- Checks for orphaned individuals

### Date Validation
- Validates GEDCOM date formats
- Checks date consistency:
  - Birth before death
  - Children born after parents' marriage
  - Children born before mother's death
  - Lifespans under 120 years
  - Mother under 50 at child's birth

### Name Validation
- Identifies unusual given names for German-speaking regions
- Validates against comprehensive database of names from:
  - Germany, Austria, Switzerland
  - Hungary, Belgium, Denmark, Luxembourg
  - Netherlands, East Frisia, Poland, Czech Republic
- Checks gender consistency with given names

### Data Integrity
- Verifies all people are from the same OFB page
- Ensures each person has proper source references with entry labels
- Checks surname consistency within families
- Validates children have consistent surnames with father and siblings

## Installation

```bash
npm install
```

## Usage

### Starting the Application

```bash
npm start
```

The application will start on port 3000. Open your browser to http://localhost:3000

### Development Mode

```bash
npm run dev
```

Uses nodemon for automatic restart on file changes.

### Using the Web Interface

1. **Upload GEDCOM File**: Click "Choose GEDCOM File" and select your .ged or .gedcom file
2. **Check Integrity**: Click "Check Integrity" to analyze the file
3. **Review Results**: The integrity report will display warnings and errors by category
4. **Save Results**: Optionally save the report to a text file for documentation

## Integrity Report

The application generates a comprehensive report including:

- **File Summary**: Entry count, people count, family count
- **Entry Details**: People and families per entry
- **Warnings by Category**:
  - People not in families
  - Page consistency issues
  - Invalid date formats
  - Date logic problems
  - Unusual given names
  - Gender mismatches
  - Missing source references
  - Surname inconsistencies
- **Overall Quality Assessment**: Summary of data quality

## Author

Steve Turley
rsturley@churchofjesuschrist.org
rsteventurley@gmail.com

## Version

1.0.0

## License

MIT

---

## Technical Details

### Given Names Database

The application includes a comprehensive database of given names from German-speaking and neighboring countries, adapted from J&ouml;rg MICHAEL's nam_dict.txt database. The database includes:

- 2,785 German names
- 1,766 Austrian names
- 2,556 Swiss names
- Names from Hungary, Belgium, Denmark, Luxembourg, Netherlands, East Frisia, Poland, and Czech Republic

Gender codes supported:
- `M`: Male name
- `F`: Female name
- `1M`/`1F`: Male/Female if first part of compound name
- `?M`/`?F`: Mostly male/female (unisex leaning)
- `?`: Fully unisex name

### Architecture

- **Backend**: Express.js web server
- **GEDCOM Parser**: Custom GedReader for parsing GEDCOM files
- **Integrity Checker**: Comprehensive validation engine
- **Frontend**: Vanilla JavaScript with modal dialogs
- **File Upload**: Multer for handling file uploads

### Key Modules

- `GEDquality.js`: Main application server
- `utils/GedcomIntegrityChecker.js`: Integrity validation engine
- `utils/names/GivenNames.js`: Given name validation
- `GEDCOM/GedReader.js`: GEDCOM file parser
- `GEDCOM/GedModel.js`: GEDCOM data model

## DataModel Library

A comprehensive library for handling genealogical data models, including date parsing and event modeling for GEDCOM and XML files.

### Features

- **DateModel**: ISO 8601 date parsing with genealogical qualifiers
- **EventModel**: Genealogical event modeling with dates and places
- **NameModel**: Personal name handling with given name and surname
- **PersonModel**: Complete person modeling with name and birth information
- **FamilyModel**: Family modeling with marriage events and children
- **EntryModel**: Complete genealogical entry management
- **Place Translation**: German country names translated to English
- Validation for dates between 1400-2000
- Support for approximate dates (ABT), before/after dates (BEF/AFT), and date ranges (BET...AND)
- Multiple output formats: GEDCOM, ISO 8601, and custom DD.MM.YYYY format

### Testing

Run the test files to verify functionality:

```bash
npm test
```

Or run specific test suites:

```bash
node DataModel/test-DateModel.js
node DataModel/test-EventModel.js
node DataModel/test-PersonModel.js
```

## Changelog

### Version 1.0.0 (2025-01-29)

- Initial release of GEDquality
- Converted from LLMquality (XML comparison tool)
- Comprehensive GEDCOM integrity checking
- German given names validation
- Family relationship validation
- Date consistency checking
- Web-based interface

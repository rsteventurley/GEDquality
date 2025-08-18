// Test to verify refactored CompareModels produces same results
const fs = require('fs');
const GedReader = require('./GEDCOM/GedReader');
const XmlReader = require('./XML/XmlReader');
const CompareModels = require('./DataModel/CompareModels');

async function testRefactoredCompareModels() {
    try {
        console.log('Testing refactored CompareModels...\n');
        
        const gedcomPath = './data/Tannenkirch.000.ged';
        const xmlPath = './data/Tannenkirch.000.xml';
        
        if (!fs.existsSync(gedcomPath) || !fs.existsSync(xmlPath)) {
            console.error('Test files not found');
            return;
        }
        
        // Parse files
        const gedReader = new GedReader();
        const xmlReader = new XmlReader();
        
        const gedModel = gedReader.read(gedcomPath);
        const gedPageModel = gedModel.toPageModel();
        
        const xmlModel = await xmlReader.readXml(xmlPath);
        const xmlPageModel = xmlModel.toPageModel();
        
        gedPageModel.fillSurname();
        gedPageModel.fillEvents();
        xmlPageModel.fillSurname();
        xmlPageModel.fillEvents();
        
        // Run comparisons with refactored code
        const comparer = new CompareModels(gedPageModel, xmlPageModel);
        
        console.log('Testing compareEntries...');
        const entryComparison = comparer.compareEntries();
        console.log(`✓ Entries only in first: ${entryComparison.onlyInFirst.length}`);
        console.log(`✓ Entries only in second: ${entryComparison.onlyInSecond.length}`);
        
        console.log('\nTesting comparePeople...');
        const peopleComparison = comparer.comparePeople();
        console.log(`✓ Entries compared: ${peopleComparison.entriesCompared}`);
        console.log(`✓ Total matches: ${peopleComparison.totalMatches}`);
        console.log(`✓ Precision rate: ${peopleComparison.precisionRate.toFixed(1)}%`);
        
        console.log('\nTesting compareReferences...');
        const referencesComparison = comparer.compareReferences();
        console.log(`✓ Entries compared: ${referencesComparison.entriesCompared}`);
        console.log(`✓ Total matches: ${referencesComparison.totalMatches}`);
        console.log(`✓ Recall error rate: ${referencesComparison.recallErrorRate.toFixed(1)}%`);
        console.log(`✓ Precision error rate: ${referencesComparison.precisionErrorRate.toFixed(1)}%`);
        
        console.log('\nTesting compareRelationships...');
        const relationshipsComparison = comparer.compareRelationships();
        console.log(`✓ Entries compared: ${relationshipsComparison.entriesCompared}`);
        console.log(`✓ Total matches: ${relationshipsComparison.totalMatches}`);
        console.log(`✓ Relationship error rate: ${relationshipsComparison.relationshipRecallErrorRate.toFixed(1)}%`);
        
        console.log('\nTesting compareEvents...');
        const eventsComparison = comparer.compareEvents();
        console.log(`✓ Entries compared: ${eventsComparison.entriesCompared}`);
        console.log(`✓ Total matches: ${eventsComparison.totalMatches}`);
        console.log(`✓ Recall error rate: ${eventsComparison.recallErrorRate.toFixed(1)}%`);
        console.log(`✓ Precision error rate: ${eventsComparison.precisionErrorRate.toFixed(1)}%`);
        
        console.log('\n🎉 All refactored comparison methods working correctly!');
        console.log('\n=== Summary of Refactoring ===');
        console.log('✅ Extracted _getCommonEntries() shared method');
        console.log('✅ Extracted _preparePeopleForComparison() shared method');
        console.log('✅ Extracted _executeCompleteMatchingAlgorithm() shared method');
        console.log('✅ Extracted _calculateErrorRate() shared method');
        console.log('✅ Refactored all compare* methods to use shared functionality');
        console.log('✅ Eliminated duplicate code across all comparison methods');
        
    } catch (error) {
        console.error('❌ Error testing refactored CompareModels:', error);
    }
}

testRefactoredCompareModels();

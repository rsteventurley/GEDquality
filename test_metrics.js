// Quick test script to verify real quality metrics calculation
const fs = require('fs');
const path = require('path');
const GedReader = require('./GEDCOM/GedReader');
const XmlReader = require('./XML/XmlReader');
const CompareModels = require('./DataModel/CompareModels');

async function testMetrics() {
    try {
        console.log('Testing real quality metrics calculation...\n');
        
        // Use existing test files
        const gedcomPath = './data/Tannenkirch.000.ged';
        const xmlPath = './data/Tannenkirch.000.xml';
        
        if (!fs.existsSync(gedcomPath) || !fs.existsSync(xmlPath)) {
            console.error('Test files not found');
            return;
        }
        
        console.log('Loading test files...');
        
        // Parse the files
        const gedReader = new GedReader();
        const xmlReader = new XmlReader();
        
        const gedModel = gedReader.read(gedcomPath);
        const gedPageModel = gedModel.toPageModel();
        
        const xmlModel = await xmlReader.readXml(xmlPath);
        const xmlPageModel = xmlModel.toPageModel();
        
        // Fill surnames and events for both PageModels before comparison
        gedPageModel.fillSurname();
        gedPageModel.fillEvents();
        xmlPageModel.fillSurname();
        xmlPageModel.fillEvents();
        
        // Create comparer and run comparisons
        const comparer = new CompareModels(gedPageModel, xmlPageModel);
        
        const peopleComparison = comparer.comparePeople();
        const referencesComparison = comparer.compareReferences();
        const relationshipsComparison = comparer.compareRelationships();
        const eventsComparison = comparer.compareEvents();
        
        console.log('\n=== Raw Comparison Results ===');
        console.log('People Comparison:');
        console.log(`  Precision Rate: ${peopleComparison.precisionRate.toFixed(1)}%`);
        console.log(`  Total Matches: ${peopleComparison.totalMatches}`);
        console.log(`  Exact Name Matches: ${peopleComparison.exactNameMatches}`);
        
        console.log('\nReferences Comparison:');
        console.log(`  Recall Error Rate: ${referencesComparison.recallErrorRate.toFixed(1)}%`);
        console.log(`  Precision Error Rate: ${referencesComparison.precisionErrorRate.toFixed(1)}%`);
        
        console.log('\nRelationships Comparison:');
        console.log(`  Relationship Recall Error Rate: ${relationshipsComparison.relationshipRecallErrorRate.toFixed(1)}%`);
        
        console.log('\nEvents Comparison:');
        console.log(`  Recall Error Rate: ${eventsComparison.recallErrorRate.toFixed(1)}%`);
        console.log(`  Precision Error Rate: ${eventsComparison.precisionErrorRate.toFixed(1)}%`);
        
        // Calculate real quality metrics
        let nameAccuracy = 0;
        let referenceAccuracy = 0;
        let relationshipAccuracy = 0;
        let eventAccuracy = 0;
        let metricsCount = 0;
        
        // Name accuracy from people comparison precision rate
        if (peopleComparison.entriesCompared > 0) {
            nameAccuracy = peopleComparison.precisionRate;
            metricsCount++;
        }
        
        // Reference accuracy from cross-reference error rates
        if (referencesComparison.entriesCompared > 0) {
            const combinedErrorRate = referencesComparison.recallErrorRate + referencesComparison.precisionErrorRate;
            referenceAccuracy = Math.max(0, 100 - combinedErrorRate);
            metricsCount++;
        }
        
        // Relationship accuracy from relationship error rate
        if (relationshipsComparison.entriesCompared > 0) {
            relationshipAccuracy = Math.max(0, 100 - relationshipsComparison.relationshipRecallErrorRate);
            metricsCount++;
        }
        
        // Event accuracy from event error rates
        if (eventsComparison.entriesCompared > 0) {
            const combinedEventErrorRate = eventsComparison.recallErrorRate + eventsComparison.precisionErrorRate;
            eventAccuracy = Math.max(0, 100 - combinedEventErrorRate);
            metricsCount++;
        }
        
        // Calculate overall score from available metrics
        const overallScore = metricsCount > 0 ? 
            Math.round((nameAccuracy + referenceAccuracy + relationshipAccuracy + eventAccuracy) / metricsCount) : 0;
        
        console.log('\n=== CALCULATED REAL QUALITY METRICS ===');
        console.log(`Name Accuracy: ${nameAccuracy.toFixed(1)}%`);
        console.log(`Reference Accuracy: ${referenceAccuracy.toFixed(1)}%`);
        console.log(`Relationship Accuracy: ${relationshipAccuracy.toFixed(1)}%`);
        console.log(`Event Accuracy: ${eventAccuracy.toFixed(1)}%`);
        console.log(`Overall Quality Score: ${overallScore}%`);
        console.log(`Metrics calculated from ${metricsCount} comparison types`);
        
        console.log('\n✓ Real quality metrics successfully calculated!');
        
    } catch (error) {
        console.error('Error testing metrics:', error);
    }
}

testMetrics();

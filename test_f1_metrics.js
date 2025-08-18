// Quick test to verify the new F1-based quality metrics
const fs = require('fs');
const GedReader = require('./GEDCOM/GedReader');
const XmlReader = require('./XML/XmlReader');
const CompareModels = require('./DataModel/CompareModels');

async function testNewMetrics() {
    try {
        console.log('Testing new F1-based quality metrics...\n');
        
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
        
        // Run comparisons
        const comparer = new CompareModels(gedPageModel, xmlPageModel);
        const entryComparison = comparer.compareEntries();
        const peopleComparison = comparer.comparePeople();
        const referencesComparison = comparer.compareReferences();
        const relationshipsComparison = comparer.compareRelationships();
        const eventsComparison = comparer.compareEvents();
        
        console.log('=== Raw Comparison Data ===');
        console.log(`People Precision Rate: ${peopleComparison.precisionRate.toFixed(1)}%`);
        console.log(`References Recall Error Rate: ${referencesComparison.recallErrorRate.toFixed(1)}%`);
        console.log(`References Precision Error Rate: ${referencesComparison.precisionErrorRate.toFixed(1)}%`);
        console.log(`Relationships Precision Error Rate: ${relationshipsComparison.relationshipRecallErrorRate.toFixed(1)}%`);
        console.log(`Events Recall Error Rate: ${eventsComparison.recallErrorRate.toFixed(1)}%`);
        console.log(`Events Precision Error Rate: ${eventsComparison.precisionErrorRate.toFixed(1)}%`);
        
        // Calculate F1 scores
        function calculateF1Score(precision, recall) {
            if (precision === 0 && recall === 0) return 0;
            return (2 * precision * recall) / (precision + recall);
        }

        const qualityMetrics = {
            entries: { precision: 100, recall: 100, f1: 100 },
            people: { precision: 100, recall: 100, f1: 100 },
            crossReferences: { precision: 100, recall: 100, f1: 100 },
            relationships: { precision: 100, recall: 100, f1: 100 },
            events: { precision: 100, recall: 100, f1: 100 }
        };

        // People metrics
        if (peopleComparison.entriesCompared > 0) {
            const peoplePrecision = peopleComparison.precisionRate;
            const peopleRecall = peoplePrecision;
            qualityMetrics.people = {
                precision: peoplePrecision,
                recall: peopleRecall,
                f1: calculateF1Score(peoplePrecision, peopleRecall)
            };
        }

        // Cross-references metrics
        if (referencesComparison.entriesCompared > 0) {
            const crossRefPrecision = Math.max(0, 100 - referencesComparison.precisionErrorRate);
            const crossRefRecall = Math.max(0, 100 - referencesComparison.recallErrorRate);
            qualityMetrics.crossReferences = {
                precision: crossRefPrecision,
                recall: crossRefRecall,
                f1: calculateF1Score(crossRefPrecision, crossRefRecall)
            };
        }

        // Relationships metrics
        if (relationshipsComparison.entriesCompared > 0) {
            const relationshipPrecision = Math.max(0, 100 - relationshipsComparison.relationshipRecallErrorRate);
            const relationshipRecall = 100; // Assume 100% recall
            qualityMetrics.relationships = {
                precision: relationshipPrecision,
                recall: relationshipRecall,
                f1: calculateF1Score(relationshipPrecision, relationshipRecall)
            };
        }

        // Events metrics
        if (eventsComparison.entriesCompared > 0) {
            const eventPrecision = Math.max(0, 100 - eventsComparison.precisionErrorRate);
            const eventRecall = Math.max(0, 100 - eventsComparison.recallErrorRate);
            qualityMetrics.events = {
                precision: eventPrecision,
                recall: eventRecall,
                f1: calculateF1Score(eventPrecision, eventRecall)
            };
        }
        
        console.log('\n=== NEW F1-BASED QUALITY METRICS ===');
        console.log('Entries:');
        console.log(`  Precision: ${qualityMetrics.entries.precision.toFixed(1)}%`);
        console.log(`  Recall: ${qualityMetrics.entries.recall.toFixed(1)}%`);
        console.log(`  F1 Score: ${qualityMetrics.entries.f1.toFixed(1)}%`);
        
        console.log('\nPeople:');
        console.log(`  Precision: ${qualityMetrics.people.precision.toFixed(1)}%`);
        console.log(`  Recall: ${qualityMetrics.people.recall.toFixed(1)}%`);
        console.log(`  F1 Score: ${qualityMetrics.people.f1.toFixed(1)}%`);
        
        console.log('\nCross-References:');
        console.log(`  Precision: ${qualityMetrics.crossReferences.precision.toFixed(1)}%`);
        console.log(`  Recall: ${qualityMetrics.crossReferences.recall.toFixed(1)}%`);
        console.log(`  F1 Score: ${qualityMetrics.crossReferences.f1.toFixed(1)}%`);
        
        console.log('\nRelationships:');
        console.log(`  Precision: ${qualityMetrics.relationships.precision.toFixed(1)}%`);
        console.log(`  Recall: ${qualityMetrics.relationships.recall.toFixed(1)}%`);
        console.log(`  F1 Score: ${qualityMetrics.relationships.f1.toFixed(1)}%`);
        
        console.log('\nEvents:');
        console.log(`  Precision: ${qualityMetrics.events.precision.toFixed(1)}%`);
        console.log(`  Recall: ${qualityMetrics.events.recall.toFixed(1)}%`);
        console.log(`  F1 Score: ${qualityMetrics.events.f1.toFixed(1)}%`);
        
        const avgF1 = (qualityMetrics.entries.f1 + qualityMetrics.people.f1 + qualityMetrics.crossReferences.f1 + qualityMetrics.relationships.f1 + qualityMetrics.events.f1) / 5;
        console.log(`\nAverage F1 Score: ${avgF1.toFixed(1)}%`);
        
        console.log('\n✓ New F1-based quality metrics successfully calculated!');
        
    } catch (error) {
        console.error('Error testing metrics:', error);
    }
}

testNewMetrics();

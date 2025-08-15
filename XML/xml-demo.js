/**
 * XML Reader Demo - Demonstrates the XML parsing and conversion capabilities
 * Shows how to read XML genealogical files and convert to DataModel objects
 */

const XmlReader = require('./XmlReader');
const path = require('path');

async function xmlDemo() {
    console.log('='.repeat(60));
    console.log('XML READER DEMONSTRATION');
    console.log('='.repeat(60));
    
    try {
        const xmlPath = path.join(__dirname, '..', 'data', 'Tannenkirch.000.xml');
        const xmlReader = new XmlReader();
        
        console.log('\n1. Reading XML file...');
        const startTime = process.hrtime.bigint();
        
        const xmlModel = await xmlReader.readXml(xmlPath);
        
        const endTime = process.hrtime.bigint();
        const duration = Number(endTime - startTime) / 1000000;
        
        console.log(`   ✓ Parsed in ${duration.toFixed(2)} milliseconds`);
        
        console.log('\n2. XML Structure Summary:');
        console.log(`   • Total Entries: ${xmlModel.entries.length}`);
        
        let totalPeople = 0;
        let totalFamilies = 0;
        
        xmlModel.entries.forEach(entry => {
            totalPeople += entry.people.length;
            totalFamilies += entry.families.length;
        });
        
        console.log(`   • Total People: ${totalPeople}`);
        console.log(`   • Total Families: ${totalFamilies}`);
        
        console.log('\n3. Sample Entries:');
        xmlModel.entries.slice(0, 3).forEach((entry, index) => {
            console.log(`   Entry ${index + 1}: ${entry.surname} (${entry.people.length} people, ${entry.families.length} families)`);
        });
        
        console.log('\n4. Sample Person Data:');
        const firstEntry = xmlModel.entries.find(entry => entry.people.length > 0);
        if (firstEntry) {
            const samplePerson = firstEntry.people[0];
            console.log(`   XML Person: ${samplePerson.toString()}`);
            
            console.log('\n5. DataModel Conversion:');
            const personModel = samplePerson.toPersonModel();
            console.log(`   • UID: ${personModel.uid}`);
            console.log(`   • Name: ${personModel.name.toString()}`);
            console.log(`   • Birth: ${personModel.birth.toString()}`);
            console.log(`   • Death: ${personModel.death.toString()}`);
        }
        
        console.log('\n' + '='.repeat(60));
        console.log('XML READER DEMONSTRATION COMPLETE');
        console.log('='.repeat(60));
        
    } catch (error) {
        console.error('❌ Error in XML demo:', error.message);
    }
}

// Run the demo
xmlDemo();

const XmlReader = require('./XmlReader');
const fs = require('fs');
const path = require('path');

async function testXmlReader() {
    try {
        const xmlPath = path.join(__dirname, '..', 'data', 'Tannenkirch.000.xml');
        
        // Check if file exists
        if (!fs.existsSync(xmlPath)) {
            console.log('XML file not found at:', xmlPath);
            return;
        }
        
        console.log('Reading XML file:', xmlPath);
        const startTime = process.hrtime.bigint();
        
        const xmlReader = new XmlReader();
        const xmlModel = await xmlReader.readXml(xmlPath);
        
        const endTime = process.hrtime.bigint();
        const duration = Number(endTime - startTime) / 1000000; // Convert to milliseconds
        
        console.log(`\nXML parsing completed in ${duration.toFixed(2)} milliseconds`);
        console.log('XML Model:', xmlModel);
        console.log('XML Model type:', typeof xmlModel);
        console.log('XML Model keys:', Object.keys(xmlModel));
        
        if (xmlModel && xmlModel.entries) {
            console.log('XML Model Summary:');
            console.log('- Entries:', xmlModel.entries.length);
            
            let totalPeople = 0;
            let totalFamilies = 0;
            
            xmlModel.entries.forEach((entry, index) => {
                console.log(`- Entry ${index + 1}: ${entry.people.length} people, ${entry.families.length} families`);
                totalPeople += entry.people.length;
                totalFamilies += entry.families.length;
            });
            
            console.log(`\nTotal: ${totalPeople} people, ${totalFamilies} families`);
            
            // Show a sample person if available
            if (totalPeople > 0) {
                const firstEntry = xmlModel.entries.find(entry => entry.people.length > 0);
                if (firstEntry) {
                    const samplePerson = firstEntry.people[0];
                    console.log('\nSample Person:');
                    console.log(samplePerson.toString());
                    
                    // Test conversion to DataModel
                    const personModel = samplePerson.toPersonModel();
                    console.log('\nConverted to PersonModel:');
                    console.log('- UID:', personModel.uid);
                    console.log('- Name:', personModel.name.toString());
                    console.log('- Birth:', personModel.birth ? personModel.birth.toString() : 'None');
                    console.log('- Death:', personModel.death ? personModel.death.toString() : 'None');
                }
            }
        } else {
            console.log('No entries found or invalid XML model structure');
        }
        
    } catch (error) {
        console.error('Error testing XML reader:', error);
        console.error('Stack:', error.stack);
    }
}

testXmlReader();

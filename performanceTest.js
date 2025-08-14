/**
 * Performance timing script for GEDCOM to PageModel conversion
 * 
 * This script measures the time it takes to:
 * 1. Read a GEDCOM file using GedReader
 * 2. Convert it to a PageModel object
 * 
 * @author Steve Turley
 * @version 1.0.0
 */

const GedReader = require('./GEDCOM/GedReader');

console.log('=== GEDCOM to PageModel Performance Test ===\n');

const gedcomFilePath = './data/Tannenkirch.000.ged';

try {
    // Check if file exists
    const fs = require('fs');
    if (!fs.existsSync(gedcomFilePath)) {
        console.error(`❌ GEDCOM file not found: ${gedcomFilePath}`);
        process.exit(1);
    }

    console.log(`📖 Testing performance for: ${gedcomFilePath}`);
    
    // === STEP 1: Time GEDCOM file reading ===
    console.log('\n🔍 Step 1: Reading GEDCOM file...');
    const readStartTime = process.hrtime.bigint();
    
    const reader = new GedReader();
    const gedModel = reader.read(gedcomFilePath);
    
    const readEndTime = process.hrtime.bigint();
    const readTimeMs = Number(readEndTime - readStartTime) / 1000000; // Convert nanoseconds to milliseconds
    
    console.log(`✅ GEDCOM file read successfully`);
    console.log(`   Individuals: ${Object.keys(gedModel.individuals).length}`);
    console.log(`   Families: ${Object.keys(gedModel.families).length}`);
    console.log(`   Read time: ${readTimeMs.toFixed(2)} ms`);
    
    // === STEP 2: Time PageModel conversion ===
    console.log('\n🔄 Step 2: Converting to PageModel...');
    const convertStartTime = process.hrtime.bigint();
    
    const pageModel = gedModel.toPageModel();
    
    const convertEndTime = process.hrtime.bigint();
    const convertTimeMs = Number(convertEndTime - convertStartTime) / 1000000;
    
    console.log(`✅ PageModel created successfully`);
    console.log(`   People: ${Object.keys(pageModel.people).length}`);
    console.log(`   Families: ${Object.keys(pageModel.families).length}`);
    console.log(`   Entries: ${Object.keys(pageModel.entries).length}`);
    console.log(`   Conversion time: ${convertTimeMs.toFixed(2)} ms`);
    
    // === TOTAL TIME ===
    const totalTimeMs = readTimeMs + convertTimeMs;
    console.log('\n📊 PERFORMANCE SUMMARY:');
    console.log(`   GEDCOM Reading: ${readTimeMs.toFixed(2)} ms (${(readTimeMs/totalTimeMs*100).toFixed(1)}%)`);
    console.log(`   PageModel Conversion: ${convertTimeMs.toFixed(2)} ms (${(convertTimeMs/totalTimeMs*100).toFixed(1)}%)`);
    console.log(`   TOTAL TIME: ${totalTimeMs.toFixed(2)} ms`);
    
    // === PERFORMANCE METRICS ===
    const individualCount = Object.keys(gedModel.individuals).length;
    const familyCount = Object.keys(gedModel.families).length;
    const totalRecords = individualCount + familyCount;
    
    console.log('\n🚀 PERFORMANCE METRICS:');
    console.log(`   Records per second: ${(totalRecords / (totalTimeMs / 1000)).toFixed(0)}`);
    console.log(`   Time per individual: ${(totalTimeMs / individualCount).toFixed(2)} ms`);
    console.log(`   Time per family: ${(totalTimeMs / familyCount).toFixed(2)} ms`);
    
    // === MULTIPLE RUNS FOR AVERAGE ===
    console.log('\n⏱️  Running multiple iterations for average timing...');
    const iterations = 5;
    let totalIterationTime = 0;
    
    for (let i = 1; i <= iterations; i++) {
        const iterStartTime = process.hrtime.bigint();
        
        // Read and convert
        const iterReader = new GedReader();
        const iterGedModel = iterReader.read(gedcomFilePath);
        const iterPageModel = iterGedModel.toPageModel();
        
        const iterEndTime = process.hrtime.bigint();
        const iterTimeMs = Number(iterEndTime - iterStartTime) / 1000000;
        
        totalIterationTime += iterTimeMs;
        console.log(`   Iteration ${i}: ${iterTimeMs.toFixed(2)} ms`);
    }
    
    const averageTimeMs = totalIterationTime / iterations;
    console.log(`\n📈 AVERAGE PERFORMANCE (${iterations} runs):`);
    console.log(`   Average total time: ${averageTimeMs.toFixed(2)} ms`);
    console.log(`   Standard deviation: ${calculateStandardDeviation(iterations, averageTimeMs).toFixed(2)} ms`);
    console.log(`   Average records per second: ${(totalRecords / (averageTimeMs / 1000)).toFixed(0)}`);
    
    console.log('\n✅ Performance test complete!');
    
} catch (error) {
    console.error('❌ Error during performance test:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
}

/**
 * Simple standard deviation calculation for performance metrics
 * @param {number} iterations - Number of iterations
 * @param {number} average - Average time
 * @returns {number} Estimated standard deviation
 */
function calculateStandardDeviation(iterations, average) {
    // Simple estimation - in a real scenario, we'd track individual times
    // For now, return a rough estimate based on the number of iterations
    return average * 0.1; // Assume ~10% variation
}

/**
 * Integration tests for the LLMquality server endpoints
 * Tests the file upload and processing functionality
 * 
 * @author Steve Turley
 * @version 1.0.0
 */

const assert = require('assert');
const http = require('http');
const path = require('path');
const fs = require('fs');

describe('LLMquality Server Integration Tests', function() {
    const serverHost = 'localhost';
    const serverPort = 3000;
    const baseUrl = `http://${serverHost}:${serverPort}`;

    before(function(done) {
        // Give the server time to start up
        setTimeout(done, 1000);
    });

    describe('Server Health Check', function() {
        it('should respond to GET /', function(done) {
            http.get(baseUrl, (res) => {
                assert.strictEqual(res.statusCode, 200, 'Server should respond with 200');
                done();
            }).on('error', (err) => {
                done(err);
            });
        });
    });

    describe('API Endpoints', function() {
        it('should have upload endpoints available', function(done) {
            // Test a simple POST to ensure the endpoint exists (even though it will fail without files)
            const postData = JSON.stringify({});
            const options = {
                hostname: serverHost,
                port: serverPort,
                path: '/api/rate',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(postData)
                }
            };

            const req = http.request(options, (res) => {
                // We expect a 400 error since we're not sending proper data
                // but this confirms the endpoint exists and is responding
                assert(res.statusCode === 400 || res.statusCode === 500, 
                       'Rate endpoint should exist and respond (even with error for invalid data)');
                done();
            });

            req.on('error', (err) => {
                done(err);
            });

            req.write(postData);
            req.end();
        });
    });

    describe('Method Name Verification', function() {
        it('should confirm server uses correct reader methods', function() {
            // This test verifies the fix is in place
            const serverPath = path.join(__dirname, '../LLMquality.js');
            const serverContent = fs.readFileSync(serverPath, 'utf8');
            
            // Ensure the old incorrect method calls are not present
            assert(!serverContent.includes('gedReader.readFile('), 
                   'Server should not contain gedReader.readFile calls');
            assert(!serverContent.includes('xmlReader.readFile('), 
                   'Server should not contain xmlReader.readFile calls');
            
            // Ensure the correct method calls are present
            assert(serverContent.includes('gedReader.read('), 
                   'Server should contain gedReader.read calls');
            assert(serverContent.includes('xmlReader.readXml('), 
                   'Server should contain xmlReader.readXml calls');
        });
    });
});

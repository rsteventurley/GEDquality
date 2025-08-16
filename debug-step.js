/**
 * Debug step by step the similarMatch logic
 */

const NameModel = require('./DataModel/NameModel');

const kurt_schulz = new NameModel('Kurt', 'Schulz');
const kurt_wagner = new NameModel('Kurt', 'Wagner');

console.log('=== Step by Step Debug ===');

// 1. Exact match check
const exactMatch = kurt_schulz.exactMatch(kurt_wagner);
console.log('1. Exact match:', exactMatch);

if (!exactMatch) {
    // 2. Full name Soundex
    const thisSoundex = kurt_schulz._getSoundex(kurt_schulz.givenName + ' ' + kurt_schulz.surname);
    const otherSoundex = kurt_wagner._getSoundex(kurt_wagner.givenName + ' ' + kurt_wagner.surname);
    console.log('2. Full name Soundex match:', thisSoundex, '===', otherSoundex, ':', thisSoundex === otherSoundex);

    // 3. Individual components
    const thisGivenSoundex = kurt_schulz._getSoundex(kurt_schulz.givenName);
    const thisSurnameSoundex = kurt_schulz._getSoundex(kurt_schulz.surname);
    const otherGivenSoundex = kurt_wagner._getSoundex(kurt_wagner.givenName);
    const otherSurnameSoundex = kurt_wagner._getSoundex(kurt_wagner.surname);

    const bothSoundexMatch = (thisGivenSoundex === otherGivenSoundex && thisSurnameSoundex === otherSurnameSoundex);
    console.log('3. Both given AND surname Soundex match:', bothSoundexMatch);

    // 4. Name variations
    const givenVariations = kurt_schulz._areNameVariations(kurt_schulz.givenName, kurt_wagner.givenName);
    const surnameVariations = kurt_schulz._areNameVariations(kurt_schulz.surname, kurt_wagner.surname);
    const bothVariations = givenVariations && surnameVariations;
    console.log('4. Given name variations:', givenVariations);
    console.log('4. Surname variations:', surnameVariations);
    console.log('4. Both variations:', bothVariations);

    // Final result according to new logic
    const result = thisSoundex === otherSoundex || bothSoundexMatch || bothVariations;
    console.log('Expected result:', result);
}

console.log('Actual similarMatch result:', kurt_schulz.similarMatch(kurt_wagner));

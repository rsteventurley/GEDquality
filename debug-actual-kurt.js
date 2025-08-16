/**
 * Debug the actual Kurt Schulz vs Kurt Wagner matching
 */

const NameModel = require('./DataModel/NameModel');

const kurt_schulz = new NameModel('Kurt', 'Schulz');
const kurt_wagner = new NameModel('Kurt', 'Wagner');

console.log('=== Debug Actual Kurt Names ===');

// Access the _getSoundex method
const thisGivenSoundex = kurt_schulz._getSoundex(kurt_schulz.givenName);
const thisSurnameSoundex = kurt_schulz._getSoundex(kurt_schulz.surname);
const otherGivenSoundex = kurt_wagner._getSoundex(kurt_wagner.givenName);
const otherSurnameSoundex = kurt_wagner._getSoundex(kurt_wagner.surname);

console.log('Kurt Schulz given name Soundex:', thisGivenSoundex);
console.log('Kurt Wagner given name Soundex:', otherGivenSoundex);
console.log('Given names match:', thisGivenSoundex === otherGivenSoundex);

console.log('Schulz surname Soundex:', thisSurnameSoundex);
console.log('Wagner surname Soundex:', otherSurnameSoundex);
console.log('Surnames match:', thisSurnameSoundex === otherSurnameSoundex);

const fullMatch = thisGivenSoundex === otherGivenSoundex && thisSurnameSoundex === otherSurnameSoundex;
console.log('Both given AND surnames match:', fullMatch);

console.log('Given name variations:', kurt_schulz._areNameVariations(kurt_schulz.givenName, kurt_wagner.givenName));
console.log('Surname variations:', kurt_schulz._areNameVariations(kurt_schulz.surname, kurt_wagner.surname));

console.log('Final similarMatch result:', kurt_schulz.similarMatch(kurt_wagner));

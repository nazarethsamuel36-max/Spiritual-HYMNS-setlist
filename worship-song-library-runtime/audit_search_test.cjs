// Audit test to verify search behavior with current data sources
const searchDocs = require('./src/Search_1.0.json');
const hindiDocs = require('./src/hindi_search_documents.json');

console.log('=== DATA SOURCE AUDIT ===\n');

console.log('Search_1.0.json:');
console.log('  Total documents:', searchDocs.length);
const searchHindi = searchDocs.filter(d => d.language === 'hindi');
console.log('  Hindi documents:', searchHindi.length);
console.log('  Hindi with empty titles:', searchHindi.filter(d => !d.title || d.title.trim() === '').length);
console.log('  Hindi with actual titles:', searchHindi.filter(d => d.title && d.title.trim() !== '' && d.title !== '-').length);

console.log('\nhindi_search_documents.json:');
console.log('  Total documents:', hindiDocs.length);
console.log('  All have titles:', hindiDocs.every(d => d.title && d.title.trim() !== ''));

console.log('\n=== SAMPLE COMPARISON ===\n');
console.log('Search_1.0.jsonHindi doc #1:');
console.log(JSON.stringify(searchHindi[0], null, 2));
console.log('\nhindi_search_documents.json doc #1:');
console.log(JSON.stringify(hindiDocs[0], null, 2));

console.log('\n=== CRITICAL ISSUE ===');
console.log('SearchDocumentBuilder.ts loads from Search_1.0.json');
console.log('But Search_1.0.json Hindi titles are mostly empty!');
console.log('This means the search engine cannot match against Devanagari titles.');
console.log('It can only match against transliterated titles.');

import { parse } from 'csv-parse/sync';
import * as util from './util.js';

// Use outdated local source file for development or remote for prod
const csvContents = util.getLocalCsv();
// const csvContents = await util.getAndSaveRemoteCsv();

// Parse CSV string into array
let allDrawings = parse(csvContents);

// Trash data from 5/7/2003 - 4/22/2006 when the 6th number was a "Bonus Ball" that did NOT have to be unique
const bonusStart = new Date('2003-05-07');
const bonusEnd = new Date('2006-04-22');
allDrawings = allDrawings.filter(drawing => {
    const drawingDate = new Date(`${drawing[3]}-${drawing[1].padStart(2, 0)}-${drawing[2].padStart(2, 0)}`);
    return drawingDate < bonusStart || drawingDate > bonusEnd;
});

// Don't trust CSV Sort. Manually sort by date descending
allDrawings.sort((a, b) => {

    // Compare zero-padded date strings like 1998-03-21
    const dateStrA = `${a[3]}-${a[1].padStart(2, 0)}-${a[2].padStart(2, 0)}`;
    const dateStrB = `${b[3]}-${b[1].padStart(2, 0)}-${b[2].padStart(2, 0)}`;

    if (dateStrA > dateStrB) {
        return -1;
    } else if (dateStrA < dateStrB) {
        return 1;
    }

    // We can't have 2 drawings on the same day. Throw if found to indicate there's probably bigger problems.
    throw new Error(`Duplicate date '${dateStrA}' found. Cannot continue.`);
});

// Write for debugging
util.asyncWriteFile('allDrawings.json', util.prettyJson(allDrawings));

// Only consider the last 150 drawings
const recentDrawings = allDrawings.slice(0, 150);

console.log(`Parsed a total of ${allDrawings.length} past drawings, but only considering the last ${recentDrawings.length} from ${recentDrawings[recentDrawings.length - 1][1]}/${recentDrawings[recentDrawings.length - 1][2]}/${recentDrawings[recentDrawings.length - 1][3]} - ${recentDrawings[0][1]}/${recentDrawings[0][2]}/${recentDrawings[0][3]}.`);

// Initialize hit counters to 0
let pairHits = {};
let singleHits = {};
let range = Array.from({ length: 54 }, (_, i) => i + 1);
range.forEach(i => singleHits[i] = 0);
const allPairs = util.findPairs(range);
allPairs.forEach(pair => pairHits[util.pairKey(pair[0], pair[1])] = 0);

// Increment hit counters
recentDrawings.forEach((drawing) => {
    const balls = [drawing[4], drawing[5], drawing[6], drawing[7], drawing[8], drawing[9]];
    balls.forEach(ball => singleHits[ball]++);
    util.findPairs(balls).forEach(pair => {
        pairHits[util.pairKey(pair[0], pair[1])]++;
    });
});

// Sort, filter, and flatten hit arrays
const sortedPairs = Object.entries(pairHits).sort((a, b) => b[1] - a[1]);
const sortedFlatPairs = sortedPairs.flatMap(n => n[0].split(','));
const uniquePairNums = sortedFlatPairs.filter((item, i) => sortedFlatPairs.indexOf(item) === i);
const sortedHits = Object.entries(singleHits).sort((a, b) => b[1] - a[1]);
const sortedFlatHits = sortedHits.map(n => n[0]);

// Pick our 8 favorite numbers. I'm picking one pair, and 6 singles
let favoriteUniqueNumbers = uniquePairNums.slice(0, 2);
favoriteUniqueNumbers = favoriteUniqueNumbers.concat(util.pickFirstUniqueItems(sortedFlatHits, favoriteUniqueNumbers, 6));

// util.dump([uniquePairNums, sortedFlatHits, favoriteUniqueNumbers]);

// Generate all 28 possible 6-number combinations of our 8 numbers, then pick every third one, giving a total of 10 combinations.
const picks = util.generateLottoWheel(favoriteUniqueNumbers).filter((_, i) => i % 3 === 0);

// Generate 2, 5-combo QR codes because sometimes there's a buy 5 get 1 free sale, and the machine is too stupid to give 2 free on a single 10-combo ticket.
await util.generateQR('qr1.png', util.qrString(picks.slice(0, 5)));
await util.generateQR('qr2.png', util.qrString(picks.slice(5, picks.length)));

// Update index.html
const now = new Date().toLocaleString();
util.updateHtml({ PICKS: util.prettyJson(picks), NOW_ENCODED: encodeURI(now), NOW: now });

console.log("Done.");

import fs from 'fs';
import qrCode from 'qrcode';
export const BUILD_DIR = 'build/';
export const SOURCE_DIR = 'src/';
// Generate string for QR code
export function qrString(combos) {
    // LOT21:WLD1JCMNS010203040506495051525354
    //        | | | | 0 = Beginning of zero-padded selected numbers
    //        | | | N = No "Extra!" option, Y = Yes
    //        | | C = Cash Option, A = Annual
    //        | 1 = 1 drawing per ticket
    //        L = "Lottery" game, M = Mega Millions
    let qrString = 'LOT21:WLD1JCMNS';
    combos.forEach(combo => {
        if (combo.length !== 6) {
            throw new Error(`Invalid number of numbers to append to QR string. Must be exactly 6: '${prettyJson(combo)}'`);
        }
        combo.forEach(number => {
            qrString += String(number).padStart(2, 0);
        });
    });
    return qrString;
}
// Generate QR image
export async function generateQR(filename, text) {
    console.log(`Trying to generate QR code for text: '${text}'.`);
    try {
        await qrCode.toFile(filename, text, { errorCorrectionLevel: 'L' });
    }
    catch (error) {
        throw new Error(`Could not generate QR code: '${error}'`);
    }
    console.log(`Successfully generated: '${filename}'.`);
}
// Chat GPT Prompt: "Write a js method that picks the first n items from an array that don't match any items in another array."
export function pickFirstUniqueItems(mainArray, excludeArray, length) {
    const uniqueItems = [];
    for (let item of mainArray) {
        if (!excludeArray.includes(item)) {
            uniqueItems.push(item);
            if (uniqueItems.length === length) {
                break; // Break the loop once three unique items are found
            }
        }
    }
    return uniqueItems;
}
// Chat GPT Prompt: "Write a javascript method using recursion that can generate a lotto wheel. It should take a list of 8 numbers, then output combinations of 6 numbers."
export function generateLottoWheel(numbers) {
    const combinations = [];
    // Recursive function to generate combinations
    function generateCombination(currentCombination, startIndex) {
        if (currentCombination.length === 6) {
            combinations.push([...currentCombination]);
            return;
        }
        for (let i = startIndex; i < numbers.length; i++) {
            currentCombination.push(numbers[i]);
            generateCombination(currentCombination, i + 1);
            currentCombination.pop();
        }
    }
    generateCombination([], 0);
    return combinations;
}
// Based on: https://stackoverflow.com/a/57834210
export function findPairs(inputArray) {
    return inputArray.map((v, i) => inputArray.slice(i + 1).map(w => [v, w].sort((a, b) => a - b))).flat();
}
// For development, read an outdated local CSV instead of fetching an updated one.
const LOCAL_CSV = BUILD_DIR + 'lottotexas.csv';
export function getLocalCsv() {
    console.log(`Using local drawing results from: '${LOCAL_CSV}'.`);
    try {
        return fs.readFileSync(LOCAL_CSV, { encoding: 'utf8' });
    }
    catch (error) {
        console.error(`Got an error trying to read the file: ${error.message}`);
    }
}
// Fetch latest drawing results and save the CSV locally
export async function getAndSaveRemoteCsv() {
    // Fetch latest results
    const csvUrl = 'https://www.texaslottery.com/export/sites/lottery/Games/Lotto_Texas/Winning_Numbers/lottotexas.csv';
    console.log(`Fetching latest drawing results from: '${csvUrl}'`);
    const response = await fetch(csvUrl);
    const csvContents = await response.text();
    // Save CSV locally
    asyncWriteFile(LOCAL_CSV, csvContents);
    return csvContents;
}
// Update HTML
export function updateHtml(replacements) {
    let html = fs.readFileSync(SOURCE_DIR + 'index_template.html', { encoding: 'utf8' });
    for (const placeholder in replacements) {
        html = html.replaceAll(placeholder, replacements[placeholder]);
    }
    fs.writeFileSync(BUILD_DIR + 'index.html', html);
}
// Helper to try to write to a file in the background. Will message on failure, but not block/kill execution.
export function asyncWriteFile(filename, contents) {
    fs.writeFile(filename, contents, error => {
        if (error) {
            console.warn(`WARNING: Could not write to '${filename}': "${error}". Not fatal. Continuing.`);
        }
        else {
            console.log(`Successfully wrote '${filename}'.`);
        }
    });
}
export function ticketHtml(combos) {
    return combos.map(c => c.join(' - ')).join('<br />\n');
}
export function pairKey(num1, num2) {
    return `${num1},${num2}`;
}
export function prettyJson(obj) {
    return JSON.stringify(obj, null, '  ');
}
export function dump(obj) {
    console.log(prettyJson(obj));
}

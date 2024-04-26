const events = require('events');
const fs = require('fs');
const readline = require('readline');

let fileName = 'lottotexas.csv',
    charset = 'utf8';

async function processLineByLine() {

    let allDraws = [];

    const rl = readline.createInterface( { input: fs.createReadStream( fileName ), crlfDelay: Infinity } );

    rl.on( 'line', ( line ) => {

        let fields = line.split(','),
            game = fields[0],
            month = fields[1],
            day = fields[2],
            year = fields[3],
            drawDate = new Date(year, month - 1, day),
            nums = [fields[4], fields[5], fields[6], fields[7], fields[8], fields[9]];

//        console.log( `Line: ${line} Game: ${game} Date: ${drawDate} Nums: ${nums}` );

        allDraws.push({ date: drawDate, nums: nums  });
    });

    await events.once( rl, 'close' );

    // Sort Descending
    allDraws.sort((a, b) => b.date - a.date);

    console.log( 'done' );

    const drawSets = {
        last50: { draws: allDraws.slice(0, 50) },
        last100: { draws: allDraws.slice(0, 100) },
        last150: { draws: allDraws.slice(0, 150) },
        last200: { draws: allDraws.slice(0, 200) },
        last250: { draws: allDraws.slice(0, 250) }
    }

    dump( drawSets );
    for (set in drawSets) {

        let setCounts = countNums( drawSets[set].draws );

        drawSets[set].hitSorted = drawSets[set].draws.sort();

        dump( setCounts );
        dump( drawSets[set].hitSorted );
    }
}

processLineByLine();


function countNums( draws ) {
    let counts = {};
    draws.forEach(draw => {
        for( i = 0; i < 6; i++ ) {
            counts[draw.nums[i]] = counts[draw.nums[i]] + 1 || 1;
        }
    });
    return counts;
}

function dump( obj ) {
    console.log( JSON.stringify( obj, null, '  ' ) );
}

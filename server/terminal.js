const {mlbScrapperFunctions} = require('./components/classes/mlbScraper.js')

async function runTerminal(){
    const mlb = await mlbScrapperFunctions();

    await mlb.loadScoresPage();

    let games = await mlb.scrapeScoresPage();

    console.log(getBattersOver300(games[5]))
}

module.exports = {runTerminal}
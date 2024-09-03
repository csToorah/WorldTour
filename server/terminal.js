const {mlbScrapperFunctions} = require('./components/classes/mlbScraper.js')

async function runTerminal(){
    const mlb = await mlbScrapperFunctions();
    await mlb.getScoresPage()
    let games = await mlb.scrapeScoresPage()
    console.log(await mlb.scrapeLineups(games))
}

module.exports = {runTerminal}
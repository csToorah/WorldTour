const {mlbScrapperFunctions} = require('./components/classes/mlbScraper.js');
const {statMuseFunctions} = require('./components/classes/statMuseScraper.js')

async function runTerminal(){
    const statMuse = await statMuseFunctions();
    const mlb = await mlbScrapperFunctions();

    await mlb.loadScoresPage();
    let games = await mlb.scrapeScoresPage()

    let game = await mlb.scrapePreGame(games[3])

    let batter = game.home.lineups.batters[0].name.split(' ')[0]
    let pitcher = game.visitor.lineups.pitchers.name

    let query = `${batter}-vs-${pitcher}`


    console.log(await statMuse.searchStatMuse(query));
    
}

module.exports = {runTerminal}
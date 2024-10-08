const {browserFunctions} = require('./scraper.js');
const {forOfAwait} = require('../functions.js');
const {Game} = require('./Game.js');
const {scoresPageSelectors, cookiesDisabler, finalGameSelectors, preGameSelectors, liveGameSelectors} = require('../selectors/mlbSelectors.js')


async function mlbScrapperFunctions(){
    const browser = await  browserFunctions()
    return{
        loadScoresPage: async function(){
            await browser.loadPage('https://www.mlb.com/scores')
        },
        getStatsPageBatting: async function(){
            await browser.loadPage('https://www.mlb.com/stats/')
        },
        getStatsPagePitching: async function(){
            await browser.loadPage('https://www.mlb.com/stats/pitching?sortState=asc')
        },
        scrapeScoresPage: async function(){
            let gameContainers = await browser.getSelectors(scoresPageSelectors.gameContainers)

            if(gameContainers.length < 0) return;

            return await forOfAwait(gameContainers, async (gameContainer)=>{
                let namesArray = []
                let game = new Game();
                await forOfAwait(await browser.getSelectors(scoresPageSelectors.teamNames, gameContainer), async (teamName)=>{
                    if(namesArray > 2){
                        return;
                    }
                    namesArray.push(await browser.evaluateSelector(teamName, 'textContent'))
                })

                let status = await getGameStatus(await browser.evaluateSelector(await browser.getSelector(scoresPageSelectors.gameStatus, gameContainer),'textContent'))
            
                let href = await getGameDayLink(await browser.getSelectors(scoresPageSelectors.btnsContainer, gameContainer), browser)

                game.status = status;
                game.home.name = namesArray[1]
                game.visitor.name = namesArray[0]
                game.link = href;
                
                return game;
            })
        },
        scrapePreGame: async function(game = new Game()){
            if(game.status !== 'preGame') return;

            await browser.loadPage(game.link)
            await browser.awaitNavigation()
            await browser.clickBtn('#onetrust-accept-btn-handler')

            let pitchersContainer = await browser.getSelector(preGameSelectors.containers.pitchersOuter)

            let [visitorPitcher, homePitcher] = await forOfAwait(await browser.getSelectors(preGameSelectors.containers.pitchersInner, pitchersContainer), async (pitcher)=>{
                return {
                    name: (await browser.evaluateSelector(await browser.getSelector(preGameSelectors.pitchers.name, pitcher), 'textContent')).split(' ')[0],
                    pitchingArm:(await browser.evaluateSelector(await browser.getSelector(preGameSelectors.pitchers.pitchingArm, pitcher), 'textContent')).split('|')[0],
                    record: await browser.evaluateSelector(await browser.getSelector(preGameSelectors.pitchers.record, pitcher), 'textContent'),
                    ERA: (await browser.evaluateSelector(await browser.getSelector(preGameSelectors.pitchers.ERA, pitcher), 'textContent')).split(' ')[0],
                    K: (await browser.evaluateSelector(await browser.getSelector(preGameSelectors.pitchers.K, pitcher), 'textContent')).split(' ')[0]
                }
            })

            let [visitorLineup, homeLineup] = await forOfAwait(await browser.getSelectors(preGameSelectors.containers.lineup), async (lineup)=>{
                return await forOfAwait(await browser.getSelectors('tr', lineup), async (row)=>{
                    return {
                        name: await browser.evaluateSelector(await browser.getSelector(preGameSelectors.lineup.name, row), 'textContent'),
                        battingPosition: await browser.evaluateSelector(await browser.getSelector(preGameSelectors.lineup.battingPosition, row), 'textContent'),
                        AVG: await browser.evaluateSelector(await browser.getSelector(preGameSelectors.lineup.AVG, row), 'textContent'),
                        OPS: await browser.evaluateSelector(await browser.getSelector(preGameSelectors.lineup.OPS, row), 'textContent')
                    }
                })
            }, await browser.clickBtn('#lineups', {ignore: true})) //Conditional to see if lineups are shown

            game.home.lineups.pitchers = homePitcher
            game.visitor.lineups.pitchers = visitorPitcher

            game.home.lineups.batters = homeLineup
            game.visitor.lineups.batters = visitorLineup

            return game;
        },
        scrapeLiveGame: async function(game = new Game()){
            if(game.status !== 'live') return;

            await browser.loadPage(game.link)
            await browser.awaitNavigation();
            await browser.screenshot()

            let scoreBoard = await browser.getSelector(liveGameSelectors.containers.scoreBoard)
            let [visitorInfo, homeInfo] = await forOfAwait(await browser.getSelectors('tr', scoreBoard), async (row)=>{
                return {
                    runs: await browser.evaluateSelector(await browser.getSelector(liveGameSelectors.scoreBoard.runs, row), 'textContent'),
                    hits: await browser.evaluateSelector(await browser.getSelector(liveGameSelectors.scoreBoard.hits, row), 'textContent')
                }
            })
            game.home.hits = homeInfo.hits;
            game.home.runs = homeInfo.runs;
            game.visitor.hits = visitorInfo.hits;
            game.visitor.runs = visitorInfo.runs;
            game.inning = await browser.evaluateSelector(await browser.getSelector(liveGameSelectors.scoreBoard.inning), 'textContent')


            let [visitorBatters, ignore, homeBatters] = await scrapeLineup(liveGameSelectors.batters, liveGameSelectors.containers.batters, browser, 2)

            game.home.lineups.batters = homeBatters;
            game.visitor.lineups.batters = visitorBatters;

            let [visitorPitchers, empty, homePitchers] = await scrapeLineup(liveGameSelectors.pitchers, liveGameSelectors.containers.pitchers, browser, 2)

            game.home.lineups.pitchers = homePitchers;
            game.visitor.lineups.pitchers = visitorPitchers;

            let [visitorBench, trash, homeBench] = await scrapeLineup(liveGameSelectors.bench, liveGameSelectors.containers.bench, browser, 1)
            game.home.lineups.bench = homeBench;
            game.visitor.lineups.bench = visitorBench;

            let [visitorBullpen, garbage, homeBullpen] = await scrapeLineup(liveGameSelectors.bullpen, liveGameSelectors.containers.bullpen, browser, 1)

            game.home.lineups.bullpen = homeBullpen
            game.visitor.lineups.bullpen = visitorBullpen

            return game;
        },
        scrapeFinalGame: async function(game = new Game()){
            if(game.status !== 'final') return;

            await browser.loadPage(game.link)
            await browser.awaitNavigation()

            game.inning = await browser.evaluateSelect(finalGameSelectors.inning, undefined, 'textContent')

            let[[visitorInfo, homeInfo]] = await scrapeLineup(finalGameSelectors.scoreboard, finalGameSelectors.containers.scoreboard, browser)
            
            game.home.runs = homeInfo[0];
            game.home.hits = homeInfo[1];
            game.home.errors = homeInfo[2];

            game.visitor.runs = visitorInfo[0];
            game.visitor.hits = visitorInfo[1];
            game.visitor.errors = visitorInfo[2];


            let [visitorBatters, homeBatters] = await scrapeLineup(finalGameSelectors.batters, finalGameSelectors.containers.batters, browser, {clip: true})

            game.home.lineups.batters = homeBatters;
            game.visitor.lineups.batters = visitorBatters;

            let [visitorPitchers, homePitchers] = await scrapeLineup(finalGameSelectors.pitchers, finalGameSelectors.containers.pitchers, browser, {clip: true})

            game.home.lineups.pitchers = homePitchers;
            game.visitor.lineups.pitchers = visitorPitchers;

            return game
        }
    }
}


async function scrapeLineup(selectors, container, browser, options = {clip: false}){
    return await forOfAwait(await browser.getSelectors(container), async (lineup)=>{
        let array = await forOfAwait(await browser.getSelectors('tr', lineup), async (row)=>{
            return await forOfAwait(Object.values(selectors), async (selector)=>{
                return await browser.evaluateSelect(selector, row, 'textContent')
            })
        })
        if(options.clip) array.pop()
        return array;
    })
}

async function mergeLineupMatchup(lineup = [], matchup = new Map()){
    return await forOfAwait(lineup, (batter)=>{
        return {
            name: batter.name,
            battingPosition: batter.battingPosition,
            AVG: batter.AVG,
            OPS: batter.OPS,
            matchup: matchup.get(batter.name)
        }
    });
}

async function getGameStatus(gameStatus = ''){
    gameStatus = gameStatus.split('Free')[0]
    gameStatus = gameStatus.toLowerCase()

    let [firstPart, secondPart] = gameStatus.split(' ')
    if(secondPart > 0 || firstPart.includes('warmup')) return 'live'
    else if(secondPart === 'am' || secondPart === 'pm'){ return 'preGame'}
    else return 'final';
}

async function getGameDayLink(btnsContainer, functions){
    let href = await forOfAwait(btnsContainer, async (btn)=>{
        let btnName = await functions.evaluateSelector(await functions.getSelector('.dIJeFt', btn), 'textContent')
        if(btnName === 'Box' || btnName === 'Gameday' || btnName === 'Preview') return await functions.evaluateSelector(await functions.getSelector('a', btn), 'href')
    })
    href = href.filter((link)=> typeof(link) !== 'undefined')
    return href[0];
}

module.exports = {mlbScrapperFunctions}
const {browserFunctions} = require('./scrapper.js');
const {forOfAwait} = require('./codeComponents.js');
const {Game} = require('./Game.js');

async function mlbScrapperFunctions(){
    const browser = await  browserFunctions()
    return{
        getScoresPage: async function(){
            return await browser.loadPage('https://www.mlb.com/scores')
        },
        getStatsPageBatting: async function(){
            await browser.loadPage('https://www.mlb.com/stats/')
        },
        getStatsPagePitching: async function(){
            await browser.loadPage('https://www.mlb.com/stats/pitching?sortState=asc')
        },
        scrapeScoresPage: async function(){
            let gameContainers = await browser.getSelectors(mlbSelectors.scoresPage.gameContainers)

            return await forOfAwait(gameContainers, async (gameContainer)=>{
                let namesArray = []
                let game = new Game();
                await forOfAwait(await browser.getSelectors(mlbSelectors.scoresPage.teamNames, gameContainer), async (teamName)=>{
                    if(namesArray > 2){
                        return;
                    }
                    namesArray.push(await browser.evaluateSelector(teamName, 'textContent'))
                })

                let status = await getGameStatus(await browser.evaluateSelector(await browser.getSelector(mlbSelectors.scoresPage.gameStatus, gameContainer),'textContent'))
            
                let href = await getGameDayLink(await browser.getSelectors(mlbSelectors.scoresPage.btnsContainer, gameContainer), browser)

                game.status = status;
                game.home.name = namesArray[1]
                game.visitor.name = namesArray[0]
                game.link = href;
                
                return game;
            })
        },
        scrapeLineups: async function(games){
            return await forOfAwait(games, async (game)=>{
                if(game.status === 'preGame'){
                    await browser.loadPage(game.link)
                    await browser.awaitNavigation()
                    return await scrapePreGameLineups(browser);
                }else{
                    return 'Not able to scrape lineup'
                }
            })
        }
    }
}


async function scrapePreGameLineups(browser){
    let pitchersContainer = await browser.getSelector(mlbSelectors.preGameLineUps.pitchersContainer)

    let [visitorPitcher, homePitcher] = await forOfAwait(await browser.getSelectors(mlbSelectors.preGameLineUps.pitchers.box, pitchersContainer), async (pitcher)=>{
        return {
            name: (await browser.evaluateSelector(await browser.getSelector(mlbSelectors.preGameLineUps.pitchers.name, pitcher), 'textContent')).split(' ')[0],
            pitchingArm:(await browser.evaluateSelector(await browser.getSelector(mlbSelectors.preGameLineUps.pitchers.pitchingArm, pitcher), 'textContent')).split('|')[0],
            record: await browser.evaluateSelector(await browser.getSelector(mlbSelectors.preGameLineUps.pitchers.record, pitcher), 'textContent'),
            ERA: (await browser.evaluateSelector(await browser.getSelector(mlbSelectors.preGameLineUps.pitchers.ERA, pitcher), 'textContent')).split(' ')[0],
            K: (await browser.evaluateSelector(await browser.getSelector(mlbSelectors.preGameLineUps.pitchers.K, pitcher), 'textContent')).split(' ')[0]
        }
    })

    console.log(await browser.getSelector('#lineups'), 'lineup')
    let [visitorLineup, homeLineup] = await forOfAwait(await browser.getSelectors(mlbSelectors.preGameLineUps.batters.box), async (lineup)=>{
        return await forOfAwait(await browser.getSelectors('tr', lineup), async (row)=>{
            return {
                name: await browser.evaluateSelector(await browser.getSelector(mlbSelectors.preGameLineUps.batters.name, row), 'textContent'),
                battingPosition: await browser.evaluateSelector(await browser.getSelector(mlbSelectors.preGameLineUps.batters.battingPosition, row), 'textContent'),
                AVG: await browser.evaluateSelector(await browser.getSelector(mlbSelectors.preGameLineUps.batters.AVG, row), 'textContent'),
                OPS: await browser.evaluateSelector(await browser.getSelector(mlbSelectors.preGameLineUps.batters.OPS, row), 'textContent')
            }
        })
    }, await browser.clickBtn('#lineups', {ignore: true}))
    
    console.log(await browser.getSelector('#matchups'), 'matchup')
    let [homeMatchups, visitorMatchups] = await forOfAwait(await browser.getSelectors(mlbSelectors.preGameLineUps.batters.box), async (lineup)=>{
        return await forOfAwait(await browser.getSelectors('tr', lineup), async (batter)=>{
            return await forOfAwait(await browser.getSelectors('td', batter), async (batterStat)=>{
                return browser.evaluateSelector(batterStat, 'textContent')
            })
        })
    }, await browser.clickBtn('#matchups', {ignore: true}))

    return 'Scrapping Pre Game lineups'
}

async function scrapeLiveLineups(browser){
    return 'Scraping live lineups'
}

async function scrapeFinalLineups(browser){
    return 'Scraping Final lineups'
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



const mlbSelectors = {
    scoresPage: {
        gameContainers: '.gmoPjI',
        teamNames: '.fdaoCu',
        gameStatus: '.cBEKUV',
        btnsContainer: '.dlHiDf',
    },
    finalLineups: {
        batters: {
            lineup: '.dgwGLd.batters',
            name: '.Lvhrv',
            position: '.kRXTrM',
            atBats: '.jWPLwA',
            boxStatGrapper: (column, row, home)=>{
                return `#tb-${home? '5':'3'}-body\ row-${row}\ col-${column}`
            }
        },
        pitchers: {
            lineup: '.dgwGLd.pitchers',
            name: '.isiUvk',
            boxStatGrapper: (column, row, home)=>{
                return `#tb-${home? '6':'4'}-body\ row-${row}\ col-${column}`
            }
        }
    },
    preGameLineUps: {
        batters: {
            box: '.dFXpor > tbody',
            name: '.izsxYc',
            battingPosition: '[data-col = "1"]',
            AVG: '[data-col = "5"]',
            OPS: '[data-col = "6"]'
        },
        pitchersContainer: '.FqHVL',
        pitchers: {
            box: '.lcFuuA',
            name: '.jJjzqB',
            pitchingArm: '.ljFmix',
            record: '.cTXOhx .before-list',
            ERA: '.cTXOhx .after-list',
            K: '.cTXOhx .bottom-list'
        }
    }
}

module.exports = {mlbScrapperFunctions}

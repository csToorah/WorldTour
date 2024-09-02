const {browserFunctions} = require('./scrapper.js');
const {forOfAwait} = require('../functions.js');
const {Game} = require('./Game.js');
const { DeviceRequestPromptManager } = require('puppeteer');

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
        scrapePreGameLineup: async function(game = new Game()){
            if(game.status !== 'preGame') return;

            await browser.loadPage(game.link)
            await browser.awaitNavigation()
            await browser.clickBtn(mlbSelectors.cookiesDisabler)

            let pitchersContainer = await browser.getSelector(mlbSelectors.preGameSelectors.pitchersContainer)

            let [visitorPitcher, homePitcher] = await forOfAwait(await browser.getSelectors(mlbSelectors.preGameSelectors.pitchers.box, pitchersContainer), async (pitcher)=>{
                return {
                    name: (await browser.evaluateSelector(await browser.getSelector(mlbSelectors.preGameSelectors.pitchers.name, pitcher), 'textContent')).split(' ')[0],
                    pitchingArm:(await browser.evaluateSelector(await browser.getSelector(mlbSelectors.preGameSelectors.pitchers.pitchingArm, pitcher), 'textContent')).split('|')[0],
                    record: await browser.evaluateSelector(await browser.getSelector(mlbSelectors.preGameSelectors.pitchers.record, pitcher), 'textContent'),
                    ERA: (await browser.evaluateSelector(await browser.getSelector(mlbSelectors.preGameSelectors.pitchers.ERA, pitcher), 'textContent')).split(' ')[0],
                    K: (await browser.evaluateSelector(await browser.getSelector(mlbSelectors.preGameSelectors.pitchers.K, pitcher), 'textContent')).split(' ')[0]
                }
            })

            let [visitorLineup, homeLineup] = await forOfAwait(await browser.getSelectors(mlbSelectors.preGameSelectors.lineup.box), async (lineup)=>{
                return await forOfAwait(await browser.getSelectors('tr', lineup), async (row)=>{
                    return {
                        name: await browser.evaluateSelector(await browser.getSelector(mlbSelectors  .preGameSelectors.lineup.name, row), 'textContent'),
                        battingPosition: await browser.evaluateSelector(await browser.getSelector(mlbSelectors.preGameSelectors.lineup.battingPosition, row), 'textContent'),
                        AVG: await browser.evaluateSelector(await browser.getSelector(mlbSelectors.preGameSelectors.lineup.AVG, row), 'textContent'),
                        OPS: await browser.evaluateSelector(await browser.getSelector(mlbSelectors.preGameSelectors.lineup.OPS, row), 'textContent')
                    }
                })
            }, await browser.clickBtn('#lineups', {ignore: true}))


            let [visitorMatchups, homeMatchups] = await forOfAwait(await browser.getSelectors(mlbSelectors.preGameSelectors.matchup.box), async (lineup)=>{
                return new Map(await forOfAwait(await browser.getSelectors('tr', lineup), async (row)=>{
                    return [
                        await browser.evaluateSelector(await browser.getSelector(mlbSelectors  .preGameSelectors.matchup.name, row), 'textContent'),
                        {
                            HR: await browser.evaluateSelector(await browser.getSelector(mlbSelectors.preGameSelectors.matchup.HR, row), 'textContent'),
                            RBI: await browser.evaluateSelector(await browser.getSelector(mlbSelectors.preGameSelectors.matchup.RBI, row), 'textContent'),
                            AB: await browser.evaluateSelector(await browser.getSelector(mlbSelectors.preGameSelectors.matchup.AB, row), 'textContent'),
                            AVG: await browser.evaluateSelector(await browser.getSelector(mlbSelectors.preGameSelectors.matchup.AVG, row), 'textContent'),
                            OPS: await browser.evaluateSelector(await browser.getSelector(mlbSelectors.preGameSelectors.matchup.OPS, row), 'textContent'),
                        }
                    ]
                }))
            }, await browser.clickBtn('#matchups', {ignore: true}))

            game.home.lineups.pitchers = homePitcher
            game.visitor.lineups.pitchers = visitorPitcher

            game.home.lineups.batters = await mergeLineupMatchup(homeLineup, homeMatchups)
            game.visitor.lineups.batters = await mergeLineupMatchup(visitorLineup, visitorMatchups)

            return game;
        },
        scrapeLineups: async function(games){
            return await forOfAwait(games, async (game = new Game())=>{
                if(game.status === 'live'){
                    await browser.loadPage(game.link)
                    await browser.awaitNavigation()
                    await browser.clickBtn(mlbSelectors.cookiesDisabler)
                    return await scrapeLiveLineups(browser);
                }else{
                    return 'Not able to scrape lineup'
                }
            })
        }
    }
}

async function scrapeLiveLineups(browser, game = new Game()){
    let scoreBoard = await browser.getSelector(mlbSelectors.liveGameSelectors.scoreBoard.table)
    let [visitorInfo, homeInfo] = await forOfAwait(await browser.getSelectors('tr', scoreBoard), async (row)=>{
        return {
            runs: await browser.evaluateSelector(await browser.getSelector(mlbSelectors.liveGameSelectors.scoreBoard.runs, row), 'textContent'),
            hits: await browser.evaluateSelector(await browser.getSelector(mlbSelectors.liveGameSelectors.scoreBoard.hits, row), 'textContent')
        }
    })
    game.home.hits = homeInfo.hits;
    game.home.runs = homeInfo.runs;
    game.visitor.hits = visitorInfo.hits;
    game.visitor.runs = visitorInfo.runs;
    game.inning = await browser.evaluateSelector(await browser.getSelector(mlbSelectors.liveGameSelectors.scoreBoard.inning), 'textContent')

    let [visitorBatters, homeBatters] = await forOfAwait(await browser.getSelectors(mlbSelectors.liveGameSelectors.lineups.batters.table), async (lineup)=>{
        let batters = await forOfAwait(await browser.getSelectors('tr', lineup), async (row)=>{
            return {
                name: await browser.evaluateSelect(mlbSelectors.liveGameSelectors.lineups.batters.name, row, 'textContent'),
                AB: await browser.evaluateSelect(mlbSelectors.liveGameSelectors.lineups.batters.AB, row, 'textContent'),
                runs: await browser.evaluateSelect(mlbSelectors.liveGameSelectors.lineups.batters.runs, row, 'textContent'),
                hits: await browser.evaluateSelect(mlbSelectors.liveGameSelectors.lineups.batters.hits, row, 'textContent'),
                RBI: await browser.evaluateSelect(mlbSelectors.liveGameSelectors.lineups.batters.RBI, row, 'textContent'),
                walks: await browser.evaluateSelect(mlbSelectors.liveGameSelectors.lineups.batters.walks, row, 'textContent'),
                AVG: await browser.evaluateSelect(mlbSelectors.liveGameSelectors.lineups.batters.AVG, row, 'textContent'),
                OPS: await browser.evaluateSelect(mlbSelectors.liveGameSelectors.lineups.batters.OPS, row, 'textContent')
            }
        })
        batters.pop()
        batters.shift()
        return batters
    })

    game.home.lineups.batters = homeBatters;
    game.visitor.lineups.batters = visitorBatters;

    let [visitorPitchers, homePitchers] = await forOfAwait(await browser.getSelectors(mlbSelectors.liveGameSelectors.lineups.pitchers.table), async (lineup)=>{
        let pitchers = await forOfAwait(await browser.getSelectors('tr', lineup), async (row)=>{
            return {
                name: await browser.evaluateSelect(mlbSelectors.liveGameSelectors.lineups.pitchers.name, row, 'textContent'),
                IP: await browser.evaluateSelect(mlbSelectors.liveGameSelectors.lineups.pitchers.IP, row, 'textContent'),
                hits: await browser.evaluateSelect(mlbSelectors.liveGameSelectors.lineups.pitchers.hits, row, 'textContent'),
                runs: await browser.evaluateSelect(mlbSelectors.liveGameSelectors.lineups.pitchers.runs, row, 'textContent'),
                ER: await browser.evaluateSelect(mlbSelectors.liveGameSelectors.lineups.pitchers.ER, row, 'textContent'),
                walks: await browser.evaluateSelect(mlbSelectors.liveGameSelectors.lineups.pitchers.walks, row, 'textContent'),
                K: await browser.evaluateSelect(mlbSelectors.liveGameSelectors.lineups.pitchers.K, row, 'textContent'),
                HR: await browser.evaluateSelect(mlbSelectors.liveGameSelectors.lineups.pitchers.HR, row, 'textContent'),
                ERA: await browser.evaluateSelect(mlbSelectors.liveGameSelectors.lineups.pitchers.ERA, row, 'textContent')
            }
        })
        pitchers.pop()
        pitchers.shift()
        return pitchers
    })

    console.log(visitorBatters, homeBatters)
    return 'Scraping live lineups'
}

async function scrapeFinalLineups(browser){
    return 'Scraping Final lineups'
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




//Selectors for Scraping Pages

const mlbSelectors = {
    cookiesDisabler: '#onetrust-close-btn-container',
    scoresPage: {
        gameContainers: '.gmoPjI',
        teamNames: '.fdaoCu',
        gameStatus: '.cBEKUV',
        btnsContainer: '.dlHiDf',
    },
    preGameSelectors: {
        lineup: {
            box: '.dFXpor > tbody',
            name: '.izsxYc',
            battingPosition: '[data-col = "1"]',
            AVG: '[data-col = "5"]',
            OPS: '[data-col = "6"]'
        },
        matchup: {
            box: '.dFXpor > tbody',
            name: '.izsxYc',
            HR: '[data-col = "1"]',
            RBI: '[data-col = "2"]',
            AB: '[data-col = "3"]',
            AVG: '[data-col = "4"]',
            OPS: '[data-col = "5"]'
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
    },
    liveGameSelectors: {
        scoreBoard: {
            table: '.fxhlOg > tbody',
            runs: '[data-col="0"]',
            hits: '[data-col="1"]',
            inning: '.jfAqho'
        },
        lineups: {
            batters: {
                table: '.dgwGLd.batters',
                name: '.Lvhrv',
                AB: '[data-col="1"]',
                runs: '[data-col="2"]',
                hits: '[data-col="3"]',
                RBI: '[data-col="4"]',
                walks: '[data-col="5"]',
                K: '[data-col="6"]',
                AVG: '[data-col="7"]',
                OPS: '[data-col="8"]'
            },
            pitchers: {
                table: '.dgwGLd.pitchers',
                name: '.erTrAi',
                IP: '[data-col="1"]',
                hits: '[data-col="2"]',
                runs: '[data-col="3"]',
                ER: '[data-col="4"]',
                walks: '[data-col="5"]',
                K: '[data-col="6"]',
                HR: '[data-col="7"]',
                ERA: '[data-col="8"]'
            },
            bench: {
                table: '.dgwGLd.bench',
                name: '.Lvhrv',
                side: '[data-col="1"]',
                POS: '[data-col="1"]',
                AVG: '[data-col="2"]'
            },
            bullpen: {
                table: 'dgwGLd bullpen',
                name: '.Lvhrv',
                side: '[data-col="1"]',
                ERA: '[data-col="1"]',
                IP: '[data-col="1"]',
                hits: '[data-col="1"]',
                walks: '[data-col="1"]',
                K: '[data-col="1"]'
            }
        }
    }
}

module.exports = {mlbScrapperFunctions}
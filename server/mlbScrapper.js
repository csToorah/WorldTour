const {browserFunctions} = require('./scrapper.js');
const {forOfAwait} = require('./codeComponents.js');
const {Game} = require('./Game.js');
const { getQueryHandlerAndSelector } = require('puppeteer');

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
                await browser.loadPage(game.link)
                await browser.awaitNavigation()

                if(game.status === 'preGame'){
                    return scrapePreGameLineups(browser);
                }else if(game.status === 'live'){
                    return scrapeLiveLineups(browser);
                }else if(game.status === 'final'){
                    return scrapeFinalLineups(browser)
                }else{
                    console.log(game.status)
                    return 'Not able to scrape lineup'
                }
            })
        }
    }
}


async function scrapePreGameLineups(browser){

    let [visitorPitcher, homePitcher] = await forOfAwait(await browser.getSelectors(mlbSelectors.preGameLineUps.pitchers.box), async (box)=>{
        console.log(await browser.getSelector(mlbSelectors.preGameLineUps.pitchers.name, box))
        /*return {
            name: await browser.evaluateSelector(await browser.getSelector(mlbSelectors.preGameLineUps.pitchers.name, box), 'textContent'),
            pitchingArm: await browser.evaluateSelector(await browser.getSelector(mlbSelectors.preGameLineUps.pitchers.pitchingArm, box), 'textContent'),
            record: await browser.evaluateSelector(await browser.getSelector(mlbSelectors.preGameLineUps.pitchers.record, box), 'textContent'),
            ERA: await browser.evaluateSelector(await browser.getSelector(mlbSelectors.preGameLineUps.pitchers.ERA, box), 'textContent'),
            K: await browser.evaluateSelector(await browser.getSelector(mlbSelectors.preGameLineUps.pitchers.K, box), 'textContent')
        }*/
        return 'Hello'
    })
    /*
    let home = true;
    let [visitorLineup, homeLineup] = await forOfAwait(await browser.getSelectors(mlbSelectors.preGameLineUps.batters.box), async (box)=>{
        let row = 0;
        home = !home
        return forOfAwait(await browser.getSelectors(mlbSelectors.preGameLineUps.batters.name, box), async (name)=>{
            return{
                name: name,
                position: await browser.evaluateSelector(await browser.getSelector(mlbSelectors.preGameLineUps.batters.position, box), 'textContent'),
                battingSide: await browser.evaluateSelector(await browser.getSelector(mlbSelectors.preGameLineUps.batters.boxStatGrapper(1, row, home), box), 'textContent'),
                AVG: await browser.evaluateSelector(await browser.getSelector(mlbSelectors.preGameLineUps.batters.boxStatGrapper(5, row, home), box), 'textContent'),
                OPS: await browser.evaluateSelector(await browser.getSelector(mlbSelectors.preGameLineUps.batters.boxStatGrapper(6, row, home)), 'textContent')
            }
        })
    })


    return {
        vistor: {
            pitcher: visitorPitcher,
            lineup: visitorLineup
        },
        home: {
            pitcher: homePitcher,
            lineup: homeLineup
        }
    }
    */
   return 'Hello'
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
    if(secondPart > 0) return 'live'
    else if(secondPart === 'am' || secondPart === 'pm' || firstPart.includes('warmup')){ return 'preGame'}
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
            box: '.gzGGfc',
            name: '.izsxYc',
            position: '.rRNqQ',
            boxStatGrapper: (column, row, home)=>{
                return `#tb-${home? '16':'17'}-body\ row-${row}\ col-${column}`
            }
        },
        pitchers: {
            box: '.lcFuuA',
            name: '.jJjzqB',
            pitchingArm: '.ljFmix:nth-child(1)',
            record: '.cTXOhx:nth-child(1)',
            ERA: '.cTXOhx:nth-child(3)',
            K: '.cTXOhx:nth-child(4)'
        }
    }
}

module.exports = {mlbScrapperFunctions}

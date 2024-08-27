const {browserFunctions} = require('./scrapper.js');
const {forOfAwait} = require('./codeComponents.js');
const {Game} = require('./Game.js');
const { getQueryHandlerAndSelector } = require('puppeteer');
const { connection } = require('websocket');

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
                let gameStatus = typeof(await browser.evaluateSelector(await browser.getSelector(mlbSelectors.scoresPage.gameStatus.preGame, gameContainer), 'textContent', {ignore: true})) !== 'undefined'? 'preGame': false
                                || typeof(await browser.evaluateSelector(await browser.getSelector(mlbSelectors.scoresPage.gameStatus.live, gameContainer), 'textContent', {ignore: true})) !== 'undefined'? 'live': false
                                || typeof(await browser.evaluateSelector(await browser.getSelector(mlbSelectors.scoresPage.gameStatus.final, gameContainer), 'textContent', {ignore: true})) !== 'undefined'? 'final': false
                let selector = gameStatus === 'final'? 3: (await browser.getSelectors(mlbSelectors.scoresPage.btnsContainer)).length === 3? 1: 2;
                let href = await browser.evaluateSelector(await browser.getSelector(mlbSelectors.scoresPage.gamedayLink(selector), gameContainer), 'href')

                game.gameStatus = gameStatus;
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

                let [visitor, waste, home]= await browser.getSelectors(mlbSelectors.finalLineups.batters.lineup)

                return await forOfAwait([visitor, home], async (lineup)=>{
                    return await forOfAwait(await browser.getSelectors(mlbSelectors.finalLineups.batters.name, lineup), async (name)=>{
                        return await browser.evaluateSelector(name, 'textContent')
                    })
                })
            })
        }
    }
}



const mlbSelectors = {
    scoresPage: {
        gameContainers: '.gmoPjI',
        teamNames: '.fdaoCu',
        gameStatus: {preGame: '.fGwgfi', live: '.fGwgfi', final: '.feaLYF'},
        btnsContainer: '.dIJeFt',
        gamedayLink: (selector)=>{
            return `.kwMGcY > div:nth-child(${selector}) > a`
        }

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
    }
}

module.exports = {mlbScrapperFunctions}

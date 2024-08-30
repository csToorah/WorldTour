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

                let gameStatus = await getGameStatus(await browser.evaluateSelector(await browser.getSelector(mlbSelectors.scoresPage.gameStatus, gameContainer),'textContent'))
                
                let href = await getGameDayLink(await browser.getSelectors(mlbSelectors.scoresPage.btnsContainer), browser)

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

async function getGameStatus(gameStatus = ''){
    gameStatus = gameStatus.split('Free')[0]

    let chunk = gameStatus.split(' ')[1]

    if(chunk > 0) return 'live'
    else if(chunk === 'AM' || 'PM'){ return 'preGame'}
    else return 'Final';
}

async function getGameDayLink(btnsContainer, functions){
    let href = await forOfAwait(btnsContainer, async (btn)=>{
        let btnName = await functions.evaluateSelector(btn, 'textContent')

        if(btnName == 'Box' || btnName == 'Gameday' || btnName == 'Preview') return await functions.evaluateSelector(btn, 'href')
    })
    return href;
}



const mlbSelectors = {
    scoresPage: {
        gameContainers: '.gmoPjI',
        teamNames: '.fdaoCu',
        gameStatus: '.cBEKUV',
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

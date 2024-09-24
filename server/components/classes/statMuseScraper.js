const { browserFunctions } = require("./scraper.js")
const {forOfAwait} = require('../functions.js')

async function statMuseFunctions(){
    const browser = await browserFunctions();

    return {
        searchStatMuse: async function(query){
            await browser.loadPage(`https://www.statmuse.com/mlb/ask/${query}`)
            await browser.screenshot()
            return getPlayerData(browser)
        },
    }
}

async function getPlayerData(browser){
    const table = await browser.getSelector('table > tbody')

    let playerData = await forOfAwait(await browser.getSelectors('td', table), async (data)=>{
        return await browser.evaluateSelector(data, 'textContent')
    })
    
    return {
        games: playerData[3],
        AB: playerData[4],
        hits: playerData[5],
        HR: playerData[8],
        BB: playerData[10],
        K: playerData[12],
        PA: playerData[13],
        AVG: playerData[19],
        OBP: playerData[20],
        SLG: playerData[21],
        OPS: playerData[22]
    }
}

module.exports = {statMuseFunctions}
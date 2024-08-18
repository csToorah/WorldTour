const {browserScraperHome} = require('./browser.js')

const mlbScoresObject = {
    home: {
        name: '.jvtlUR',
        score: '.fShOIg.home'
    },
    visitor: {
        name: '.dtUVre',
        score: '.fShOIg.away'
    },
    inning: '.jfAqho'
}

async function runBrowserJS(){
    let page = await browserScraperHome()

    return await page.loadPage('https://www.mlb.com/gameday/mariners-vs-pirates/2024/08/18/745464/live/box');

    page.pushData(await page.scrapeData(mlbScoresObject));
}

module.exports = {runBrowserJS}
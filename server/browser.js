const puppeteer = require('puppeteer')

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

    await page.loadPage('https://www.mlb.com/gameday/mariners-vs-pirates/2024/08/18/745464/live/box');

    page.pushData(await scrapeData({name: {name: 'Cesar'}, hello: 'hello'}, page))

    page.getData()
}

async function browserScraperHome(){
    const page = await openBrowser();
    let dataArray = [];

    return{
        loadPage: async function(url){
            return await page.goto(url);
        },
        searchPage: async function(selector){
            return await page.$(selector);
        },
        evaluateText: async function(element){
            return await element.evaluate(el => el.textContent);
        },
        pushData: function(data){
            dataArray.push(data)
        },
        getData: function(){
            return dataArray;
        }
    }

}

async function scrapeData(object, page){
    for (const key in object) {
        if (Object.hasOwnProperty.call(object, key) && typeof(object[key]) !== 'object') {
            object[key];
        }else{
            scrapeData(object[key])
        }
    }
    return object;
}

async function openBrowser(){
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    return page;
}

runBrowserJS()
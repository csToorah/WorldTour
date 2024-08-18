const puppeteer = require('puppeteer')

async function browserScraperHome(){
    const page = await openBrowser();
    let dataArray = [];

    return{
        loadPage: async function(url){
            await page.goto(url);
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
        },
        scrapeData: async function(object){
            for (const key in object) {
                if (Object.hasOwnProperty.call(object, key) && typeof(object[key]) !== 'object') {
                    object[key] = 'hello'
                }else{
                    object[key] = await this.scrapeData(object[key])
                }
            }
            return object;
        }
    }

}

async function openBrowser(){
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    return page;
}

module.exports = {browserScraperHome}
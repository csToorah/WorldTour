const puppeteer = require('puppeteer')

async function browserFunctions(){
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({width: 2000, height: 1000})

    return{
        getPage: function(){
            return page;
        },
        loadPage: async function(url){
            try{
                await page.goto(url)
                return `You went to ${page.url()}`
            }catch(err){
                console.log(`There was an error loading ${url}`)
            }
        },
        closePage: async function(){
            try{
                await page.close();
            }catch(err){
                console.log('There was an error closing the page')
            }
        },
        getURL: function(){
            return page.url();
        },
        awaitNavigation: async function(){
            try{
                await page.waitForNavigation({'waitUntil': 'networkidle2'})
            }catch(err){
                console.log(`There was an error loading the page ${page.url()}`)
            }
        },
        getSelector: async function(selector, container = page){
            try{
                return await container.$(selector)
            }catch(err){
                console.log(`There as an error getting selector ${selector} from ${container}\n${err}`)
            }
        },
        getSelectors: async function(selector, container = page){
            try{
                return await container.$$(selector)
            }catch(err){
                console.log(`There was an error getting the selectors ${selector} from ${container}\n${err}`)
            }
        },
        evaluateSelector: async function(element, type, options = {ignore: false}){
            try{
                return await element.evaluate((el, type) => el[type], type)
            }catch(err){
                if(!options.ignore)console.log(`There was an error evaulating ${element} and ${type}\n${err}`)
            }
        },
        clickBtn: async function(selector, options = {ignore: false}){
            try {
                await page.click(selector)
                return true;
            } catch (err) {
                if(!options.ignore){console.log(`There was an error clicking ${selector}\n${err}`)}
                return false;
            }
        },
        screenshot: async function(selector){
            await page.screenshot({path: `server/logs/errors/error${selector}-screenshot${Math.round((Math.random() * 100))}.png`})
        }
    }
}

module.exports = {browserFunctions}
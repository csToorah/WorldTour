const puppeteer = require('puppeteer')

async function scrapeData(url){
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    try{
        await page.goto(url)
    }catch(err){
        await browser.close();
        return;
    }

    return await page.content();
}

module.exports = {scrapeData}

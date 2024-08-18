const puppeteer = require('puppeteer')

async function scrapeData(url){
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    try{
        await page.goto(url)

        const visitorScore = await page.$('.fShOIg.away')
        const homeScore = await page.$('.fShOIg.home')

        const visitorName = await page.$('.dtUVre')
        const homeName = await page.$('.jvtlUR')

        console.log(`${await evaluate(homeName)} ${await evaluate(homeScore)} - ${await evaluate(visitorScore)} ${await evaluate(visitorName)}`)
    }catch(err){
        await browser.close();
        return;
    }

    return await page.content();
}

scrapeData('https://www.mlb.com/gameday/mariners-vs-pirates/2024/08/18/745464/live/box')

async function evaluate(element){
    return await element.evaluate(el => el.textContent)
}

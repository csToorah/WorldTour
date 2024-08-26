const http = require('http');
const puppeteer = require('puppeteer')
const fs = require('fs');
const fsPromises = require('fs').promises

async function collectData(){
    let browserFunctions = await openBrowser();

    await browserFunctions.loadPage('https://www.mlb.com/scores')
    let games = await browserFunctions.scrapeScoresPage()
    let data = await browserFunctions.scrapeGameDayPages(games)
}

collectData()

async function openBrowser(){
    let browser = await puppeteer.launch()
    let page = await browser.newPage()
    let browserObjects = new Map()

    return{
        loadPage: async function(url){
            await page.goto(url)
        },
        scrapeScoresPage: async function(){
            let gameContainers = await page.$$('.gmoPjI')
            let games = [];
            for await(const gameContainer of gameContainers){
                let namesArray = []
                for await(const name of teamNames = await gameContainer.$$('.fdaoCu')){
                    if(namesArray.length < 2) namesArray.push(await name.evaluate(el => el.textContent))
                }
                let getGameStatus = async (gameStatusClasses = ['.fGwgfi', '.feaLYF', '.cBEKUV'])=>{
                    for await(const gameStatusClass of gameStatusClasses){
                        if(await gameContainer.$(gameStatusClass)){
                            return (await(await gameContainer.$(gameStatusClass)).evaluate(el => el.textContent)).split('Free')[0]
                        }
                    }
                }
                let gameStatus = await getGameStatus()
                games.push({home: namesArray[1], visitor: namesArray[0], gameStatus: gameStatus, gameContainer: gameContainer})
            }
            return games;
        },
        scrapeGameDayPages: async function(games){
            let href = await (await games[0].gameContainer.$('.kwMGcY > div:nth-child(3) > a')).evaluate(el => el.href)
            await page.goto(href)
            console.log(page.url())
        }
    }
}

const PORT = process.env.PORT || 2000;

const server = http.createServer(function(req, res){
    console.log(req.url)
    async function readFile(){
        if(req.url == '/')
        try{
            let data = await fsPromises.readFile('./client/views/index.html')
            console.log('i sent the file')

            res.writeHead(200, {"Content-Type": "text/html"})
            res.end(data)
        }catch(err){
            console.error(err)
        }
    }
    readFile()
})

server.listen(PORT, ()=>{
    console.log(`Server is listening on PORT ${PORT}`)
})




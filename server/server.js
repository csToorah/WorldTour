const http = require('http');
const puppeteer = require('puppeteer')
const fs = require('fs');
const fsPromises = require('fs').promises

async function collectData(){
    let browserFunctions = await openBrowser();

    await browserFunctions.loadPage('https://www.mlb.com/scores')
    let games = await browserFunctions.scrapeScoresPage()
}

collectData()

async function openBrowser(){
    let browser = await puppeteer.launch()
    let page = await browser.newPage()
    let browserObjects = new Map()

    const gamedayOBject = {
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

    return{
        loadPage: async function(url){
            await page.goto(url)
        },
        scrapeScoresPage: async function(){
            let gameContainers = await page.$$('.gmoPjI')
            let teams = [];
            for await(const gameContainer of gameContainers){
                let namesArray = []
                for await(const name of teamNames = await gameContainer.$$('.fdaoCu')){
                    if(namesArray.length < 2) namesArray.push(await name.evaluate(el => el.textContent))
                }
                let getGameStatus = async (gameStatusClasses = ['.fGwgfi', '.feaLYF', '.cBEKUV'])=>{
                    for await(const gameStatusClass of gameStatusClasses){
                        if(await gameContainer.$(gameStatusClass)){
                            return (await(await gameContainer.$(gameStatusClass)).evaluate(el => el.textContent)).split('F')[0]
                        }
                    }
                }
                let gameStatus = await getGameStatus()
                teams.push({home: namesArray[1], visitor: namesArray[0], gameStatus: gameStatus})
                for await(btn of btns = await gameContainer.$$('.dIJeFt')){
                    if(await btn.evaluate(el => el.textContent) === 'Gameday'){
                        try{
                            await btn.evaluate(el => el.click())
                            await page.waitForNavigation({'waitUntil': 'domcontentloaded'})
                        }catch(err){
                            console.log(err)
                        }
                        break;
                    }
                }

            }
            
            return teams;
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




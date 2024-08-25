const http = require('http');
const puppeteer = require('puppeteer')
const fs = require('fs');
const { Console } = require('console');
const fsPromises = require('fs').promises

openBrowser().then(values =>{
    console.log(values)
    fs.writeFile('./client/json/data.json', JSON.stringify(values, null, 2),'utf-8' , (err)=>{
        if(err){console.log(err)}
        console.log('Saved!')
    })
})

async function openBrowser(){
    let browser = await puppeteer.launch()
    let page = await browser.newPage()
    await page.goto('https://www.mlb.com/scores')

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

    const scrape = async (object)=>{
        for (const key in object) {
            if (Object.prototype.hasOwnProperty.call(object, key) && typeof(object[key]) !== 'object') {
                object[key] = await (await page.$(object[key])).evaluate(el => el.textContent);
            }else{
                await scrape(object[key])
            }
        }
        return object;
    }

    const scrapeAll = async(selector)=>{
        let gameContainers = await page.$$(selector)
        let teams = [];

        for await(const gameContainer of gameContainers){
            let teamNames = await gameContainer.$$('.fdaoCu');
            let namesArray = []
            for await(const name of teamNames){
                if(namesArray.length < 2) namesArray.push(await name.evaluate(el => el.textContent))
            }
            teams.push({home: namesArray[0], visitor: namesArray[1]})
            namesArray =[]
        }
        console.log(teams)
        return 'Hello'
    }
    return scrapeAll('.gmoPjI')
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




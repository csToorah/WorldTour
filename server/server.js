const http = require('http');
const puppeteer = require('puppeteer')
const fs = require('fs')
const fsPromises = require('fs').promises

function makeHtml(){
    
}

async function openBrowser(){
    let browser = await puppeteer.launch()
    let page = await browser.newPage()
    await page.goto('https://www.mlb.com/gameday/mariners-vs-pirates/2024/08/18/745464/live/box')

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

    return scrape(mlbScoresObject)
}

openBrowser().then(values =>{
    makeHtml(values)
}).catch(err =>{
    console.log(err)
})

const PORT = process.env.PORT || 4000;
async function readFile(res){
    try{
        let data = await fsPromises.readFile('../client/views/index.html')

        res.writeHead(200, {'Content-Type': 'text/html'})
        res.end(data)

    }catch(err){
        console.log(err)
    }
}

const server = http.createServer(function(req, res){
    console.log(req.url)
    readFile(res)
})

server.listen(PORT, ()=>{
    console.log(`Server is listening on PORT ${PORT}`)
})




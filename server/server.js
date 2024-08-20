const http = require('http');
const puppeteer = require('puppeteer')
const fs = require('fs')
const fsPromises = require('fs').promises

openBrowser().then(values =>{
    fs.writeFile('./client/json/data.json', JSON.stringify(values, null, 2),'utf-8' , (err)=>{
        if(err){console.log(err)}
        console.log('Saved!')
    })
})

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

const PORT = process.env.PORT || 3000;

const server = http.createServer(function(req, res){
    console.log(req.url)
    async function readFile(){
        try{
            let data = await readFile('./client/json/data.json')

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




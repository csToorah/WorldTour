const http = require('http')
const {scrapeData} = require('../client/scripts/index.js')

const PORT = process.env.PORT || 3500

const server = http.createServer(function(req, res){
    async function createWrite(){
        res.writeHead(200, {'Content-Type': 'text/html'})
        res.end(await scrapeData('https://www.mlb.com'))
    }
    createWrite()
})

server.listen(PORT, ()=>{
    console.log(`Server is listening on ${PORT}`)
})


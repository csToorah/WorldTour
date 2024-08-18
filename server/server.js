const http = require('http')
const {scrapeData} = require('./browser.js')

const PORT = process.env.PORT || 3500

const server = http.createServer(function(req, res){
    async function createWrite(){
        res.writeHead(200, {'Content-Type': 'text/html'})
        res.end()
    }
    createWrite()
})

server.listen(PORT, ()=>{
    console.log(`Server is listening on ${PORT}`)
})




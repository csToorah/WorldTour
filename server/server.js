const http = require('http');
const {runBrowserJS} = require('./data.js');

runBrowserJS()

const PORT = process.env.PORT || 6000;

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




const http = require('http');
const fs = require('fs');
const fsPromises = require('fs').promises
const {runTerminal} = require('./terminal.js')


runTerminal();

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




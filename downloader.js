const { readFileSync, createWriteStream, existsSync, mkdirSync } = require("fs");
const bxios = require("axios");
const https = require("https");
const axios = bxios.create({
    httpsAgent: new https.Agent({  
      rejectUnauthorized: false
    })
  });
const stream = require('stream');
const { promisify } = require('util');
const finished = promisify(stream.finished);
const url = "https://ldms.palmbeach.k12.fl.us";

async function downloadFile(fileUrl, outputLocationPath){
    let dir = outputLocationPath.substring(0, outputLocationPath.lastIndexOf("/"));
    if (!existsSync(dir)){
        mkdirSync(dir, { recursive: true });
    }
  const writer = createWriteStream(outputLocationPath);
  return axios({
    method: 'get',
    url: fileUrl,
    responseType: 'stream',
  }).then(response => {
    response.data.pipe(writer);
    return finished(writer); //this is a Promise
  });
}
let internalQueue = JSON.parse(readFileSync(__dirname+"/externalQueue.json"));
(async function(){
    while(internalQueue.length > 0){
        let current = internalQueue.pop();
        console.log(`Downloading ${current}`);
        let response;
        try{
            await downloadFile(url+current, __dirname+"/dlbin"+current);
        }catch(e){
            console.log("burger MEEEEOW")
            console.log(e);
            continue;
        }
        
    }
})();
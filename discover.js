const bxios = require("axios");
const https = require("https");
const fs = require("fs");
const axios = bxios.create({
    httpsAgent: new https.Agent({  
      rejectUnauthorized: false
    })
  });
const url = "https://ldms.palmbeach.k12.fl.us";
let internalQueue = JSON.parse(fs.readFileSync(__dirname+"/internalQueue.json"));
let externalQueue = JSON.parse(fs.readFileSync(__dirname+"/externalQueue.json"));
let completedQueue = JSON.parse(fs.readFileSync(__dirname+"/completedQueue.json"));
let state = JSON.parse(fs.readFileSync(__dirname+"/state.json"));
setInterval(() => {
    fs.writeFileSync(__dirname+"/internalQueue.json", JSON.stringify(internalQueue));
    fs.writeFileSync(__dirname+"/externalQueue.json", JSON.stringify(externalQueue));
    fs.writeFileSync(__dirname+"/completedQueue.json", JSON.stringify(completedQueue));
    fs.writeFileSync(__dirname+"/state.json", JSON.stringify(state));
    console.log((state.totalSize/1000000000000).toFixed(2) + " TB"+ " (" + state.operations + " operations) " + externalQueue.length + " files");
    state.operations = 0;
}, 10000);
async function bongle(){
    while(internalQueue.length > 0) {
        state.operations++;
        let current = internalQueue.pop();
        let response;
        try{
            response = await axios.get(url + current);
        }catch(e){
            continue;
        }
        let links = response.data.match(/HREF="([^"]*)"/g);
        if(links == null) continue;
        for(let i = 0; i < links.length; i++) {
            //add directory to internal queue
            //add file to external queue
            //if file, add size to total

            let link = links[i].replace(/HREF="/, "").replace(/"/, "");
            //console.log(link);
            if(link.endsWith("/")) {
                if(completedQueue.indexOf(link) == -1){
                    internalQueue.push(link);
                    completedQueue.push(link);
                }
            }
            else {
                if(externalQueue.indexOf(link) == -1) externalQueue.push(link);
                //size is right in front of the link in a text node
                // example: 
                // 5/25/2018 10:00 PM        &lt;dir&gt; <A HREF="/deploy/Autodesk/">Autodesk</A>

                state.totalSize += parseInt(response.data.substring(response.data.indexOf(link) - 21, response.data.indexOf(link)-10).trim());
            }
        }
    }
}
bongle();
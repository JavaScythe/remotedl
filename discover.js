const axios = require("axios");
const fs = require("fs");
let saved = fs.readFileSync(__dirname+"/saved.txt", "utf8").split("\n");
const origin = "https://ldms";
let dirs = [
    "/deploy"
];
let found = [];
setInterval(() => {
    if(found.length > 0){
        fs.appendFileSync(__dirname+"/queue.txt", found.join("\n")+"\n");
    }
}, 1000);
function list(a){
    for(let i in a){
        //if item is directory
        if(a[i].indexOf(".") == -1){
            dirs.push(a[i]);
        } else {
            found.push(a[i]);
        }
    }
}



const MANAGER = new Manager()
//EXPRESS
const express = require('express')
const async = require('async')
const http = require('http')
const mysql = require('mysql')
const app = express()
const port = 3333
app.set("view options", {
  layout: false
});
app.use(express.static(__dirname + '/public'));
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
//START
app.listen(port, () => {
    console.log(`Synch Server Time listening on port ${port}`)
})
app.get('/', (req, res) => {
    res.render('public/index.html')
})
//API
app.get('/setup', (req, res) => {
    let data = MANAGER.addDevice()
    res.send(data)
})
app.post('/ping', (req, res) => {
    // console.log(req.body);
    let id = req.body.id
    let response = {
        reassign: false,
        error: false
    }
    let device = MANAGER.device(id)
    if(device){
        device.pinged()
        if(MANAGER.shouldReassign(device)){
            response.reassign = MANAGER.track
        }
    } else {
        console.log("OLD DEVICE");
        response.error = true
    }
    res.send(JSON.stringify(response))
})

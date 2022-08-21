class Track {
    constructor(id, title, src) {
        this._istances = 0
        this._volume = 100
        this._delay = 0
        this.id = id
        this.title = title
        this.src = src
    }

    // get istances() {
    //     return this._istances
    // }

    // get master() {
    //     return this._volume
    // }

    // get delay() {
    //     return this._delay
    // }

    pick() {
        this._istances++
        console.log("picked track", this.id, this._istances);

    }

    remove() {
        this._istances--
        console.log("removed track", this.id, this._istances);
    }
}

class Device {
    constructor(
        id
    ) {
        this.id = id
        this.track = MANAGER.track
        // this.pingTimeout = this.timeout()
    }

    pinged() {
        clearTimeout(this.pingTimeout)
        this.pingTimeout = this.timeout()
    }

    timeout() {
        return setTimeout(() => {
            MANAGER.removeDevice(this)
        }, MANAGER.pingTimeoutTime)
    }
}
class Manager {

    constructor() {

        //SERVER
        this._startTime = Date.now()
        this.pingTimeoutTime = 5000
        this.duration = 1188.8848979591837 * 1000 //ms durata

        this._tracks = [
            new Track(0, 'ANuovo', 'ANuovo.mp3'),
            new Track(1, 'BNuovo', 'Bnuovo.mp3'),
            new Track(2, 'CBit', 'C bit.mp3'),
            new Track(3, 'DBit', 'D bit.mp3'),
            new Track(4, 'E', 'E.mp3'),
            new Track(5, 'Gbit nuovo', 'Gbit nuovo.mp3'),
            new Track(6, 'Gbit nuovo', 'Gbit nuovo.mp3'),
            new Track(8, 'Gbit nuovo', 'Gbit nuovo.mp3'),
            new Track(9, 'K slow', 'K slow.mp3'),
            new Track(10, 'K1', 'K prova1.mp3'),
            new Track(11, 'k2', 'k prova2.mp3'),
            new Track(12, 'Z1', 'Z1.mp3'),
            new Track(13, 'Z1', 'Z1.mp3'),
            new Track(14, 'Z1', 'Z1.mp3'),
            new Track(15, 'Z1', 'Z1.mp3'),
            new Track(16, 'Z2', 'Z2.mp3'),
            new Track(17, 'Z2', 'Z2.mp3'),
            new Track(18, 'Z2', 'Z2.mp3'),
            new Track(19, 'Z2', 'Z2.mp3'),
            new Track(20, 'Z2', 'Z2.mp3'),
            new Track(21, 'Z2', 'Z2.mp3'),
            new Track(22, 'Z2', 'Z2.mp3'),
            new Track(23, 'Z2', 'Z2.mp3'),
            new Track(24, 'Z2', 'Z2.mp3'),
            new Track(25, 'Z2', 'Z2.mp3'),
            new Track(26, 'Z2', 'Z2.mp3'),
            new Track(27, 'Z2', 'Z2.mp3'),
            new Track(28, 'Z2', 'Z2.mp3'),
            new Track(29, 'Z2', 'Z2.mp3'),
            new Track(30, 'Z2', 'Z2.mp3'),
            new Track(31, 'Z2', 'Z2.mp3'),
            new Track(32, 'Z2', 'Z2.mp3'),
            new Track(34, 'Z2', 'Z2.mp3'),
            new Track(35, 'Z2', 'Z2.mp3'),
            new Track(36, 'Z2', 'Z2.mp3'),
            new Track(37, 'Z2', 'Z2.mp3'),
            new Track(38, 'Z2', 'Z2.mp3'),
            new Track(39, 'Z2', 'Z2.mp3')
        ]

        this.currentId = 0

        this._devices = []
    }


    get time() {
        let d = Date.now() - this._startTime
        if (d > this.duration) {
            this._startTime = this._startTime + this.duration
        }
        console.log("Giving ", this._startTime);
        return this._startTime
    }


    //CONTROLLER
    device(id) {
        return this._devices.find(i => i.id == id)
    }

    shouldReassign(device) {
        let pick = this.preview
        if(this._devices.find(i=>i.track.id > pick.id) == undefined){
            // console.log("NOT REASSING", device.track.id, this.preview.id);
            return false
        }
        if (device.id == this.candidate.id) {
            return true
        }
        // console.log("NOT REASS", device.track.id, this.candidate.id);
        return false
    }

    get candidate() {
        let id = this._devices[0].id
        let c = this._devices.reduce((pick, next)=>{
            return pick.track.id > next.track.id ? pick : next
        })
        console.log("candidate", c.id);
        return c
    }


    get track() {
        let picked = this.preview
        picked.pick()
        return picked
    }

    get preview() {
        let p = this._tracks.reduce((pick, t) => {
            // console.log(pick.id, pick._istances, "-", t.id, t._istances);
            return pick._istances > t._istances || pick._istances != 0 ? t : pick
        })
        
        // console.log(p.id);
        return p
    }

    addDevice() {
        let newDevice = new Device(this.currentId)
        this.currentId++
        this._devices.push(newDevice)
        return {
            d: newDevice,
            t: this.time
        }
    }

    removeDevice(device) {
        console.log("Removing", device.track.id);
        let filtered = this._devices.filter(i => i.id != device.id)
        if(filtered.length != this._devices.length){device.track.remove()}
        else {
            console.log("ELSE ERROR");
        }
        this._devices = filtered
    }

}


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
    delete data.d.pingTimeout
    console.log(data);
    res.send(JSON.stringify(data))
})

app.post('/ping', (req, res) => {
    // console.log(req.body);
    let id = req.body.id
    let response = {
        reassign: false,
        error: false
    }
    let device = MANAGER.device(id)
    if (device) {
        device.pinged()
        if (MANAGER.shouldReassign(device)) {
            device.track.remove()
            device.track = MANAGER.track
            response.reassign =  device.track
            console.log("ressign", response.reassign.id);
        }
    } else {
        console.log("OLD DEVICE");
        response.error = true
    }

    res.send(JSON.stringify(response))
})
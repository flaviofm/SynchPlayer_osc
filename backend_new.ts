export class Track {
    private _istances = 0
    private _volume = 100
    private _delay = 0
    constructor(
        public readonly id, private title, private src
    ) {}

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
    }

    remove() {
        this._istances--
    }
}
class Device {
    track: Track
    private pingTimeout
    constructor(
        public readonly id
    ) {
        this.track = MANAGER.track
        this.pingTimeout = this.timeout()
    }

    pinged(){
        clearTimeout(this.pingTimeout)
        this.pingTimeout = this.timeout()
    }

    private timeout(){
        return setTimeout(() =>{
            MANAGER.removeDevice(this)
        }, MANAGER.pingTimeoutTime)
    }
}
class Manager {
    //SERVER
    private _startTime = Date.now()

    readonly pingTimeoutTime = 5000

    readonly duration = 1188.8848979591837 * 1000 //ms durata


    get time() {
        let d = Date.now() - this._startTime
        if (d > this.duration) {
            this._startTime = this._startTime + this.duration
        }
        console.log("Giving ", this._startTime);
        return this._startTime
    }


    //CONTROLLER

    private _tracks = [
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

    private currentId = 0

    private _devices: Device[] = []

    device(id: number) {
        return this._devices.find(i=>i.id==id)
    }

    shouldReassign(device:Device):boolean {
        if(device.track.id > this.preview) return true
        return false
    }

    
    get track(): Track {
        let picked = this.preview
        picked.pick()
        return picked
    }

    get preview(): Track {
        return this._tracks.reduce((pick, t) => {
            return pick.istances > t.istances ? t : pick
        })
    }

    addDevice():SETUPRESPONSE {
        let newDevice = new Device(this.currentId)
        this._devices.push(newDevice)
        return {
            d: newDevice,
            t: this.time
        }
    }

    removeDevice(device:Device):void {
        this._devices.filter(i=>i.id!=device.id)
    }

}

export interface SETUPRESPONSE {
    d: Device,
    t: number
}

export interface PINGRESPONSE {
    reassign:false|Track,
    error:boolean
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
    let data:SETUPRESPONSE = MANAGER.addDevice()
    res.send(data)
})

app.post('/ping', (req, res) => {
    // console.log(req.body);
    let id = req.body.id
    let response:PINGRESPONSE = {
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
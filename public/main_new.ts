import {
    PINGRESPONSE,
    SETUPRESPONSE,
    Track
} from "../backend_new";

class Player {

    private _track: Track | undefined = undefined
    private _startTime = 0

    playing = false

    private player

    constructor() {
        this.player = $("#audio").get(0) as HTMLAudioElement
        this.player.loop = true
    }

    set startTime(time: number) {
        this._startTime = time
    }

    set track(track: Track) {
        this._track = track
        $("#track").val(track.src)
        $("#trackH3").html(track.src)
        if(this._track){
            this.fadeOut().then(()=>{
                $(this.player).attr("src", 'tracks/' + track.src);
                this.fadeIn()
            })
        } else {
            $(this.player).attr("src", 'tracks/' + track.src);
        }
    }

    set time(time: number) {
        this.player.currentTime = time / 1000
    }

    set master(master: number) {
        if (!master || master < 0 || master > 100) master = 100;
        $("#masterInput").val(master);
        this.track._volume = master
        this.player.animate({
            volume: (this.master / 100)
        }, 1000)
    }

    get master(){
        return this.track._volume
    }

    get delay() {
        return this.track._delay
    }


    play() {
        console.log("PLAY");
        $("#underlay").addClass("active");
        $(this.player).prop("muted", false);
        this.player.play()
        this.playing = true
        this.time = Date.now() - this.startTime
    }

    checkup() {
        //CHECK MASTER
        //TODO: check master
        // if(this.master != this.player.volume)

        //CHECK TIME
        let checkTime = Date.now() - this.startTime
        if(checkTime > this.player.currentTime + this.delay ||checkTime < this.player.currentTime - this.delay) {
            console.log("Adjusting");
            this.time = checkTime
        }
    }

    async fadeIn(f = () => {
        console.log("faded in")
    }) {
        console.log("f in")
        $(this.player).animate({
            volume: this.master
        }, 3000, f);
    }
    async fadeOut(f = () => {
        console.log("faded out")
    }) {
        console.log("f out")
        $(this.player).animate({
            volume: 0
        }, 3000, f);
    }
}


class Controller {
    id = -1
    player = new Player()
    interval = 0
    readonly pingTime = 2500
    readonly pingTimeout = 7500
    readonly checkTime = 5000
    readonly adjustTime = 2
    private pinging = false

    constructor() {
        fetch('/setup').then(res => res.json()).then((res: SETUPRESPONSE) => {
            this.player.track = res.d.track
            this.id = res.d.id
            this.player.startTime = res.t
            //TODO this.start()
        })
    }

    start() {
        this.player.play()

        // this.player.play()
        // setTimeout(() =>{
        //     //TODO: perchè devi aspettare 500ms dopo il play altrimenti non va il curretnTime?
        //     this.player.currentTime = 100
        // }, 500)
        //per evitare che si raddoppino i ping
        this.ping()
        this.pinging = true
    }

    ping() {
        clearTimeout(this.interval)
        fetch('/ping', {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                id: this.id
            })
        }).then(res => res.json()).then((res:PINGRESPONSE) => {
            //CHECKUP
            if(res.error) {
                alert("DISPOSITIVO RIMOSSO DAL SERVER")
                location.reload()
                return
            }
            if(res.reassign) {
                this.player.track = res.reassign
            }

            this.player.checkup()


            //Timeout Ping
            this.timeoutPing()
            //Ping
            setTimeout(() => {
                this.ping()
            }, this.pingTime)
        })
    }

    private timeoutPing() {
        this.interval = setTimeout(() => {}, this.pingTimeout)
    }
}

function loadOut() {
    $("#loading").fadeOut(100)
}

function loadIn() {
    $("#loading").fadeIn(100)
}

function enableBegin() {
    document.getElementById("setup") !.classList.remove("disabled")
    document.getElementById("setup") !.addEventListener("click", () => {
        CONTROLLER.start()
        loadOut()
    })
}

document.getElementById("setup") !.classList.add("disabled")
const CONTROLLER = new Controller()
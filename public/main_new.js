class Player {




    constructor() {
        this.player = document.getElementById("audio")
        this.player.loop = true
        this._track = undefined
        this._startTime = 0

        this.fadeInTime = 4000
        this.fadeOutTime = 2000
        this.fadeLoadingWaitTime = 2000

        this.playing = false

        // this.duration = 1188.8848979591837 * 1000 //ms durata
        this.duration = 1200.024 * 1000 //ms durata


    }

    set startTime(time) {
        this._startTime = time
    }

    get startTime() {
        return this._startTime
    }

    set track(track) {
        if (this._track != undefined) {
            console.log(this._track);
            fadeOutAudio(() => {
                console.log("CHANGING TRACK");
                $(this.player).attr("src", 'tracks/' + track.src);
                $("#track").val(track.src)
                $("#trackH3").html(track.src)
                setTimeout(fadeInAudio, this.fadeLoadingWaitTime)
            })
        } else {
            console.log("CHANGING UNDEFINED");
            $(this.player).attr("src", 'tracks/' + track.src);
            $("#track").val(track.src)
            $("#trackH3").html(track.src)
        }
        this._track = track
    }

    get track() {
        return this._track
    }

    set time(time) {
        // console.log(this.player);
        this.player.currentTime = time / 1000
    }

    set master(master) {
        if (!master || master < 0 || master > 100) master = 100;
        $("#masterInput").val(master);
        this.track._volume = master
        // this.player.animate({
        //     volume: (this.master / 100)
        // }, 1000)
    }

    get master() {
        // console.log(this.track);
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
        if (!this.playing) return
        if (this.player.paused) this.player.play()
        //CHECK MASTER
        //TODO: check master
        // if(this.master != this.player.volume)

        //CHECK TIME
        // console.log(this.startTime);
        let checkTime = Date.now() - this.startTime
        if (checkTime > this.duration) {
            this.startTime += this.duration
        }
        if (checkTime > (this.player.currentTime * 1000) + this.delay + CONTROLLER.adjustTime || checkTime < (this.player.currentTime * 1000) + this.delay - CONTROLLER.adjustTime) {
            console.log("Adjusting", checkTime, this.player.currentTime, this.delay, CONTROLLER.adjustTime);
            this.time = checkTime
        }
    }



    // async fadeIn(f = () => {
    //     console.log("faded in")
    // }) {
    //     console.log("f in")
    //     $(this.player).animate({
    //         //TODO: ERRORE this.master ha valori strani
    //         volume: this.master/100
    //     }, this.fadeTime, f);
    // }


    // async fadeOut(f = () => {
    //     console.log("faded out")
    // }) {
    //     console.log("f out")
    //     $(this.player).animate({
    //         volume: 0
    //     }, this.fadeTime, f);
    // }
}


class Controller {
    id = -1
    player = new Player()
    interval = 0
    pingTime = 5000
    pingTimeout = 15000
    checkTime = 5000
    adjustTime = 2000
    pinging = false

    constructor() {
        fetch('/setup').then(res => res.json()).then((res) => {
            this.player.track = res.d.track
            this.id = res.d.id;
            this.player.startTime = res.t
            console.log("Start time", this.player.startTime);
            this.ping()
            this.pinging = true
            //TODO this.start()
            enableBegin()
        })
    }

    start() {
        this.player.play()

        // this.player.play()
        // window.setTimeout(() =>{
        //     //TODO: perchè devi aspettare 500ms dopo il play altrimenti non va il curretnTime?
        //     this.player.currentTime = 100
        // }, 500)
        //per evitare che si raddoppino i ping
    }

    ping() {
        // if(!this.pinging) {console.log("not pinging"); return false}
        // console.log("ping");



        // clearTimeout(this.interval)
        fetch('/ping', {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                id: this.id
            })
        }).then(res => res.json()).then((res) => {
            //CHECKUP
            if (res.error) {
                // alert("DISPOSITIVO RIMOSSO DAL SERVER")
                location.reload()
                return
            }
            if (res.reassign) {
                // fadeOutAudio(()=>{
                //     this.player.track = res.reassign
                //     fadeInAudio();
                // })
                this.player.track = res.reassign

            }

            this.player.checkup()


            //Timeout Ping
            this.timeoutPing()
            //Ping
            window.setTimeout(() => {
                this.ping()
            }, this.pingTime)
        }).catch(()=>{
            console.log("Catch")
            // location.reload()
        })
    }

    timeoutPing() {
        clearInterval(this.interval)
        this.interval = window.setTimeout(() => {
            document.getElementById("check").innerHTML = "Ping Fallito"
            this.pinging = false
            //TODO: non reaload ma vai avanti fino alla fine e poi riconnetti
            location.reload()
        }, this.pingTimeout)
    }
}

function loadOut() {
    $("#loading").fadeOut(100)
}

function loadIn() {
    $("#loading").fadeIn(100)
}

function enableBegin() {
    document.getElementById("setup").classList.remove("disabled")
    document.getElementById("setup").addEventListener("click", () => {
        CONTROLLER.start()
        loadOut()
    })
}

document.getElementById("setup").classList.add("disabled")
const CONTROLLER = new Controller()



function fadeOutAudio(f = () => {
    console.log("END FO 3")
}) {
    console.log("START FO 3");
    $(CONTROLLER.player.player).animate({
        volume: 0
    }, CONTROLLER.player.fadeOutTime, f);


}

function fadeInAudio(f = () => {
    console.log("END FI 3")
}) {
    console.log("START FI 3");
    $(CONTROLLER.player.player).animate({
        volume: CONTROLLER.player.master / 100
    }, CONTROLLER.player.fadeInTime, f)
}
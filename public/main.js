class Player {
    constructor() {
        this.player = $("#audio").get(0);
        this.player.loop = true
        this._master = 100;
        this._delay = 0
        this._track = undefined
        this._start = 0
        this.interval = 0
        this.id
        this.pingTime = 2500
        this.pingTimeout = 7500
        this.adjustTime = 2
        this.checkTime = 5000
    }

    set start(t) {
        this._start = t
    }
    get start() {
        return this._start
    }

    get time() {
        return this.player.currentTime
    }
    set time(t) {
        this.player.currentTime = t / 1000
        console.log("Set time", t, this.player.currentTime);
    }

    set master(m) {
        $("#masterInput").val(m);

        if (!m || m < 0 || m > 100) {
            m = 100;
        }
        console.log(m);
        this._master = m
        this.player.animate({
            volume: (this.master / 100)
        }, 1000)
    }

    get master() {
        return this._master
    }

    set track(data) {
        console.log("TRACCIA", data)
        // $("#playBtn").attr("disabled", false)
        // data = $.parseJSON(data)
        this._track = data
        $("#track").val(data.src)
        $("#trackH3").html(data.src)
        $(this.player).attr("src", 'tracks/' + data.src);

        this.master = data.master

        this.delay = data.delay
        // this.master = data.master;
        this.checkReady()
    }

    set delay(d) {
        $("#delay").html(d)
        this._delay = d
    }

    play() {
        console.log("PLAY");
        $("#underlay").addClass("active");
        // let ct = (Date.now() - this.start + this._delay)/1000
        $(this.player).prop("muted", false);

        this.player.play()
        this.time = Date.now() - this.start
        // this.player.play()
        // setTimeout(() =>{
        //     //TODO: perchè devi aspettare 500ms dopo il play altrimenti non va il curretnTime?
        //     this.player.currentTime = 100
        // }, 500)
        this.check()
        this.pingSetup()
    }

    async fadeIn(f = ()=>{console.log("faded in")}){
        console.log("f in")
        $(this).animate({volume: this.master}, 3000, f);
    }
    async fadeOut(f = ()=>{console.log("faded out")}){
        console.log("f out")
        $(this).animate({volume: 0}, 3000, f);
    }

    stop() {
        clearInterval(this.interval);
        this.player.prop("muted", true);
        this.player.pause()
    }

    check() {
        let contx = this

        function checkMaster() {
            console.log("check master")
            //this.master = getMaster
            $("#volume").html(contx.master);
        }

        async function checkTempo() {
            console.log("check tempo")
            // getDealy
            // getTime
            // checkTime
            // let checkedTime = Date.now() - (await fetch("/time")) + contx.delay
            let checkedTime = Date.now() - contx.start + contx.delay
            if (checkedTime > contx.player.currentTime + contx.adjustTime || checkedTime < contx.player.currentTime - contx.adjustTime) {
                console.log("ADJUST", checkedTime, contx.currentTime);
                contx.time = checkedTime;
            }
            $("#tempo").html(contx.time);
        }

        clearInterval(this.interval)
        this.interval = window.setInterval(function () {
            checkMaster();
            checkTempo();
        }, this.checkTime);
    }

    checkReady() {
        let p = this
        setTimeout(function () {
            console.log(p.player.readyState);
            if (p.player.readyState == 4 || p.player.readyState == 3 || p.player.readyState == 1) {
                console.log("READY");
                // $("#playBtn").attr("disabled", false)
                console.log("CRISTO", (Date.now() - p.start + p._delay) / 1000);
                p.currentTime = (Date.now() - p.start + p._delay) / 1000
                p.play()
            } else {
                console.log("NOT READY", p.player.readyState);
                p.checkReady();
            }
        }, 1000)
        // console.log(this.player);
        // $(this.player).bind('canplay', function () {
        //     this.currentTime = (Date.now() - p.start + p._delay) / 1000;
        //     p.play()
        // });
    }

    async ping() {
        return new Promise(async (s, e) => {
            //TIMEOUT FETCH
            setTimeout(() =>{
                e("DISCONNESSO");
            }, this.pingTimeout)
            //SUCCESS FETCH
            s(await fetch("/ping", {
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    id: this.id
                })
            }))
        })
    }

    async pingSetup() {
        console.log("PINGING", this.id);
        let res = await this.ping().catch(err=>{
            console.log(err);
            console.log("TIMEOUT DISCONNESSO");
            location.reload();
            return
        })
        res = await res.json()
        if(res.error) {
            console.log("DISCONNESSO");
            location.reload();
            return
        }
        if(res.reassign) {
            console.log("REASSIGNING", res.track);
            //TODO: fade in 5/6 secondi -> 2 out e 4 in
            await this.fadeOut()
            this.track = res.track
            this.fadeIn()
        } else {
            // console.log("reass", res)
        }
        setTimeout(() => {
            // console.log("ping");
            this.pingSetup()
        }, this.pingTime)
    }

}
var s;
var p = new Player();

let tracks = [];

async function setup() {
    console.log("Setup");
    await getAllTracks();
    // await track();
    await startTrack()
    await time();
    // p.play()
    loadOut();
}



function loadOut() {
    $("#loading").fadeOut(100);
}

function loadIn() {
    $("#loading").fadeIn(100);
}

async function time() {
    console.log("getting time");
    // s = Date.now();
    await fetch("/time").then(res => res.json()).then((res) => {
        $("#check").html(res);
        console.log("start", res);
        p.start = res
        // console.log(res);
        // p.time = Date.now() - res
    })
}

async function track() {
    console.log("getting track");
    await fetch("/track").then(res => res.json()).then((res) => {
        console.log("Track: ", res);
        p.track = res
    })
}
async function startTrack() {
    console.log("getting track");
    await fetch("/setup").then(res => res.json()).then((res) => {
        console.log("Track: ", res);
        p.track = res.track
        p.id = res.id
    })
}

async function getAllTracks() {
    await fetch("/all_tracks").then(res => res.json()).then((res) => {
        tracks = res
        res.forEach((t) => {
            let track = document.createElement("option")
            track.value = JSON.stringify(t)
            track.innerHTML = t.title
            $("#track").append(track)
        })
    })
}

function startServer() {
    console.log("starting server");
    fetch("/start").then(res => res.json()).then((res) => {
        if (res == 1) console.log("Server started correctly")
        alert("Server started counting");
    })
}
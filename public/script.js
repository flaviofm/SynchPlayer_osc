
var s;
var p = $("#audio").get(0);
var masterVolume = 0;
var timeout;
var currentSRC = "metronome";
var currentId = 0;

function begin() {
    s = Date.now();
    $.ajax({
        url: "time.php",
        success: function (result) {
            $("#check").html(result);
            start(result);
        }
    });
};

$(document).ready(function () {
    //setMaster();
    //p.addEventListener('canplay', audioLoadedHandler());

    //Set track
    //TODO: auto select per priorità
    // setTrack(getTrack());
    /****************/
    p.pause();
    p.load(); //suspends and restores all audio element

    //audio[0].play(); changed based on Sprachprofi's comment below
    p.oncanplaythrough = function () {
        console.log("CANPLAY through");
        // $("#playBtn").attr("disabled", false)
    };
    p.oncanplay = function () {
        console.log("CANPLAY");
        // $("#playBtn").attr("disabled", false)
    };

    // $(p).on("canplaythrough canplay", ()=>{
    //     console.log("CANPLAY JQUERY");
    //     $("#playBtn").attr("disabled", false)
    // })

    loadOut();
    // //p.addEventListener('canplaythrough', audioLoadedHandler);
    // p.addEventListener('play', audioPlayHandler);
    // p.addEventListener('pause', audioPauseHandler);

    checkReady();

    /*
        if (p.readyState > 3) {
            AudioLoadedHandler();
        }*/

    //function audioLoadedHandler(e) {
    //    $("#playBtn").attr("disabled", false);
    //}

    function audioPlayHandler(e) {
        e.preventDefault();
        begin();
    }

    function audioPauseHandler(e) {
        e.preventDefault();
        stopPlaying();
    }
});

function startServer() {
    $.ajax({
        url: "startTime.php",
        success: function (result) {
            alert("Server started counting");
        }
    });
}

function start(r) {
    console.log("start");
    if (r !== null) {
        var e = Date.now();
        var diff = ((e - s) / 1000);
        $("#date").html(s);
        $("#delay").html(e);
        var x = (parseInt(r) + diff)
        p.currentTime = x;
        //p.volume = 0;
        startPlaying();
        // $("#playOverlay").fadeOut(1000);
        $("#underlay").addClass("active");
        var intervalId = window.setInterval(function () {
            $("#tempo").html(p.currentTime);
        }, 500);
    } else {
        $("#tempo").html("Server is not playing");
    }

}

function startPlaying() {
    console.log("startPlaying");
    $("#audio").prop("muted", false);
    p.play();
    check();
}

function stopPlaying() {
    p.pause();
    clearTimeout(timeout);
    /*
    $.ajax({
        url: "stopTime.php",
        success: function (result) {
            alert("Server stopped counting");
        }
    });
    */
}

function check() {
    console.log("checking...1");

    let startTime = Date.now()
    var m = getMaster(currentId);
    var d = getDelay(currentId);
    /*getMaster(currentSRC).then(function (data) {
        console.log(data);
        m = data;
    });*/
    if (masterVolume !== m && m) {
        setMaster(m, 2000);
        // console.log("setting master: " + m);
    }

    // s = Date.now();
    $.ajax({
        url: "time.php",
        success: function (result) {
            $("#check").html(result + d);
            let processTime = (startTime - Date.now())/1000
            // console.log("TIME", result, p.currentTime);
            adjustTime(result - processTime, d)
            // start(result);
        }
    });

    timeout = setTimeout(check, 3000);
}

function adjustTime(time, delay = 0) {
    if (time + delay > p.currentTime + 3 || time + delay < p.currentTime - 3) {
        console.log("ADJUST", time + delay, p.currentTime);
        animateAudio(0, 1000, ()=>{
            p.currentTime = time + delay;
            animateAudio(100, 1000)
        })
    }
}

function animateAudio(volume, time, callback = ()=>{console.log("END VOLUME ANIMATION")}) {
    $("#audio").animate({
        volume: (volume / 100)
    }, time, callback);
}




function setMaster(m, time) {
    console.log("set audio " + (m));
    if (!time) {
        time = 10000;
        console.log("fade in 10sec");
    }
    if (!m || m < 0 || m > 100) {
        m = 100;
    }
    $("#master").html("master: " + m);
    $("#audio").animate({
        volume: (m / 100)
    }, time);
    masterVolume = m;
}

function getMaster(id) {
    // console.log("getting master", track);
    var res;
    $.ajax({
        url: "getMaster.php",
        type: "POST",
        async: false,
        data: {
            "id": id
        },
        success: function (result) {
            // alert(result);
            // console.log("AJAX RES", result);
            res = parseInt(result);
            // console.log(result);
        }
    });
    return res;
}

function getDelay(id) {
    // console.log("getting master", track);
    var res;
    $.ajax({
        url: "getDelay.php",
        type: "POST",
        async: false,
        data: {
            "id": id
        },
        success: function (result) {
            // alert(result);
            // console.log("AJAX RES", result);
            res = parseInt(result);
            // console.log(result);
        }
    });
    return res;
}


function loadOut() {
    $("#loading").fadeOut(100);
}

function loadIn() {
    $("#loading").fadeIn(100);
}

function getTrack() {
    src = "metronome";
    $.ajax({
        url: "getTrack.php",
        async: false,
        success: function (result) {
            console.log(result);
            src = result;
        }
    });
    return src;
}

function setTrack(data) {
    console.log(data);
    data = $.parseJSON(data)
    console.log(data);
    //p.pause();
    currentSRC = data.src;
    currentId = data.id;
    // alert(data)
    $("#track").val(currentSRC)
    $("#trackH3").html(currentSRC)
    // $("#audio").attr("src", "http://francescoflaviomartinelli.com/SynchServerTime/Tracce/" + currentSRC);
    $("#audio").attr("src", currentSRC);
    var mst = getMaster(currentId);
    setMaster(mst, 2000);
    $("#masterInput").val(getMaster(currentId));
    /*getMaster(currentSRC).then(function (data) {
        setMaster(data, 2000);
    })*/
}

// function setMasterForTrack() {
//     var master = $("#masterInput").val();
//     var track = $("#trackH3").html();
//     console.log(track);
//     $.ajax({
//         type: 'POST',
//         url: "setMaster.php",
//         async: false,
//         data: {
//             "track": track,
//             "master": master
//         },
//         success: function (result) {
//             console.log("master set");
//             console.log(result);
//         }
//     });

// }

let count = 0

function checkReady() {
    setTimeout(function () {
        if (p.readyState == 4 || p.readyState == 3 || p.readyState == 1 || count < Math.ceil(Math.random() * 5)) {
            console.log("READY");
            $("#playBtn").attr("disabled", false)
        } else {
            console.log("NOT READY", p.readyState);
            count++;
            checkReady();
        }
    }, 1000)
}




function determinaPriorita() {
    /*tracce singole

    3/4 importanti

    //tracce singole, volume che cambia superato un certo numero di tracce, a step (da realizzare disattivabile, vediamo se farlo)
    

    //quando
    */
}


/*
Preparare server - tiene online frontend e backend. API per leggere il tempo, scaricare le tracce, gestire master e aggiungere tracce


LISTA MATERIALI
- computer - server/video
- router + antenne direzionali ? (small range)
- 
 */
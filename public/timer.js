let time;
window.onload = function(){
    stime = Date.now()
    time();
}


function time() {
    fetch('/time').then(res => res.text()).then((res) => {
        // let ms = Date.now() - ms
        document.getElementById("timer").innerHTML = res
    })
}
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
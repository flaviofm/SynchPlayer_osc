function uiStart() {
    $("body").css("background", "black");
    $("h2").css("color", "#7FB6C7");
    // $("#setup").css("animation", "none");
    // $("#setup").css("opacity", 0);
    $("#setup").fadeOut();
    setTimeout(()=>{
        $("#cta").addClass("change")
        setTimeout(()=>{
            $("#cta").html("ora sei parte del suono di ánemos");
        }, 1500)
        $("#setup").css("visibility", "hidden")
        $("h1.smoky").addClass("outAnim")
        $(".artists").addClass("outAnim")
    }, 400)
    $("#logo").addClass("outAnim")






}
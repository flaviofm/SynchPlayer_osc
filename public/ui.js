function uiStart() {
    $("body").css("background", "black");
    $("h2").css("color", "#7FB6C7");
    // $("#setup").css("animation", "none");
    // $("#setup").css("opacity", 0);
    $("#setup").fadeOut(500);
    $("#logo").fadeOut(500);
    $(".artists").eq(0).fadeOut(500);
    $("h1.smoky").addClass("outAnim");

    setTimeout(()=>{
        $("#cta").addClass("change")
        setTimeout(()=>{
            $("h1.smoky").fadeOut(0);
            $("#overlay").css("justify")
            $("#cta").html("<span class='afterTxt'>ora</span><br><span class='afterTxt'>sei parte</span><br><span class='afterTxt'> del suono di <i>ánemos</i></span>");
            $("#overlay").css("justify-content", "center")
        }, 1500)
        $("#setup").css("visibility", "hidden")
        // $("#logo").addClass("outAnim")
        // $(".artists").addClass("outAnim")
    }, 800)






}
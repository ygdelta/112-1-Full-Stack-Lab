$(document).ready(function () {
    let main = $("#main");
    console.log("doc ready");
    $.ajax({
        type: "GET",
        url: "template/Gallery.html",
        dataType: "text",
        success: function(response) {
            main.html(response);
        },
        error: function(error) {
            console.log(error);
        }
    });
});
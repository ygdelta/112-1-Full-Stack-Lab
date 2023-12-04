$(document).ready(function () {
    let mainContainer = $("#main");
    console.log("doc ready");
    $.ajax({
        type: "GET",
        url: "template/gallery.html",
        dataType: "text",
        success: function(response) {
            mainContainer.html(response);
        },
        error: function(error) {
            console.log(error);
        }
    });
});
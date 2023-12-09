$(document).ready(function () {
    let content = $("#content");
    let sidebar = $("#sidebar");
    console.log("doc ready");
    $.ajax({
        type: "GET",
        url: "template/Gallery.html",
        dataType: "text",
        success: function(response) {
            content.html(response);
        },
        error: function(error) {
            console.log(error);
        }
    });

    sidebar.hover(function() {
        if(sidebar.data("isOpen")) {
            return;
        }
        ReWriteCss(sidebar, "width", "fit-content");
    }, function() {
        if(sidebar.data("isOpen")) {
            return;
        }
        ReWriteCss(sidebar, "width", "64px");
    });

    // Onclick Events
    // Open sidebar
    $("#sidebar-btn").on("click", function(e){
        if(sidebar.data("isOpen")) {
            sidebar.data("isOpen", false);
            sidebar.addClass("hover:shadow-2xl");
            ReWriteCss(sidebar, "width", "64px");
            ReWriteCss(content, "left", "64px");
            ReWriteCss(content, "width", `${$(window).width() - sidebar.outerWidth()}px`);
        }
        else {
            sidebar.data("isOpen", true);
            sidebar.removeClass("hover:shadow-2xl");
            ReWriteCss(sidebar, "width", "fit-content");
            ReWriteCss(content, "left", `${sidebar.width()}px`);
            ReWriteCss(content, "width", `${$(window).width() - sidebar.outerWidth()}px`);
        }
    });
});

// Funcitons
function ReWriteCss(element, cssStyle, property) {
    element.css(cssStyle, property);
}
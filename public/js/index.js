let content;
let sidebar;

$(document).ready(function () {
    content = $("#content");
    sidebar = $("#sidebar");

    // For Debug
    ShowPage("class");

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

    $("#home-btn").on("click", function(e) {
        ShowPage("home");
    });
});

// Funcitons
function ReWriteCss(element, cssStyle, property) {
    element.css(cssStyle, property);
}

function ShowPage(page) {
    let pages = {
        "home": "template/Gallery.html",
        "class": "template/Class.html"
    }
    $.ajax({
        type: "GET",
        url: pages[page],
        dataType: "text",
        success: function(res) {
            content.html(res);
        },
        error: function(err) {
            alert("Error");
        }
    });
}
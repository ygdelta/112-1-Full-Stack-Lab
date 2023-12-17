const pages = {
    "home": "static/template/gallery.html",
    "class": "static/template/class.html",
    "class/information": "static/template/class_information.html",
    "class/discussion": "static/template/class_discussion.html"
};

const components = {
    "classCard": "static/template/class_card.html",
    "classChapter": "static/template/class_chapter.html",
    "classSection": "static/template/class_sections.html"
};

$(document).ready(function () {
    let content = $("#content");
    let sidebar = $("#sidebar");

    // For Debug
    ShowPage("home");

    sidebar.hover(function() {
        if(sidebar.data("isOpen")) {
            return;
        }
        ReWriteCss(sidebar, "width", "182px");
    }, function() {
        if(sidebar.data("isOpen")) {
            return;
        }
        ReWriteCss(sidebar, "width", "64px");
    });

    // Onclick Events
    // Open sidebar
    $("#btn-login").on("click", function(e) {
        window.location.href = "/login";
    });

    $("#btn-signup").on("click", function(e) {
        window.location.href = "/register";
    });

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

function ShowPage(page, container = $("#content")) {
    console.log(container);
    $.ajax({
        type: "GET",
        url: pages[page],
        dataType: "text",
        success: function(res) {
            container.html(res);
        },
        error: function(err) {
            alert("ShowPage() Error!");
        }
    });
}
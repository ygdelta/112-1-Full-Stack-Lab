const pages = {
    "home": "static/template/gallery.html",
    "class": "static/template/class.html",
    "class/information": "static/template/class_information.html",
    "class/discussion": "static/template/class_discussion.html"
};

const components = {
    "classCard": "static/template/class_card.html",
    "classChapter": "static/template/class_chapter.html",
    "commentCard": "static/template/message_area.html"
};

let userData = {
    name: "testUser",
    type: "student"
};

$(document).ready(function () {
    let content = $("#content");
    let sidebar = $("#sidebar");

    // For Debug
    // ShowPage("home");
    ShowPage("class");

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

function FormatDate(date = new Date()) {
    const year = date.toLocaleString("default", {year: "numeric"});
    const month = date.toLocaleString("default", {month: "2-digit"});
    const day = date.toLocaleString("default", {day: "2-digit"});
    return year + month + day;
    //return [year, month, day].join("-");
}

function SendComment(event) {
    let idElement = $(event.currentTarget).parent().parent().children("p.message-area-id");
    let id = idElement.text();
    let comment = $(event.currentTarget).parent().children("input").val();
    let data = {
        id: id,
        content: {
            user: userData.name,
            comment: comment,
            date: new Date()
        }
    };
    
    var commentTemplate = [
        '<div class="comment flex items-start mt-4">',
            '<img class="w-11 h-11" src="../../img/user.png">',
            '<div class="flex flex-col items-start">',
                '<div class="flex flex-row items-start justify-center h-fit mx-3">',
                    '<p class="text-sm font-bold">${content.user}</p>',
                    '<p class="text-xs text-stone-400 mx-2">${content.date}</p>',
                '</div>',           
                '<p class="text-wrap text-left text-base mx-3">${content.comment}</p>',
            '</div>',
        '</div>'];

    $.ajax({
        type: "POST",
        url: "SendComment",
        data: data,
        dataType: "JSON",
    })
    .then(function(res) {
        /* Wait implementation */
    }, function(err) {
        alert("Error occurred!");
        /* location.reload(); */
        let comment = `<div class="comment flex items-start mt-4">
            <img class="w-11 h-11" src="../../img/user.png">
            <div class="flex flex-col items-start">
                <div class="flex flex-row items-start justify-center h-fit mx-3">
                    <p class="text-sm font-bold">${data.content.user}</p>
                    <p class="text-xs text-stone-400 mx-2">${FormatDate(data.content.date)}</p>
                </div>           
                <p class="text-wrap text-left text-base mx-3">${data.content.comment}</p>
            </div>
        </div>`;
        let comments = $("div.comment");
        if(comments.length != 0)
            $(comments[comments.length - 1]).addClass("hidden");
        $(comment).appendTo(".message-area-main");
    });

    $(event.currentTarget).parent().children("input").val("");
}
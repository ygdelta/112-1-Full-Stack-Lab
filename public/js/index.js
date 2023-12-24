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
    type: "teacher"
};

//<!--html-->
const joinClassTemplate = `
    <div class="flex items-center justify-center w-full f-fit">
        <div class="flex flex-row items-center w-full">
            <input class="text-lg classic-border rounded-md w-full h-fit p-3" type="number" placeholder="請輸入課程代碼"> 
            <button onclick="OnJoinClass(event)" class="text-lg text-white p-2 bg-blue-600 rounded-md w-24 h-fit m-2">新增</button>
        </div>
    </div>
`;
//<!--!html-->

//<!--html-->
const createClassTemplate = `
    <div class="flex items-center justify-center w-full f-fit">
        <div class="flex flex-row items-center w-full">
            <input class="text-lg classic-border rounded-md w-full h-fit p-3" type="number" placeholder="請輸入課程名稱"> 
            <button onclick="OnCreateClass(event)" class="text-lg text-white p-2 bg-blue-600 rounded-md w-24 h-fit m-2">建立</button>
        </div>
    </div>
`;
//<!--!html-->

//<!--html-->
const createChapterTemplate = `
    <div class="flex items-center justify-center w-full f-fit">
        <div class="flex flex-row items-center w-full">
            <input class="text-lg classic-border rounded-md w-full h-fit p-3" type="text" placeholder="請輸入章節名稱"> 
            <button onclick="OnCreateChapter(event)" class="text-lg text-white p-2 bg-blue-600 rounded-md w-24 h-fit m-2">建立</button>
        </div>
    </div>
`;
//<!--!html-->

//<!--html-->
const createSectionTemplate = `
    <div class="flex flex-col items-center justify-center w-full f-fit">
        <input class="text-lg classic-border rounded-md w-full h-fit mb-2 p-3" type="text" placeholder="請輸入小節名稱"> 
        <input class="text-lg classic-border rounded-md w-full h-fit mb-2 p-3" type="text" placeholder="請輸入Youtube影片網址"> 
        <button onclick="OnCreateSection(event)" class="text-lg classic-border rounded-md w-full h-fit">新增</button>
    </div>
`;
//<!--!html-->

$(document).ready(function () {
    $("#class-id").text("");
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

    $("#user-name").text(userData.name);

    // Onclick Events
    // Open sidebar
    $("#btn-logout").on("click", function(e) {
        window.location.href = "/login";
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
        $("#class-id").text("");
        ShowPage("home");
    });

    $()
});

// Funcitons
function GetIDfromURL(url) {
    const regExp = 
      /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/|shorts\/|live\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[1].length === 11)
      return match[1];
    return '';
}

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
    /* Initiallize here */
    let id = $(event.currentTarget).parent().siblings("p.message-area-id").text();
    let comment = $(event.currentTarget).next("input").val();
    let prevComment = $(event.currentTarget).parent().prev();
    let btnNumOfComments = $(event.currentTarget).parent().siblings("p[data-isopened]");
    let NumOfComments = parseInt(btnNumOfComments.text().replace(/[^0-9]/g,""));

    if(comment == "") {
        alert("請輸入留言內容");
        return;
    }

    let data = {
        id: id,
        content: {
            user: userData.name,
            comment: comment,
            date: new Date()
        }
    };
    
    let commentTemplate = [
        '<div class="comment flex items-start mt-4">',
            '<img class="w-11 h-11" src="../../img/user.png">',
            '<div class="flex flex-col items-start">',
                '<div class="flex flex-row items-start justify-center h-fit mx-3">',
                    '<p class="text-sm font-bold">${user}</p>',
                    '<p class="text-xs text-stone-400 mx-2">${FormatDate(date)}</p>',
                '</div>',           
                '<p class="text-wrap text-left text-base mx-3">${comment}</p>',
            '</div>',
        '</div>'];
    
    /* Send comment data */
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
        $.tmpl(commentTemplate.join(""), data.content).insertAfter(prevComment);
        if(prevComment.hasClass("comment")) {
            prevComment.removeClass("hidden");
            prevComment.addClass("hidden");
        }
        btnNumOfComments.text(`${NumOfComments + 1}則留言`);
    });

    $(event.currentTarget).next("input").val("");
}

function ShowModal(setting = {
    title: "Title",
    content: "Content",
}) {
    let body = $("body");

    //<!--html-->
    let modal = `
    <div id="modal" class="fixed top-0 left-0 z-[49]">
        <div onclick="CloseModal()" class="fixed top-0 left-0 bg-gray-800 opacity-50 w-screen h-screen z-[49]"></div>
        <div class="flex flex-col fixed top-[calc(50%-150px)] left-[calc(50%-250px)] bg-stone-50 classic-border rounded-md w-[500px] h-[300px] z-50">
            <div class="font-semibold text-3xl border-solid border-b border-stone-300 w-full h-fit p-3">${setting.title}</div>
            <div class="flex w-full h-full px-2 pb-3">${setting.content}</div>
        </div>
    </div>
    `;
    //<!--!html-->
    $.tmpl(modal, {}).appendTo(body);
}

function CloseModal() {
    $("#modal").remove();
}

function OnJoinClass(e) {
    let input = $(e.currentTarget).prev().val();
    $.ajax({
        type: "POST",
        url: "joinClass",
        data: {id: input},
        dataType: "JSON"
    })
    .then(function(res) {
        // Do something.
        CloseModal();
    }, function(err) {
        alert("加入課程發生錯誤");

    });
}

function OnCreateClass(e) {
    let input = $(e.currentTarget).prev().val();
    $.ajax({
        type: "POST",
        url: "createClass",
        data: {className: input},
        dataType: "JSON",
    })
    .then(function(res) {
        // Do something.
        CloseModal();
    }, function(err) {
        alert("建立課程發生錯誤");
    });
}

function OnCreateChapter(e) {
    let chapterName = $(e.currentTarget).prev().val();
    if(chapterName == "") {
        alert("請輸入章節名稱");
        return;
    }

    $.ajax({
        type: "POST",
        url: "CreateChapter",
        data: {name: chapterName},
        dataType: "dataType",
    })
    .then(function(res) {
        //<!--html-->
        let chapterTitle = `
        <div class="flex flex-col w-full">
            <div class="flex justify-between items-center border-solid border-blue-600 border-b w-full p-3">
                <p class="hidden">${id}</p>
                <div class="text-left text-3xl text-blue-600">${chapterName}</div>
                <div class="edit-nav flex h-fit w-fit">
                    <svg onclick="ShowModal({title: '新增小節', content: createSectionTemplate})" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="inline-block rounded-full w-6 h-6 hover:cursor-pointer hover:bg-stone-300">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    <div class="w-1 mx-2"></div>
                    <svg onclick="OnDeleteChapter(event)" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="inline-block rounded-full w-6 h-6 hover:cursor-pointer hover:bg-stone-300">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                </div>
            </div>
        </div>
        `;    
        //<!--!html-->

        $.tmpl(chapterTitle, res.data).insertBefore("#btn-add-chapter");
        CloseModal();
    }, function(err) {
        //<!--html-->
        let chapterTitle = `
        <div class="flex flex-col w-full">
            <div class="flex justify-between items-center border-solid border-blue-600 border-b w-full p-3">
                <p class="hidden">testId</p>
                <div class="text-left text-3xl text-blue-600">${chapterName}</div>
                <div class="edit-nav flex h-fit w-fit">
                    <svg onclick="ShowModal({title: '新增小節', content: createSectionTemplate})" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="inline-block rounded-full w-6 h-6 hover:cursor-pointer hover:bg-stone-300">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    <div class="w-1 mx-2"></div>
                    <svg onclick="OnDeleteChapter(event)" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="inline-block rounded-full w-6 h-6 hover:cursor-pointer hover:bg-stone-300">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                </div>
            </div>
        </div>
        `;    
        //<!--!html-->

        $.tmpl(chapterTitle, {}).insertBefore("#btn-add-chapter");
        CloseModal();
    });
}

function OnCreateSection(e) {
    let sectionName = $(e.currentTarget).prev().prev().val();
    let videoId = GetIDfromURL($(e.currentTarget).prev().val());
    if(sectionName == "") {
        alert("請輸入小節名稱");
        return;
    }
    if(videoId == "") {
        alert("影片URL有誤");
        return;
    }
    $.ajax({
        type: "POST",
        url: "CreateSection",
        data: {
            name: sectionName,
            videoId: videoId
        },
        dataType: "JSON",
    })
    .then(function(res) {
        ShowPage("class/information", $("#class-content"));
        CloseModal();
    }, function(err) {
        alert("新增小節發生錯誤");
        ShowPage("class/information", $("#class-content"));
        CloseModal();
    });
}

function OnDeleteChapter(e) {
    let chapterIdDom = $(e.currentTarget).parent().prev().prev();
    $.ajax({
        type: "POST",
        url: "DeleteChapter",
        data: {id: chapterIdDom.text()},
        dataType: "JSON",
        success: function(res) {
            chapterIdDom.parent().parent().remove();
        },
        error: function(err) {
            alert("刪除章節發生錯誤");
            chapterIdDom.parent().parent().remove();
        }
    });
}

function OnDeleteSection(e) {
    let SectionIdDom = $(e.currentTarget).parent().prev();
    $.ajax({
        type: "POST",
        url: "DeleteChapter",
        data: {id: SectionIdDom.text()},
        dataType: "JSON",
        success: function(res) {
            SectionIdDom.parent().remove();
        },
        error: function(err) {
            alert("刪除章節發生錯誤");
            SectionIdDom.parent().remove();
        }
    });
}
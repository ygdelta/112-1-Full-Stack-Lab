$(function () {
    // Initiallize user data.
    Initiallize();

    $("#class-id").text("");
    let content = $("#content");
    let sidebar = $("#sidebar");

    ShowPage("home");
    
    sidebar
        .on('mouseover', function() {
            if(sidebar.data("isOpen")) {
                return;
            }
            ReWriteCss(sidebar, "width", "182px");
        })
        .on('mouseout', function() {
            if(sidebar.data("isOpen")) {
                return;
            }
            ReWriteCss(sidebar, "width", "64px");
        });

    $("#user-name").text(userData.Name);

    // Onclick Events
    $("#btn-logout").on("click", function(e) {
        userData.ID = "";
        userData.Name = "";
        userData.Role = "";
        $.removeCookie("userData");
        window.location.href = "/login";
    });
    
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
        $("#class-id").text("");
        ShowPage("home");
    });

});

// Funcitons
function SendComment(event) {
    /* Initiallize here */
    let id = $(event.currentTarget).parent().siblings("p.message-area-id").text();
    let comment = $(event.currentTarget).next("input").val();
    let prevComment = $(event.currentTarget).parent().prev();
    let btnNumOfComments = $(event.currentTarget).parent().siblings("p[data-isopened]");
    let NumOfComments = parseInt(btnNumOfComments.text().replace(/[^0-9]/g,""));
    let isOpen = $('p[onclick="expandComment(event)"]').data('isopened');
    if(comment == "") {
        alert("請輸入留言內容");
        return;
    }

    let data = {
        Context: comment,
        Date: new Date(),
        PublisherName: userData.Name,
        DiscussID: id,
    };
    
    let commentTemplate = [
        '<div class="comment flex items-start mt-4">',
            '<img class="w-11 h-11" src="../../img/user.png">',
            '<div class="flex flex-col items-start">',
                '<div class="flex flex-row items-start justify-center h-fit mx-3">',
                    '<p class="text-sm font-bold">${PublisherName}</p>',
                    '<p class="text-xs text-stone-400 mx-2">${FormatDate(Date)}</p>',
                '</div>',           
                '<p class="text-wrap text-left text-base mx-3">${Context}</p>',
            '</div>',
        '</div>'];
    
    /* Send comment data */
    $.ajax({
        type: "POST",
        url: "/CreateComment",
        data: data,
        dataType: "JSON",
    })
    .then(function(res) {
        /* Wait implementation */
        if( res.status == true ) {
            $.tmpl(commentTemplate.join(""), data).insertAfter(prevComment);
            if( !isOpen ) {
                if(prevComment.hasClass("comment")) {
                    prevComment.removeClass("hidden");
                    prevComment.addClass("hidden");
                }
            }
            btnNumOfComments.text(`${NumOfComments + 1}則留言`);
        }
        else if( res.status == false ) {
            alert("留言發生錯誤");
            console.log(res);
        }
    }, function(err) {
        alert("留言發生錯誤");
        console.log(err);
    });
    $(event.currentTarget).next("input").val("");
}

function JoinClass(e) {
    let input = $(e.currentTarget).prev().val();
    if(userData.Role != "Student") {
        console.log("發生錯誤");
        return;
    }
    let payload = {
        UserID: userData.ID,
        ClassID: input
    };
    $.ajax({
        type: "POST",
        url: "/StudentJoinClass",
        data: payload,
        dataType: "JSON"
    })
    .then(function(res) {
        if(res.status == true) 
            $.ajax({
                type: "GET",
                url: components["classCard"],
                dataType: "text"
            })
            .then(function(template) {
                $.tmpl(template, res.data).appendTo("#gallery-main");
            }, function(err) {
                console.log(err);
            });
        else 
            alert("加入課程發生錯誤");
        CloseModal();
    }, function(err) {
        alert("加入課程發生錯誤");
        console.log(err);
        CloseModal();
    });
}

function CreateClass(e) {
    let input = $(e.currentTarget).prev().val();
    if(userData.Role != "Teacher") {
        console.log("發生錯誤");
        return;
    }
    let payload = {
        TeacherID: userData.ID,
        ClassName: input
    }
    $.ajax({
        type: "POST",
        url: "/TeacherCreateClass",
        data: payload,
        dataType: "JSON",
    })
    .then(function(res) {
        if(res.status == true) 
            $.ajax({
                type: "GET",
                url: components["classCard"],
                dataType: "text"
            })
            .then(function(template) {
                $.tmpl(template, res.data).appendTo("#gallery-main");
            }, function(err) {
                console.log(err);
            });
        else 
            alert("建立課程發生錯誤");
        CloseModal();
    }, function(err) {
        alert("建立課程發生錯誤");
        console.log(err);
    });
}

function CreateChapter(e) {
    let chapterName = $(e.currentTarget).prev().val();
    let classId = $("#class-id").text();
    if(chapterName == "") {
        alert("請輸入章節名稱");
        return;
    }

    $.ajax({
        type: "POST",
        url: "/TeacherCreateChapter",
        data: {
            ChapterName: chapterName, 
            ClassID: classId
        },
        dataType: "JSON",
    })
    .then(function(res) {
        if( res.status == true ) {
            //<!--html-->
            let chapterTitle = `
            <div class="flex flex-col w-full">
                <div class="flex justify-between items-center border-solid border-blue-600 border-b w-full p-3">
                    <p class="hidden">${res.data.ID}</p>
                    <div class="text-left text-3xl text-blue-600">${res.data.Name}</div>
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
        }
        else if( res.status == false ) {
            alert("建立章節發生錯誤");
            CloseModal();
            console.log(res);
        }
    }, function(err) {
        alert("建立章節發生錯誤");
        console.log(err);
        CloseModal();
    });
}

function CreateSection(e) {
    let chapterID = $(e.currentTarget).prev().prev().prev().text();
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
        url: "/TeacherCreateSection",
        data: {
            ChapterID: chapterID,
            SectionName: sectionName,
            VideoID: videoId
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

function DeleteChapter(e) {
    let chapterIdDom = $(e.currentTarget).parent().prev().prev();
    let classId = $("#class-id").text();
    if( !confirm("是否要刪除此章節") )
        return;
    $.ajax({
        type: "POST",
        url: "/TeacherDeleteChapter",
        data: { 
            ChapterID: parseInt(chapterIdDom.text()), 
            ClassID: parseInt(classId)
        },
        dataType: "JSON",
        success: function(res) {
            if( res.status ) {
                alert("刪除成功");
                chapterIdDom.parent().parent().remove();
            }
            else if( res.status == false ) {
                alert("刪除章節發生錯誤");
                console.log(res);
            }
        },
        error: function(err) {
            alert("刪除章節發生錯誤");
            console.log(err);
        }
    });
}

function DeleteSection(e) {
    let sectionIdDom = $(e.currentTarget).parent().prev();
    let chapterIdDom = $(e.currentTarget).parent().parent()
                            .parent().prev().children("p");
    if( !confirm("是否要刪除小節") )
        return;
    $.ajax({
        type: "POST",
        url: "/TeacherDeleteSection",
        data: {
            ChapterID: parseInt(chapterIdDom.text()),
            SectionID: parseInt(sectionIdDom.text())
        },
        dataType: "JSON",
        success: function(res) {
            if( res.status == true ) {
                alert("刪除成功");
                sectionIdDom.parent().remove();
            }
            else if( res.status == false ) {
                alert("刪除小節發生錯誤");
                console.log(res);
            }
        },
        error: function(err) {
            alert("刪除小節發生錯誤");
            console.log(err);
        }
    });
}

function Initiallize() {
    let cookieData = $.cookie("userData");
    if(typeof cookieData == "undefined") {
        alert("請先進行登入");
        window.location.href = "/login";
    }
    let parseData = parseJwt(cookieData);
    userData.ID = parseData.ID;
    userData.Name = parseData.Name;
    userData.Role = parseData.Role;
}

function DeleteClass(e) {
    let idDom = $(e.currentTarget)
                    .parent()
                    .prev()
                    .children("p");
    let id = idDom.text();
    let payload = {
        UserID: userData.ID,
        ClassID: id
    };
    if(userData.Role == "Student") {
        $.ajax({
            type: "POST",
            url: "/StudentExitClass",
            data: payload,
            dataType: "JSON",
        })
        .then(function(res) {
            if(res.status == true) {
                alert("刪除成功");
                idDom.parent().parent().remove();
            }
            else {
                alert(res.error);
            }
        }, function(err) {
            alert(err);
        });
    }
    else if(userData.Role == "Teacher") {
        $.ajax({
            type: "POST",
            url: "/TeacherDeleteClass",
            data: payload,
            dataType: "JSON",
        })
        .then(function(res) {
            if(res.status == true) {
                alert("刪除成功");
                idDom.parent().parent().remove();
            }
            else {
                alert(res.error);
            }
        }, function(err) {
            alert(err);
        });
    }
}

function OnClickCard(e) {
    let id = $(e.currentTarget).find("p#id");
    $("#class-id").text(id.text());
    ShowPage("class");
}

function OnClickCreateSection(e) {
    let chapterID = $(e.currentTarget).parent().prev().prev().text();
    console.log(chapterID);
    //<!--html-->
    const createSectionTemplate = `
    <div class="flex flex-col items-center justify-center w-full f-fit">
            <p class="hidden">${chapterID}</p>
            <input class="text-lg classic-border rounded-md w-full h-fit mb-2 p-3" type="text" placeholder="請輸入小節名稱"> 
            <input class="text-lg classic-border rounded-md w-full h-fit mb-2 p-3" type="text" placeholder="請輸入Youtube影片網址"> 
            <button onclick="CreateSection(event)" class="text-lg classic-border rounded-md w-full h-fit">新增</button>
    </div>
    `;
    //<!--!html-->
    ShowModal({ title: "新增小節", content: createSectionTemplate });
}

function expandComment(event) {
    let btnExpand = $(event.currentTarget);
    let comments = btnExpand.parent().children("div.comment");
    let isOpened =  btnExpand.data("isopened");
    if(isOpened === "true") {
        for(let i = 0; i < comments.length - 1; i++) {
            $(comments[i]).addClass("hidden");
        }
        btnExpand.data("isopened", "false");
    }
    else {
        comments.removeClass("hidden");
        btnExpand.data("isopened", "true");
    }
}

function OnClickEditClass(e) {
    let classId = $(e.currentTarget).parent().prev().children("p").text();
    const editClassTemplate = `
    <div class="flex flex-col items-center justify-center w-full f-fit">
        <p class="hidden">${classId}</p>
        <input class="text-lg classic-border rounded-md w-full h-fit p-3" type="text" placeholder="請輸入章節名稱"> 
        <button onclick="EditClass(event)" class="text-lg text-white p-2 bg-blue-600 rounded-md w-24 h-fit m-2">修改</button>
    </div>
    `;
    ShowModal({ title: "修改課程名稱", content: editClassTemplate });
}

function EditClass(e) {
    let classId = parseInt(GetPrevDom($(e.currentTarget), 2).text());
    let newClassName = $(e.currentTarget).prev().prev().text();
    $.ajax({
        type: "POST",
        url: "urlHere",
        data: { ClassID: classId, Name: newClassName },
        dataType: "JSON",
    })
    .then(function(res) {
        if( res.status == true ) {

        }
        else if( res.status == false ) {
            alert("修改課程名稱發生錯誤");
            console.log(res);
        }
    }, function(err) {
        alert("修改課程名稱發生錯誤");
        console.log(err);
    });
}
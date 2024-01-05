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
    if( page == 'home' ) {
        $('#class-id').text('');
        $('p.class-name').text('');
    }
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

function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}

function GetPrevDom(jqObj, num) {
    let result;
    for(let i = 0; i < num; i++) {
        result = jqObj.prev();
    }
    return result;
}
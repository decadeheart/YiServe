var status = new URL(window.location.href).searchParams.get('status');
var page = 1;
var loading = false;
var hasMore = true;
var orderList = [];
var selectedArea = '';

$(document).ready(function () {   
    setListener();
    loadData();
    setTitle(status);
    // console.log($("#selected-area").val())
    // $("#selected-area").change(function(){
    //     var selectedArea=$("#selected-area").val();
    //     console.log(selectedArea)
    //     console.log(1)
    //     loadData();
    // });   
});

function setTitle(status) {
    var title = $('.title span');
    if (status === '30') {
        title.html("工单作业-待接单");
        

    } else if (status === '40') {
        title.html("工单作业-处理中");

    } else if (status === '50') {
        title.html("工单作业-已回复");
    } else {
        title.html("???");
    }
}

function setListener() {
}

function loadData() {
    loading = true;
    loadDataWith(status, page);
    page++;
}

function loadDataWith(status, page) {
    console.log('loading page: ' + page);
    var user_id = localStorage.getItem('user_id');
    var token = localStorage.getItem('token');
    $.post(
        "http://120.27.27.42:8080/AndroidApp/getSelectedOrdersOverviewInfo",
        {
            work_order_status: status,
            user_id: user_id,
            token: token,
            page: page,
            selectedArea: selectedArea,
        },
        function (data, status) {
            loading = false;

            console.log(data);
            console.log(status);
            if (status === 'success' && data.result === 0) {
                data.data.forEach(function (value) {
                    var remain = Math.floor(value.deadline - new Date().getTime() / 1000);
                    value.deadline = secToTime(remain);
                });
                orderList.push(data.data);
                appendOrders({orders: data.data});
                var data_areas=data.areas;
                console.log(data.areas);
                appendAreas({areas: data_areas});
                if (data.data.length < data.num) {
                    hasMore = false;
                }
            } else if (data.result === 101) {
                logout();
                location.href = 'index.html';
                alert(data.text);
            } else if (data.text) {
                alert(data.text);
            } else {
                alert("工单信息获取失败");
            }
        },
        'json'
    );
}
function change(){
    var selectedArea=$("#selected-area").val();
    console.log(selectedArea)
    console.log(1)
    loadData();   
}
var optionHeader =
"    <div id=\"selected-area\">\n" +
"<div>\n"
"       <a>\n "+
"           全部\n" +
"       </a>\n"+
"</div>\n"
"{{#areas}}\n" + 
"<div>\n"
"       <a href=\"www.baidu.com\">" +
"       {{.}}"+
"       </a>\n"+
"</div>\n"
"{{/areas}}\n" +
"    </div>" 
var itemsTemplate =
    "{{#orders}}\n" +
    "<a class=\"list-group-item list-group-item-action\" href=\"order-detail.html?id={{work_order_id}}&time={{creat_time}}&status=" + status + "\">\n" +
    "    <table>\n" +
    "        <tr>\n" +
    "            <td class=\"info-title\">工单编号：</td>\n" +
    "            <td>{{work_order_id}}</td>\n" +
    "        </tr>\n" +
    "        <tr>\n" +
    "            <td class=\"info-title\">发起时间：</td>\n" +
    "            <td>{{creat_time}}</td>\n" +
    "        </tr>\n" +
    "        <tr>\n" +
    "            <td class=\"info-title\">类型：</td>\n" +
    "            <td>{{work_order_type}}</td>\n" +
    "        </tr>\n" +
    "        <tr>\n" +
    "            <td class=\"info-title\">地区：</td>\n" +
    "            <td>{{order_area}}</td>\n" +
    "        </tr>\n" +
    "        <tr>\n" +
    "            <td class=\"info-title\">剩余时间：</td>\n" +
    "            <td>{{deadline}}</td>\n" +
    "        </tr>\n" +
    "    </table>\n" +
    "</a>\n" +
    "{{/orders}}";

function appendOrders(orders) {
    var output = Mustache.render(itemsTemplate, orders);
    $('.list-group').append(output);
}
function appendAreas(areas){
    var output = Mustache.render(optionHeader, areas);
    console.log(areas)
    $('.option-header').append(output);
}

function secToTime(time) {
    var timeStr = null;
    var hour = 0;
    var minute = 0;
    var second = 0;
    if (time <= 0)
        return "00:00:00";
    else {
        minute = Math.floor(time / 60);
        if (minute < 60) {
            second = time % 60;
            timeStr = "00:" + unitFormat(minute) + ":" + unitFormat(second);
        } else {
            hour = Math.floor(minute / 60);
            if (hour > 99)
                return "99:59:59";
            minute = minute % 60;
            second = time - hour * 3600 - minute * 60;
            timeStr = unitFormat(hour) + ":" + unitFormat(minute) + ":" + unitFormat(second);
        }
    }
    return timeStr;
}

function unitFormat(i) {
    var retStr = null;
    if (i >= 0 && i < 10)
        retStr = "0" + i;
    else
        retStr = "" + i;
    return retStr;
}

// 加载更多
$(window).scroll(function () {
    if (loading || !hasMore) {
        return;
    }

    if ($(document).height() - $(this).scrollTop() - $(this).height() < 100) {
        loadData();
    }
});

function onBackButtonClick() {
    if (document.referrer.indexOf('home.html') >= 0) {
        history.back();
    } else {
        location.href = "home.html";
    }
}

function logout() {
    localStorage.removeItem('autoLogin');
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_info');
}


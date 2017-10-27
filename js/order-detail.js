var id = new URL(window.location.href).searchParams.get('id');
var status = new URL(window.location.href).searchParams.get('status');
var orderDetails;

$(document).ready(function () {
    initView();
    loadData();
    $('#button_accept_order').click(function () {
        if (confirm("确认接单？")) {
            acceptOrder();
        }
    });
    $('#button_deal_order').click(function () {
        dealOrder();
    });
});

function initView() {
    var title = $('.title span');
    if (status === '30') {
        title.html("新工单详情");
    } else if (status === '40') {
        title.html("处理中工单详情");
    } else if (status === '50') {
        title.html("已回复工单详情");
    } else {
        title.html("???");
    }

    $('#button_accept_order').css('display', status === '30' ? 'block' : 'none');
    $('#button_deal_order').css('display', status === '40' ? 'block' : 'none');

    var testResult = JSON.parse(localStorage.getItem('test_result_' + id));
    if (status === '40' && testResult && testResult.save_time) {
        var saveDate = new Date(testResult.save_time);
        var formattedDate = saveDate.format('yyyy-MM-dd hh:mm');
        $('#test_result').html(formattedDate + " 现场测试详情");
        $('#test_result').attr('href', 'test-result.html?id=' + id + '&from_cache=1');
    } else if (status === '50') {
        $('#test_result').html('<a id="anchor_test_result" href="javascript:void(0)" onclick="checkoutTestResult()">点击查看测试结果</a>');
    } else {
        $('#test_result_area').css('display', 'none');
    }

    $('#reached_area').css('display', status === '50' ? 'table-row' : 'none');
}

function checkoutTestResult() {
    localStorage.setItem('order_details', JSON.stringify(orderDetails));
    location.href = 'test-result.html?preview_only=true&id=' + id;
}

function loadData() {
    var url = status == '50'
        ? "http://120.27.27.42:8080/AndroidApp/getCompletedOrdersDetails"
        : "http://120.27.27.42:8080/AndroidApp/getSelectedOrdersDetailsInfo";
    console.log(url);

    $.post(
        url,
        {work_order_id: id},
        function (data, status) {
            console.log(data);
            console.log(status);
            if (status === 'success' && data.result === 0) {
                orderDetails = data.data;
                renderData(data.data);
            } else if (data.result === 101) {
                logout();
                location.href = 'index.html';
                alert(data.text);
            } else if (data.text) {
                alert(data.text);
            } else {
                alert("无法获取工单详情");
            }
        },
        'json'
    );
}

function renderData(data) {
    data = pretreatData(data);
    renderInnerHtml($('#content_table'), data);
}

function pretreatData(data) {
    if (data.remaining_time) {
        var remain = parseInt(data.remaining_time) - Math.round(+new Date().getTime() / 1000);
        remain = remain < 0 ? 0 : remain;
        data.remaining_time_format = secToTime(remain);
    }

    if (data.is_reached) {
        data.is_reached = "是";
    } else {
        data.is_reached = "否";
    }

    return data;
}

function acceptOrder() {
    // Get phone number first
    NativeApi.getPhoneNumber("onPhoneNumberGot");
}

function onPhoneNumberGot(phoneNumber) {
    var userId = localStorage.getItem('user_id');
    var token = localStorage.getItem('token');
    $.post(
        "http://120.27.27.42:8080/AndroidApp/changeOrderStatus",
        {
            work_order_id: id,
            user_id: userId,
            token: token,
            telephone: phoneNumber,
            handle_action: 3040
        },
        function (data, status) {
            console.log(data);
            console.log(status);
            if (status === 'success' && data.result === 0) {
                if (confirm("要跳转到待处理工单详情吗？")) {
                    location.href = 'order-detail.html?id=' + id + '&status=' + 40;
                } else {
                    history.back();
                }
            } else if (data.result === 101) {
                logout();
                location.href = 'index.html';
                alert(data.text);
            } else if (data.text) {
                alert(data.text);
            } else {
                alert("接单失败");
            }
        },
        'json'
    );
}

function dealOrder() {
    localStorage.setItem('order_details', JSON.stringify(orderDetails));
    location.href = 'location-confirm.html?id=' + id;
}

function getPreDealInfo() {
    $.get(
        "http://120.27.27.42:8080/AndroidApp/getPreDealResults?work_order_id=" + id,
        function (data, status) {
            console.log(data);
            console.log(status);
            if (status === 'success' && data.result === 0) {
                localStorage.setItem('pre_deal_detail', JSON.stringify(data));
                location.href = 'pretreat-detail.html';
            } else if (data.text) {
                alert(data.text);
            } else {
                alert("查询预处理信息失败");
            }
        },
        'json'
    );
}

function onBackButtonClick() {
    if (document.referrer.indexOf('order-list.html') >= 0) {
        history.back();
    } else {
        location.href = "order-list.html?status=" + status;
    }
}

Date.prototype.format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1,                 //月份
        "d+": this.getDate(),                    //日
        "h+": this.getHours(),                   //小时
        "m+": this.getMinutes(),                 //分
        "s+": this.getSeconds(),                 //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds()             //毫秒
    };
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        }
    }
    return fmt;
};

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

function logout() {
    localStorage.removeItem('autoLogin');
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_info');
}
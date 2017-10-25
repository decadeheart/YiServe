var id = new URL(window.location.href).searchParams.get('id');
var orderDetails = JSON.parse(localStorage.getItem('order_details'));

var testing = false;
var shouldStop = false;
var results = [];

$(document).ready(function () {
    $('.button-right').css('display', id ? 'inline-block' : 'none');

    $('#button-start').click(function () {
        if (!testing) {
            $('#tbody-ping-result').html("");
            results = [];
            testing = true;
            shouldStop = false;
            $('#button-start').html('停止');

            ping();
        } else {
            shouldStop = true;
            testing = false;
            $('#button-start').html('开始');
        }
    });
});

function ping() {
    if (shouldStop) {
        return;
    }
    var url = $("#select-websites").find("option:selected").text();
    NativeApi.ping(url, 10 * 1000, "pingCallback");
}

var template = "<tr>" + "\n" +
    "<td>{{number}}</td>" + "\n" +
    "<td>{{startTime}}</td>" + "\n" +
    "<td>{{status}}</td>" + "\n" +
    "<td>{{delay}}</td>" + "\n" +
    "</tr>";

function pingCallback(delay) {
    var data = {
        number: results.length + 1,
        startTime: new Date().format("hh:mm:ss.S"),
        status: delay === -1 ? "失败" : "成功",
        delay: delay === -1 ? "N/A" : delay
    };
    results.push(data);

    var item = Mustache.render(template, data);
    $('#tbody-ping-result').append(item);
    updateResultInfo();

    if (results.length < 10) {
        ping();
    } else {
        testing = false;
        $('#button-start').html('开始');
    }
}

function updateResultInfo() {
    $('#result-times').html(results.length);

    var connected = 0;
    var totalDelay = 0;
    results.forEach(function (item) {
        if (item.delay !== "N/A") {
            connected++;
            totalDelay += item.delay;
        }
    });

    $('#result-percentage-connected').html((connected / results.length * 100).toFixed(2));
    $('#result-average-delay').html((totalDelay / results.length).toFixed(2));
}

function onRightButtonClick() {
    var connected = 0;
    var totalDelay = 0;
    results.forEach(function (item) {
        if (item.delay !== "N/A") {
            connected++;
            totalDelay += item.delay;
        }
    });
    var connectionAverage = (connected / results.length * 100).toFixed(2);
    var delayAverage = (totalDelay / results.length).toFixed(2);
    delayAverage = delayAverage < 0 ? 0.0 : delayAverage;

    orderDetails.network_test1 = isNaN(connectionAverage) ? null : connectionAverage;
    orderDetails.network_test2 = isNaN(delayAverage) ? null : delayAverage;
    localStorage.setItem('order_details', JSON.stringify(orderDetails));

    location.href = 'test-result.html?id=' + id;
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
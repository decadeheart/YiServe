var id = new URL(window.location.href).searchParams.get('id');
var orderDetails = JSON.parse(localStorage.getItem('order_details'));

var results = [];

$(document).ready(function () {
    $('#button-start').click(function () {
        NativeApi.makePhoneCall("10000", 'phoneCallCallback');
    });
});

var template = "<tr>" + "\n" +
    "<td>{{number}}</td>" + "\n" +
    "<td>{{startTime}}</td>" + "\n" +
    "<td>{{status}}</td>" + "\n" +
    "<td>{{duration}}</td>" + "\n" +
    "</tr>";

function phoneCallCallback(success, duration) {
    var data = {
        number: results.length + 1,
        startTime: new Date().format("hh:mm:ss"),
        status: success ? "成功" : "失败",
        duration: duration === 0 ? "N/A" : duration / 1000
    };
    results.push(data);

    var item = Mustache.render(template, data);
    $('#tbody-test-result').append(item);
    updateResultInfo();
}

function updateResultInfo() {
    $('#result-times').html(results.length);

    var connected = 0;
    var totalDuration = 0;
    results.forEach(function (item) {
        if (item.duration !== "N/A") {
            connected++;
            totalDuration += item.duration;
        }
    });

    $('#result-percentage-connected').html((connected / results.length * 100).toFixed(2));
    $('#result-average-duration').html((totalDuration / results.length).toFixed(2));
}

function onRightButtonClick() {
    var connected = 0;
    var totalDuration = 0;
    results.forEach(function (item) {
        if (item.duration !== "N/A") {
            connected++;
            totalDuration += item.duration;
        }
    });
    var connectionAverage = (connected / results.length * 100).toFixed(2);
    var durationAverage = (totalDuration / results.length).toFixed(2);
    durationAverage = durationAverage < 0 ? 0.0 : durationAverage;

    orderDetails.network_test1 = isNaN(connectionAverage) ? null : connectionAverage;
    orderDetails.network_test2 = isNaN(durationAverage) ? null : durationAverage;
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
var id = new URL(window.location.href).searchParams.get('id');
var fromCache = new URL(window.location.href).searchParams.get('from_cache');
var previewOnly = new URL(window.location.href).searchParams.get('preview_only');
var orderDetails = JSON.parse(localStorage.getItem('order_details'));

$(document).ready(function () {
    if (fromCache) {
        orderDetails = JSON.parse(localStorage.getItem('test_result_' + id));
    }

    bindData();

    $('#button-save').click(function () {
        saveTestResult();
    });

    $('#button-submit').click(function () {
        submitTestResult();
    });

    if (previewOnly) {
        $('#input-solution').attr('disabled', 'true');
        $('#input-cause').attr('disabled', 'true');
        $('#input-time-expect').attr('disabled', 'true');
        $('#input-note').attr('disabled', 'true');
        $('.div-action').css('display', 'none');
    }
});

function bindData() {
    console.log(orderDetails);
    $('#order-type').html(orderDetails.work_order_type);
    $('#order-description').html(orderDetails.pheno);
    $('#complaint-time').html(orderDetails.complaint_time);
    $('#complaint-location').html(orderDetails.complaint_position);

    $('#order-lon').html(orderDetails.gps_lon);
    $('#order-lat').html(orderDetails.gps_lat);
    $('#network-type').html(orderDetails.actual_network);

    var testNetworkType = orderDetails.test_type;

    //根据测试类型初始化表格参数名
    if (testNetworkType == 2) {
        $('#title-signal-quality-first').html("Rx(dBm)");
        $('#title-signal-quality-second').html("Ecio(dB)");
        $('#title-secondary-test-category').html("语音呼叫");
        $('#title-secondary-test-category-first').html("通话接通率");
        $('#title-secondary-test-category-second').html("平均呼叫延时");
    } else if (testNetworkType == 3) {
        $('#title-signal-quality-first').html("Rx(dBm)");
        $('#title-signal-quality-second').html("RSRQ(dB)");
        $('#title-secondary-test-category').html("网络质量");
        $('#title-secondary-test-category-first').html("成功率");
        $('#title-secondary-test-category-second').html("平均时延");
    } else if (testNetworkType == 4) {
        $('#title-signal-quality-first').html("RSRP(dBm)");
        $('#title-signal-quality-second').html("RSRQ(dB)");
        $('#title-secondary-test-category').html("网络质量");
        $('#title-secondary-test-category-first').html("成功率");
        $('#title-secondary-test-category-second').html("平均时延");
    }

    // 信号测试结果
    if (!orderDetails.signal_test1) {
        $('#signal-quality-first').html("N/A");
    } else if ((testNetworkType == 3 && orderDetails.signal_test1 == -120)
        || (testNetworkType == 4 && orderDetails.signal_test1 == -140)) {
        $('#signal-quality-first').html("脱网");
    } else {
        $('#signal-quality-first').html(orderDetails.signal_test1);
    }
    if (!orderDetails.signal_test2) {
        $('#signal-quality-second').html("N/A");
    } else if (testNetworkType == 4 && orderDetails.signal_test2 == -20) {
        $('#signal-quality-second').html("脱网");
    } else {
        $('#signal-quality-second').html(orderDetails.signal_test2);
    }

    // 语音测试或网络测试结果
    if (orderDetails.network_test1) {
        $('#secondary-test-value-first').html(orderDetails.network_test1 + "%");
    } else {
        $('#secondary-test-value-first').html("N/A");
    }
    if (orderDetails.network_test2) {
        $('#secondary-test-value-second').html(orderDetails.network_test2 + (testNetworkType == 2 ? "s" : "ms"));
    } else {
        $('#secondary-test-value-second').html("N/A");
    }

    // 解决情况
    if (orderDetails.is_handled) {
        $('#input-solution option').filter(function () {
            $(this).removeAttr('selected');
            return $(this).html() == orderDetails.is_handled;
        }).attr('selected', 'selected')
    }
    // 故障原因
    if (orderDetails.problem_type) {
        // TODO 故障原因选择逻辑确定后处理选中问题
        $('#input-cause option').filter(function(){
            $(this).removeAttr('selected');
            return $(this).html() == orderDetails.problem_type
        }).attr('selected', 'selected')
    }
    // 备注
    if (orderDetails.remark) {
        $('#input-note').html(orderDetails.remark);
    }
}

function saveTestResult() {
    orderDetails.save_time = +new Date();
    localStorage.setItem('test_result_' + id, JSON.stringify(orderDetails));

    location.href = "order-list.html?status=40";
}

function submitTestResult() {
    // Get user's phone number first
    NativeApi.getPhoneNumber("onPhoneNumberGot");
    // TODO 浏览器端测试提交用，APP端运行时NativeApi理应存在
    // if (typeof NativeApi !== "undefined" && NativeApi !== null) {
    //     NativeApi.getPhoneNumber("onPhoneNumberGot");
    // } else {
    //     onPhoneNumberGot(null);
    // }
}

function onPhoneNumberGot(phoneNumber) {
    var userId = localStorage.getItem('user_id');
    var token = localStorage.getItem('token');
    var isHandled = $('#input-solution option:selected').val();

    var testType = "";
    if (orderDetails.test_type === 2) {
        testType = "2G";
    } else if (orderDetails.test_type === 3) {
        testType = "3G";
    } else if (orderDetails.test_type === 4) {
        testType = "4G";
    }

    // TODO 故障原因
    // var problemType =

    // TODO 浏览器端测试用，浏览器取不到这些数据，在APP端使用时应该删除
    // orderDetails.gps_lat = "1111";
    // orderDetails.gps_lon = "2222";
    // orderDetails.signal_test1 = "1";
    // orderDetails.signal_test2 = "2";
    // orderDetails.network_test1 = "3";
    // orderDetails.network_test2 = "4";

    var estimatetime = $('#input-time-expect').val();

    var note = $('#input-note').val();

    // TODO 测试用日志 不需要看提交参数时删除
    console.log({
        user_id: userId,
        token: token,
        telephone: phoneNumber,
        work_order_id: wrapEmptyValue(id),
        is_handled: isHandled,
        test_type: wrapEmptyValue(testType),
        problem_type: wrapEmptyValue("无法定位"), // TODO 故障原因
        actual_lon: orderDetails.gps_lon,
        actual_lat: orderDetails.gps_lat,
        actual_network: wrapEmptyValue(orderDetails.actual_network),
        signal_test1: orderDetails.signal_test1,
        signal_test2: orderDetails.signal_test2,
        network_test1: orderDetails.network_test1,
        network_test2: orderDetails.network_test2,
        is_reached: orderDetails.is_reached,
        estimatetime: estimatetime,
        remark: note
    });

    $.post(
        "http://120.27.27.42:8080/AndroidApp/submitData",
        {
            user_id: userId,
            token: token,
            telephone: phoneNumber,
            work_order_id: wrapEmptyValue(id),
            is_handled: isHandled,
            test_type: wrapEmptyValue(testType),
            problem_type: wrapEmptyValue("无法定位"), // TODO 故障原因
            actual_lon: orderDetails.gps_lon,
            actual_lat: orderDetails.gps_lat,
            actual_network: wrapEmptyValue(orderDetails.actual_network),
            signal_test1: orderDetails.signal_test1,
            signal_test2: orderDetails.signal_test2,
            network_test1: orderDetails.network_test1,
            network_test2: orderDetails.network_test2,
            is_reached: orderDetails.is_reached,
            estimatetime: estimatetime,
            remark: note
        },
        function (data, status) {
            console.log(data);
            console.log(status);
            if (status === 'success' && data.result === 0) {
                location.href = 'order-detail.html?id=' + id + '&status=50';
            } else if (data.result === 101) {
                logout();
                location.href = 'index.html';
                alert(data.text);
            } else if (data.text) {
                alert(data.text);
            } else {
                alert("提交失败");
            }
        },
        'json'
    );
}

function wrapEmptyValue(value) {
    if (!value) {
        return "";
    } else {
        return value;
    }
}
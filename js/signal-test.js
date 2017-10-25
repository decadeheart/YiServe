var id = new URL(window.location.href).searchParams.get('id');
var orderDetails = JSON.parse(localStorage.getItem('order_details'));

var chart;

var TYPE_2G_RX = 3;
var TYPE_ECIO = 4;
var TYPE_3G_RX = 5;
var TYPE_3G_ECIO = 6;//换成mEvdoEcio,但是目前API给出的mEvdoEcio不准，所以用cdmaecio
var TYPE_RSRP = 9;
var TYPE_RSRQ = 10;//换成RSRQ

var leftType;
var rightType;

var testing = false;
var shouldStop = false;
var results = [];
var leftValues = [];
var rightValues = [];

$(document).ready(function () {
    $('.button-right').css('display', id ? 'inline-block' : 'none');

    chart = echarts.init(document.getElementById('chart-container'));
    setupChart();

    $('#button-start').click(function () {
        if (!testing) {
            observeSignal();
        } else {
            stopObservingSignal();
        }
    });

    $('input[name=networkTypes]').change(function () {
        stopObservingSignal();

        if (this.value == 2) {
            leftType = TYPE_2G_RX;
            rightType = TYPE_ECIO;
        }
        if (this.value == 3) {
            leftType = TYPE_3G_RX;
            rightType = TYPE_3G_ECIO;
        }
        if (this.value == 4) {
            leftType = TYPE_RSRP;
            rightType = TYPE_RSRQ;
        }

        updateTitles(this.value);
    });
});

$(window).bind('beforeunload', function(){
    stopObservingSignal();
});

function updateTitles(type) {
    var $titleLeft = $('#title-left');
    var $titleRight = $('#title-right');
    if (type == 2) {
        $titleLeft.html('Rx(dBm)');
        $titleRight.html('Ecio(dB)');
    }
    if (type == 3) {
        $titleLeft.html('Rx(dBm)');
        $titleRight.html('Ecio(dB)');
    }
    if (type == 4) {
        $titleLeft.html('RSRP(dBm)');
        $titleRight.html('RSRQ(dB)');
    }
}

function observeSignal() {
    NativeApi.observeSignal(leftType, rightType, "onSignalUpdate");

    testing = true;
    shouldStop = false;
    results = [];
    leftValues = [];
    rightValues = [];
    $('#button-start').html('停止');
}

function onSignalUpdate(signalType, leftValue, rightValue) {
    if (shouldStop) {
        return;
    }

    var checkedType = $("#radio-group-type").find("input:checked").val();
    if ((checkedType != 2) && (checkedType != signalType)) {
        console.log(checkedType + " " + signalType);
        toastr.warning("测试类型与当前信号类型不匹配，请您切换网络类型。");
        shouldStop = true;
        stopObservingSignal();
    } else {
        // 记录测试结果
        var data = {
            signalType: signalType,
            leftValue: leftValue,
            rightValue: rightValue
        };
        results.push(data);
        var now = new Date();
        leftValues.push([now, leftValue]);
        rightValues.push([now, rightValue]);
        updateResultInfo();
    }
}

function updateResultInfo() {
    var totalLeft = 0;
    var totalRight = 0;
    results.forEach(function (item) {
        totalLeft += item.leftValue;
        totalRight += item.rightValue;
    });

    var leftAverage = Math.floor(totalLeft / results.length);
    var rightAverage = Math.floor(totalRight / results.length);
    if (signalStrengthInRange(leftAverage, leftType)) {
        $('#left-average').html(leftAverage);
    } else {
        $('#left-average').html("脱网");
    }

    if (signalStrengthInRange(rightAverage, rightType)) {
        $('#right-average').html(rightAverage);
    } else {
        $('#right-average').html("脱网");
    }

    var lastItem = results[results.length - 1];
    if (signalStrengthInRange(lastItem.leftValue, leftType)) {
        $('#left-value').html(lastItem.leftValue);
    } else {
        $('#left-value').html("脱网");
    }

    if (signalStrengthInRange(lastItem.rightValue, rightType)) {
        $('#right-value').html(lastItem.rightValue);
    } else {
        $('#right-value').html("脱网");
    }

    updateChart();
}

/**
 * 校验3G和4G信号质量的值是否在标称范围内，
 * 如果不在范围内，则给出一个边界值，避免无法绘图，
 * 但是表格中显示“脱网”
 *
 * @param value
 * @param valueType
 * @return result true:在标称范围内，false，不在范围内
 */
function signalStrengthInRange(value, valueType) {
    var result;

    switch (valueType) {
        case TYPE_3G_RX:
            result = ((value > -120) && (value < -40));
            break;
        case TYPE_RSRP:
            result = ((value > -140) && (value < -40));
            break;
        case TYPE_RSRQ:
            result = ((value > -20) && (value < 0));
            break;
        default:
            result = true;
            break;
    }

    return result;
}

function stopObservingSignal() {
    NativeApi.stopObservingSignal();
    testing = false;
    $('#button-start').html('开始');
}

function setupChart() {
    chart.setOption(option);
}

function updateChart() {
    chart.setOption({
        series: [{
            data: leftValues
        }, {
            data: rightValues
        }]
    });
}

option = {
    grid: {
        top: '2%',
        right: '8%',
        bottom: '10%'
    },
    xAxis: {
        type: 'time'
    },
    yAxis: {
        type: 'value',
        min: -160,
        max: 20,
        interval: 10
    },
    series: [{
        type: 'line',
        showSymbol: false,
        hoverAnimation: false,
        data: leftValues
    }, {
        type: 'line',
        showSymbol: false,
        hoverAnimation: false,
        data: rightValues
    }]
};

function onRightButtonClick() {
    var checkedRadioButton = $("#radio-group-type").find("input:checked");

    var totalLeft = 0;
    var totalRight = 0;
    results.forEach(function (item) {
        totalLeft += item.leftValue;
        totalRight += item.rightValue;
    });
    var leftAverage = totalLeft / results.length;
    var rightAverage = totalRight / results.length;

    orderDetails.test_type = parseInt(checkedRadioButton.val());
    orderDetails.signal_test1 = leftAverage;
    orderDetails.signal_test2 = rightAverage;
    orderDetails.actual_network = checkedRadioButton.parent().text().trim();
    localStorage.setItem('order_details', JSON.stringify(orderDetails));

    if (checkedRadioButton.val() == 2) {
        location.href = 'voice-test.html?id=' + id;
    } else {
        location.href = 'network-test.html?id=' + id;
    }
}

toastr.options = {
    "positionClass": "toast-bottom-center",
    "showDuration": "225",
    "hideDuration": "225",
    "timeOut": "2000"
};

String.prototype.trim = function() {
    return this.replace(/(^\s*)|(\s*$)/g, '');
};

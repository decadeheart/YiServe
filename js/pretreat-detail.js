var details = JSON.parse(localStorage.getItem('pre_deal_detail'));

$(document).ready(function () {
    console.log(details);
    pretreatData(details);
    renderInnerHtml($('table'), details);
});

function pretreatData(data) {
    if (!data.main_cause_text) {
        data.main_cause_text = "未知原因";
    }

    if (!data.sec_cause_text) {
        data.sec_cause_text = "未知原因";
    }

    if (!data.geogCell) {
        data.geogCell = "未知原因";
    } else if (data.geogCell.indexOf("Rich") >= 0) {
        data.geogCell = "网络资源充足";
    } else if (data.geogCell.indexOf("Poor") >= 0) {
        data.geogCell = "网络资源缺乏";
    } else {
        data.geogCell = "未知原因";
    }

    if (!data.alarm) {
        data.alarm = "未知原因";
    } else if (data.alarm.indexOf("Weak") >= 0) {
        data.alarm = "网络有故障";
    } else if (data.alarm.indexOf("Health") >= 0) {
        data.alarm = "网络无故障";
    } else {
        data.alarm = "未知原因";
    }

    if (!data.BSPerf) {
        data.BSPerf = "未知原因";
    } else if (data.BSPerf.indexOf("Rssi") >= 0) {
        data.BSPerf = "有关联小区噪异常";
    } else if (data.BSPerf.indexOf("Block") >= 0) {
        data.BSPerf = "有关联小区拥塞";
    } else if (data.BSPerf.indexOf("Sleep") >= 0) {
        data.BSPerf = "有零话务小区";
    } else if (data.BSPerf.indexOf("Good") >= 0) {
        data.BSPerf = "指标正常";
    } else {
        data.BSPerf = "未知原因";
    }

    if (!data.callEvent) {
        data.callEvent = "未知原因";
    } else if (data.callEvent.indexOf("Normal") >= 0) {
        data.callEvent = "正常";
    } else if (data.callEvent.indexOf("Abnormal_other") >= 0) {
        data.callEvent = "无线侧及网优问题";
    } else if (data.callEvent.indexOf("Abnormal_ecp") >= 0) {
        data.callEvent = "疑似核心侧问题";
    } else if (data.callEvent.indexOf("Abnormal_user") >= 0) {
        data.callEvent = "疑似用户终端及权限问题";
    } else if (data.callEvent.indexOf("无话单") >= 0) {
        data.callEvent = "无关联话单记录";
    } else {
        data.callEvent = "未知原因";
    }

    if (!data.callQuality) {
        data.callQuality = "未知原因";
    } else if (data.callQuality.indexOf("Thin") >= 0) {
        data.callQuality = "信号弱";
    } else if (data.callQuality.indexOf("Thick") >= 0) {
        data.callQuality = "信号正常";
    } else if (data.callQuality.indexOf("无话单") >= 0) {
        data.callQuality = "无话单记录";
    } else {
        data.callQuality = "未知原因";
    }

    if (!data.callDis) {
        data.callDis = "未知原因";
    } else if (data.callDis.indexOf("Onedge") >= 0) {
        data.callDis = "平均距离较远";
    } else if (data.callDis.indexOf("Inside") >= 0) {
        data.callDis = "信号正常";
    } else if (data.callDis.indexOf("无话单") >= 0) {
        data.callDis = "无话单记录";
    } else {
        data.callDis = "未知原因";
    }

    return data;
}
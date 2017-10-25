var id = new URL(window.location.href).searchParams.get('id');
var orderDetails = JSON.parse(localStorage.getItem('order_details'));
var map;

var userLon;
var userLat;
var distance;

$(document).ready(function () {
    loadMap();
});

function loadMap() {
    var script = document.createElement("script");
    script.src = "http://api.map.baidu.com/api?v=2.0&ak=DoHvTWaXbxWX03oghWGh45oWuYCtLAYj&callback=onMapReady";
    document.body.appendChild(script);
}

function onMapReady() {
    map = new BMap.Map("map_container");

    locateOrder();
    locateUser();
}

function locateOrder() {
    var lat = orderDetails.gps_lat;
    var lon = orderDetails.gps_lon;

    $('#complaint_location').html(lon + " " + lat);

    var point = new BMap.Point(lon, lat);
    map.centerAndZoom(point, 15);
    addMarker(point)
}

function addMarker(point) {
    var icon = new BMap.Icon("img/marker.png", new BMap.Size(45, 46), {
        anchor: new BMap.Size(22, 46)
    });
    var marker = new BMap.Marker(point, {icon: icon});
    map.addOverlay(marker);
}

function locateUser() {
    NativeApi.locate('onLocationUpdate');
}

function onLocationUpdate(longitude, latitude) {
        userLon = longitude;
        userLat = latitude;
        $('#current_location').html(userLon + " " + userLat);

        var orderLocation = new BMap.Point(orderDetails.gps_lon, orderDetails.gps_lat);
        var userLocation = new BMap.Point(userLon, userLat);

        distance = map.getDistance(orderLocation, userLocation);
        $('#distance_from_complaint_location').html(distance > 10000 ? "大于10千米" : Math.round(distance) + "米");
}

$(window).bind('beforeunload', function(){
    NativeApi.stopLocating();
});

function onRightButtonClick() {
    if (distance <= 100 || confirm("您尚未到达现场，是否继续？")) {
        orderDetails.actual_lon = userLon;
        orderDetails.actual_lat = userLat;
        orderDetails.reached = distance <= 100;
        localStorage.setItem('order_details', JSON.stringify(orderDetails));

        location.href = 'signal-test.html?id=' + id;
    }
}
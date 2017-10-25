if (localStorage.getItem('autoLogin')) {
    location.href = 'home.html';
}

$(document).ready(function () {
    var loginInfo = localStorage.getItem('savedLoginInfo');
    if (loginInfo) {
        loginInfo = JSON.parse(loginInfo);
        $('#input-phone').val(loginInfo.phone);
        $('#input-password').val(loginInfo.password);
        $('#checkbox-remember-password').attr('checked', 'true');
    }
});

function onLogin() {
    var phone = $('#input-phone').val();
    var password = $('#input-password').val();
    var rememberPassword = $('#checkbox-remember-password').prop('checked');
    var autoLogin = $('#checkbox-auto-login').prop('checked');

    $.post(
        "http://120.27.27.42:8080/AndroidApp/login",
        {
            user_name: phone,
            user_password: password
        },
        function (data, status) {
            console.log(data);
            console.log(status);
            if (status === 'success' && data.result === 0) {
                if (rememberPassword) {
                    localStorage.setItem('savedLoginInfo', JSON.stringify({phone: phone, password: password}));
                }
                if (autoLogin) {
                    localStorage.setItem('autoLogin', true);
                }
                localStorage.setItem('token', data.token);
                localStorage.setItem('user_id', data.data.user_id);
                localStorage.setItem('user_info', JSON.stringify(data.data));
                location.href = "home.html";
            } else if (data.text) {
                alert(data.text);
            } else {
                alert("登录失败，请检查网络连接");
            }
        },
        'json'
    );
}
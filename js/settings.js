function onRightButtonClick() {
    var password = $('#input-password').val();
    var newPassword = $('#input-new-password').val();
    var confirm = $('#input-confirm-password').val();

    if (isEmpty(password)) {
        alert("请输入密码");
        return;
    }
    if (isEmpty(newPassword)) {
        alert("请输入新密码");
        return;
    }
    if (isEmpty(confirm)) {
        alert("请确认新密码");
        return;
    }
    if (newPassword.length < 6 || confirm.length < 6) {
        alert("新密码至少6位");
        return;
    }
    if (!(newPassword === confirm)) {
        alert("新密码与确认密码不一致");
        return;
    }

    changePassword(password, newPassword);
}

function changePassword(password, newPassword) {
    var userId = localStorage.getItem('user_id');
    var token = localStorage.getItem('token');
    $.post(
        "http://120.27.27.42:8080/AndroidApp/changePassword",
        {
            user_id: userId,
            old_password: password,
            new_password: newPassword,
            token: token
        },
        function (data, status) {
            console.log(data);
            console.log(status);
            if (status === 'success' && data.result === 0) {
                history.back();
            } else if (data.result === 101) {
                logout();
                location.href = 'index.html';
                alert(data.text);
            } else if (data.text) {
                alert(data.text);
            } else {
                alert("密码修改失败");
            }
        },
        'json'
    );
}

function isEmpty(string) {
    return !string || !string.trim()
}

function logout() {
    localStorage.removeItem('autoLogin');
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_info');
}
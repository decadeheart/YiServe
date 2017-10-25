$(document).ready(function () {
    updateUserInfo();
    updateBulletinBoard();
    bindEvents();
});

function updateUserInfo() {
    var user_info = JSON.parse(localStorage.getItem('user_info'));
    renderInnerHtml($('.user-info-area'), user_info);
}

function updateBulletinBoard() {
    $('#bulletin-board').html('公告内容公告内容公告内容公告内容公告内容公告内容公告内容公告内容公告内容公告内容公告内容公告内容公告内容公告内容公告内容公告内容公告内容');
}

function bindEvents() {
}

function onBackButtonClick() {
    location.href = 'settings.html';
}

function onRightButtonClick() {
    if (confirm('确定要退出登录吗？')) {
        logout();
        location.href = 'index.html';
    }
}

function logout() {
    localStorage.removeItem('autoLogin');
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_info');
}
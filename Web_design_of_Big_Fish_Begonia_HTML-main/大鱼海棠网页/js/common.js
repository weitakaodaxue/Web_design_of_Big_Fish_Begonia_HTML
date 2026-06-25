// 页面加载时执行
window.onload = function () {
    // ---------- 1. 判断当前页面 ----------
    // 检查网址里有没有 "/html/"，有就说明在子目录，没有就在根目录
    var inHtmlFolder = window.location.href.indexOf('/html/') !== -1;
    var isLogin = window.location.href.indexOf('login.html') !== -1;

    // ---------- 2. 登录检查 ----------
    var loggedIn = localStorage.getItem('isLoggedIn') === 'true';

    if (!loggedIn && !isLogin) {
        // 没登录，也不是登录页 → 跳去登录
        if (inHtmlFolder) {
            window.location.href = '../login.html';   // 子目录里的页面
        } else {
            window.location.href = 'html/login.html'; // 首页（根目录）
        }
        return;
    }

    if (loggedIn && isLogin) {
        // 已登录，但还在登录页 → 跳去首页
        window.location.href = '../index.html';
        return;
    }

    // ---------- 3. 背景音乐 ----------
    var audio = document.getElementById('bgAudio');

    // 如果页面里没有音乐标签，就创建一个
    if (!audio) {
        audio = document.createElement('audio');
        audio.id = 'bgAudio';
        // 根据页面位置设置音乐路径
        if (inHtmlFolder) {
            audio.src = '../video/dayv.ogg';
        } else {
            audio.src = 'video/dayv.ogg';
        }
        audio.loop = true;
        audio.style.display = 'none';
        document.body.appendChild(audio);
    }

    // 从浏览器记忆里读取上次播放到哪了
    var savedTime = localStorage.getItem('bgMusicCurrentTime');
    if (savedTime) {
        audio.currentTime = parseFloat(savedTime);
    }

    // 尝试播放（浏览器可能会阻止自动播放，忽略错误就行）
    audio.play().catch(function () { });

    // ---------- 4. 点击导航时保存播放进度 ----------
    window.setCurrentPlayTime = function () {
        var a = document.getElementById('bgAudio');
        if (a) {
            localStorage.setItem('bgMusicCurrentTime', a.currentTime);
        }
    };

    // ---------- 5. 页面关闭前自动保存 ----------
    window.onbeforeunload = function () {
        var a = document.getElementById('bgAudio');
        if (a) {
            localStorage.setItem('bgMusicCurrentTime', a.currentTime);
        }
    };
};
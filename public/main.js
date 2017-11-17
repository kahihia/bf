var objbfrus = {};
window.addEventListener("DOMContentLoaded", function() {

    if(objbfrus.chtencook("yand_banner") != "1" && (navigator.userAgent.indexOf("Windows") != "-1" || navigator.userAgent.indexOf("Mac") != "-1") && document.location.href == "https://preview.b-friday.com/russian-goods/"){
        objbfrus.zapuskbanner();
    }

    objbfrus.cookie_bf();//zapis kukov
}, false);

objbfrus.zapuskbanner = function () {

    var ssilnabrauser;
    if(navigator.userAgent.indexOf("Windows") != "-1"){
        ssilnabrauser = "/Yandex.exe";
    }
    else if(navigator.userAgent.indexOf("Mac") != "-1"){
        ssilnabrauser = "/Yandex.dmg";
    }

    var vstavcss = document.createElement("link");
    vstavcss.href = "/banner_yand.css";
    vstavcss.rel = "stylesheet";

    document.getElementsByTagName("head")[0].appendChild(vstavcss);

    var sozdbanner = document.createElement("div");
    sozdbanner.id = "banner_yandex";
    sozdbanner.innerHTML = "" +
    "<div class='cloze_bf_yand'></div>" +
    "<div class='yand_logo'></div>" +
    "<div class='textobl_yand'>" +
    "<div class='bezopas_pokupki'>Безопасные покупки – только в Яндекс Браузере</div>" +
    "<ul class='spisok_okno_yandex'>" +
    "<li>Выбирайте лучшие товары зарубежных магазинов</li>" +
    "<li>Безопасно оплачивайте онлайн!</li>" +
    "<li>Радуйтесь покупке!</li>" +
    "</ul>" +
    "</div>" +
    "<a target='_blank' href='"+ssilnabrauser+"'><div class='hochu_kupit'>Хочу покупать безопасно</div></a>";

    sozdbanner.style.width = "570px";
    sozdbanner.style.height = "333px";

    document.getElementsByTagName("body")[0].appendChild(sozdbanner);

    var vstavbanner = document.getElementById("banner_yandex");

    var scrolled = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;

    vstavbanner.style.marginTop = (window.innerHeight - vstavbanner.clientHeight) / 2 + scrolled + "px";
    vstavbanner.style.marginLeft = (window.innerWidth - vstavbanner.clientWidth) / 2 + "px";

    document.getElementsByClassName("cloze_bf_yand")[0].onclick = function () {
        objbfrus.closebanner();
    };
};

objbfrus.closebanner = function () {
    document.getElementById("banner_yandex").parentNode.removeChild(document.getElementById("banner_yandex"));
};

objbfrus.cookie_bf = function () {
    var date = new Date(new Date().getTime() + 60 * 100000000);
    document.cookie = "yand_banner=1; path=/; expires=" + date.toUTCString();
};

objbfrus.chtencook = function (name) {
    var matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
};
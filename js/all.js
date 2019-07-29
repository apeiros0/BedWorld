$(document).ready(() => {
    $('.jq-hamburger__bar__btn').on('click', () => {
        $('.jq-aside').addClass('aside--appear');
        $('.jq-mainContent').addClass('mainContent--close');
    });


    $('.jq-aside__close__btn, .jq-mainContent').on('click', () => {
        $('.jq-aside').removeClass('aside--appear');
        $('.jq-mainContent').removeClass('mainContent--close');
    });


    // 輪播
    $('.owl-carousel').owlCarousel({
        loop: true,
        margin: 10,
        nav: true,
        // prev, next 改變成 div 元素
        navElement: "div",

        responsive: {
            0: {
                items: 1
            },
            768: {
                items: 2
            },
            992: {
                items: 3
            }
        }
    });
});
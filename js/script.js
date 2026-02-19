$(function () {

    /* ── Active Nav on scroll ── */
    $(window).on('scroll', function () {
        var scrollPos = $(this).scrollTop() + 90;
        $('section[id]').each(function () {
            if (scrollPos >= $(this).offset().top) {
                $('.navbar-nav .nav-link').removeClass('active');
                $('.navbar-nav .nav-link[href="#' + $(this).attr('id') + '"]').addClass('active');
            }
        });
    });

    /* ── Close navbar on link click (mobile) ── */
    $('.navbar-nav .nav-link').on('click', function () {
        if ($('#navMenu').hasClass('show')) {
            $('#navMenu').collapse('hide');
        }
    });

    /* ── Mobile navbar fade-in override ── */
    $('#navMenu').on('show.bs.collapse', function () {
        $(this).css({ opacity: 0, transform: 'translateY(-12px)' });
        setTimeout(function () {
            $('#navMenu').css({ transition: 'opacity .38s ease, transform .38s ease', opacity: 1, transform: 'translateY(0)' });
        }, 10);
    });
    $('#navMenu').on('hide.bs.collapse', function () {
        $(this).css({ opacity: 0, transform: 'translateY(-12px)' });
    });


    /* ── Smooth carousel control ── */
    var carousel = document.getElementById('homeCarousel');
    if (carousel) {
        carousel.addEventListener('slide.bs.carousel', function () {
            $(this).find('.slide-bg').css('transform', 'scale(1)');
        });
        carousel.addEventListener('slid.bs.carousel', function () {
            $(this).find('.carousel-item.active .slide-bg').css({ transition: 'transform 6s ease', transform: 'scale(1.05)' });
        });
    }

});

$(function () {

    /* ── Build gallery data array from DOM ── */
    var galleryItems = [];

    $('.gallery-item').each(function (i) {
        galleryItems.push({
            src: $(this).attr('data-src'),    // actual image path
            title: $(this).attr('data-title')
        });
        $(this).attr('data-index', i);
    });

    /* ── Open lightbox (first open from grid click) ── */
    function openLightbox(index) {
        // Store index FIRST before any async work
        $('#lightbox').data('current', index);
        $('#lightbox').addClass('open').hide().fadeIn(260);
        $('body').css('overflow', 'hidden');
        loadIntoLightbox(index);
    }

    /* ── Navigate ── */
    function navigate(direction) {
        var current = $('#lightbox').data('current');
        // Calculate next BEFORE the animate callback — avoids stale closure issue
        var next = (current + direction + galleryItems.length) % galleryItems.length;
        // Update stored index immediately so double-clicks don't desync
        $('#lightbox').data('current', next);
        $('#lbImgWrap, #lbCaption').animate({ opacity: 0 }, 140, function () {
            loadIntoLightbox(next);
            $('#lbImgWrap, #lbCaption').animate({ opacity: 1 }, 200);
        });
    }

    /* ── Load image into already-open lightbox (no fade-in/out of overlay) ── */
    function loadIntoLightbox(index) {
        var item = galleryItems[index];
        $('#lbImgWrap').html('<div class="lb-spinner"><i class="fas fa-spinner fa-spin"></i></div>');
        $('#lbCaption').html('');

        var img = new Image();
        img.onload = function () {
            $('#lbImgWrap').html('<img src="' + item.src + '" alt="' + item.title + '" />');
            $('#lbCaption').html(
                '<i class="fas fa-images me-2"></i>' + item.title +
                '<span>' + (index + 1) + ' / ' + galleryItems.length + '</span>'
            );
        };
        img.onerror = function () {
            $('#lbImgWrap').html(
                '<div style="min-height:300px;display:flex;align-items:center;justify-content:center;color:#aaa;font-size:1rem;">' +
                '<i class="fas fa-image me-2"></i>Image not found</div>'
            );
        };
        img.src = item.src;
    }

    /* ── Close lightbox ── */
    function closeLightbox() {
        $('#lightbox').fadeOut(220, function () {
            $(this).removeClass('open');
            $('#lbImgWrap').html('');
        });
        $('body').css('overflow', '');
    }

    /* ── Event bindings ── */
    $('.gallery-item').on('click', function () {
        openLightbox(parseInt($(this).attr('data-index')));
    });

    $('#lbClose').on('click', closeLightbox);

    /* Click outside image to close */
    $('#lightbox').on('click', function (e) {
        if ($(e.target).is('#lightbox')) closeLightbox();
    });

    $('#lbNext').on('click', function (e) { e.stopPropagation(); navigate(1); });
    $('#lbPrev').on('click', function (e) { e.stopPropagation(); navigate(-1); });

    /* Keyboard navigation */
    $(document).on('keydown', function (e) {
        if (!$('#lightbox').hasClass('open')) return;
        if (e.key === 'ArrowRight') navigate(1);
        if (e.key === 'ArrowLeft') navigate(-1);
        if (e.key === 'Escape') closeLightbox();
    });

    /* Touch swipe support for mobile */
    var touchStartX = 0;
    $('#lightbox').on('touchstart', function (e) {
        touchStartX = e.originalEvent.changedTouches[0].clientX;
    });
    $('#lightbox').on('touchend', function (e) {
        var diff = touchStartX - e.originalEvent.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) navigate(diff > 0 ? 1 : -1);
    });

});


var nctData = {
    1: {
        front: { src: 'images/cer-1-1.jpg', cap: 'Order for provissional Registration — Front Page' },
        back: { src: 'images/cer-1-2.jpg', cap: 'Order for provissional Registration — Back Page' }
    },
    2: {
        front: { src: 'images/cer2-1.jpg', cap: 'Order for provissional Approval — Front Page' },
        back: { src: 'images/cer2-2.jpg', cap: 'Order for provissional Approval — Back Page' }
    },
    3: {
        front: { src: 'images/cer-3.jpg', cap: 'REGISTRAR OF COMPANIES' }
    }
};

var nctActiveCert = null, nctActivePage = null;

function nctFlip(certNo, side) {
    var $flipper = $('#nct' + certNo + '-flipper');
    var $tabFront = $('#nct' + certNo + '-tab-front');
    var $tabBack = $('#nct' + certNo + '-tab-back');
    if (side === 'back') {
        $flipper.addClass('flipped');
        $tabBack.addClass('active'); $tabFront.removeClass('active');
    } else {
        $flipper.removeClass('flipped');
        $tabFront.addClass('active'); $tabBack.removeClass('active');
    }
}

function nctOpen(certNo, page) {
    nctActiveCert = certNo;
    nctActivePage = page || 'front';
    if (certNo === 1 || certNo === 2) {
        $('#nct-lb-pnav').removeClass('d-none').addClass('d-flex');
    } else {
        $('#nct-lb-pnav').removeClass('d-flex').addClass('d-none');
    }
    $('#nct-lb-front-btn').addClass('active').css({ background: '#FF6B00', 'border-color': '#FF6B00' });
    $('#nct-lb-back-btn').removeClass('active').css({ background: 'transparent', 'border-color': '' });
    nctLoad();
    $('#nct-lightbox').addClass('open').hide().fadeIn(250);
    $('body').css('overflow', 'hidden');
}

function nctSwitch(page) {
    nctActivePage = page;
    $('#nct-lb-front-btn,#nct-lb-back-btn').css({ background: 'transparent', 'border-color': '' }).removeClass('active');
    $('#nct-lb-' + page + '-btn').addClass('active').css({ background: '#FF6B00', 'border-color': '#FF6B00' });
    $('#nct-lb-body').animate({ opacity: 0 }, 150, function () {
        nctLoad(); $('#nct-lb-body').animate({ opacity: 1 }, 200);
    });
}

function nctLoad() {
    var d = nctData[nctActiveCert][nctActivePage] || nctData[nctActiveCert]['front'];
    if (d.src) {
        $('#nct-lb-body').html('<img src="' + d.src + '" alt="' + d.cap + '" />');
    } else {
        $('#nct-lb-body').html(
            '<div class="nct-lb-ph">' +
            '<div style="font-size:56px;margin-bottom:12px;">📄</div>' +
            '<p class="text-white fw-bold mb-1">' + d.cap + '</p>' +
            '<p class="text-secondary small mb-0">Set <code style="color:#FFC107;">src</code> in nctData[' + nctActiveCert + '].' + nctActivePage + '</p>' +
            '</div>'
        );
    }
    $('#nct-lb-cap').html('<i class="fas fa-certificate me-1 text-warning"></i>' + d.cap);
}

function nctClose() {
    $('#nct-lightbox').fadeOut(220, function () {
        $(this).removeClass('open'); $('#nct-lb-body').html('');
    });
    $('body').css('overflow', '');
}

$('#nct-lightbox').on('click', function (e) {
    if ($(e.target).is('#nct-lightbox')) nctClose();
});
$(document).on('keydown', function (e) {
    if (e.key === 'Escape' && $('#nct-lightbox').hasClass('open')) nctClose();
});
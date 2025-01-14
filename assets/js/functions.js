/*================================================
*
* Template name : Gray - Tailwind Personal vCard/Portfolio Template
* Version       : 1.0
* Author        : FlaTheme
* Author URL    : https://themeforest.net/user/flatheme
*
* Table of Contents :
* 1. Page Preloader
* 2. Scroll Spy
* 3. Toggle Menu
* 4. Sliders
* 5. Counter
* 6. Portfolio Filter
* 7. Lightbox
* 8. Contact Form
* 9. Maps
*
================================================*/
"use strict";

/*===============================================
  1. Page Preloader
===============================================*/
var preloader = document.querySelector(".preloader");

if (preloader) {
  window.addEventListener("load", function () {
    document.body.classList.add("loaded");
  });
}


/*===============================================
  2. Scroll spy
===============================================*/
var section = document.querySelectorAll(".section");
var sections = {};
var currentActive = null;

function updateSections() {
  sections = {};
  Array.prototype.forEach.call(section, function (e) {
    sections[e.id] = e.offsetTop;
  });
}

updateSections();

window.addEventListener('resize', updateSections);

window.onscroll = function () {
  var scrollPosition = document.documentElement.scrollTop || document.body.scrollTop;
  var newActive = null;

  for (let i in sections) {
    if (sections[i] <= scrollPosition + 48) {
      newActive = i;
    }
  }

  if (newActive && newActive !== currentActive) {
    currentActive = newActive;

    var activeElement = document.querySelector('.active');
    if (activeElement) {
      activeElement.classList.remove('active');
    }

    var newActiveElement = document.querySelector(`.section-link[href*='${CSS.escape(newActive)}']`);
    if (newActiveElement) {
      newActiveElement.classList.add('active');
    }
  }
};


/*===============================================
  3. Toggle Menu
===============================================*/
var toggleMenu = $(".toggle-menu");

if (toggleMenu.length) {
  var menuBtn = $(".menu-btn");
  var menuClose = $(".menu-close");
  //
  // Open //
  //
  menuBtn.on("click", function() {
    if (toggleMenu.hasClass("show")) {
      toggleMenu.removeClass("show");
    }
    else {
      toggleMenu.addClass("show");
    }
  });
  //
  // Close //
  //
  menuClose.on("click", function() {
    toggleMenu.removeClass("show");
  });
  $(document).on("click", function(e) {
    if ( $(e.target).closest(".toggle-menu, .menu-btn").length === 0 ) {
      if (toggleMenu.hasClass("show")) {
        toggleMenu.removeClass("show");
      }
    }
  });
}


/*===============================================
  4. Sliders
===============================================*/
var swiper = new Swiper(".clients-swiper", {
  slidesPerView: 2,
  spaceBetween: 30,
  grabCursor: true,
  breakpoints: {
    // when window width is >= 640px
    640: {
      slidesPerView: 3,
      spaceBetween: 30
    },
    // when window width is >= 992px
    992: {
      slidesPerView: 3,
      spaceBetween: 40
    },
    // when window width is >= 1200px
    1200: {
      slidesPerView: 5,
      spaceBetween: 40
    }
  },
  autoplay: {
    delay: 2500,
    disableOnInteraction: false,
  },
});

var swiper = new Swiper(".testimonial-swiper", {
  slidesPerView: 1,
  spaceBetween: 30,
  breakpoints: {
    // when window width is >= 768px
    768: {
      slidesPerView: 1,
      spaceBetween: 30
    },
    // when window width is >= 992px
    992: {
      slidesPerView: 1,
      spaceBetween: 40
    },
    // when window width is >= 1200px
    1200: {
      slidesPerView: 2,
      spaceBetween: 40
    }
  },
  navigation: {
    nextEl: ".swiper-testimonial-next",
    prevEl: ".swiper-testimonial-prev",
  },
  autoplay: {
    delay: 2500,
    disableOnInteraction: false,
  },
});


/*===============================================
  5. Counter
===============================================*/
var nCounter = $(".counter");

if (nCounter.length) {
  nCounter.appear(function() {
    $(this).each(function () {
      $(this).prop("Counter",0).animate({
          Counter: $(this).text()
      }, {
          duration: 2400,
          easing: "swing",
          step: function (now) {
              $(this).text(Math.ceil(now));
          }
      });
    });
  },{accX: 0, accY: -10});
}


/*===============================================
  6. Portfolio Filter
===============================================*/
var pGrid = $(".portfolio-grid");

if (pGrid.length) {
  var mixer = mixitup('.portfolio-grid', {
    selectors: {
        target: '.portfolio-item'
    },
    animation: {
        duration: 250
    }
  });
}


/*===============================================
  7. Lightbox
===============================================*/
const lightbox = GLightbox();


/*===============================================
  8. Contact Form
===============================================*/
const contactForm = document.getElementById("contactform");

if (contactForm) {
  contactForm.addEventListener("submit", function(e) {
    e.preventDefault();

    var formData = new FormData(this);

    fetch("assets/php/contact-form.php", {
      method: "POST",
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      if (data.status === "success") {
        document.getElementById("success").classList.add("show-result"); // Show Success Message
        contactForm.reset(); // Reset the form
      } else {
        document.getElementById("error").classList.add("show-result"); // Show Error Message
      }
    })
    .catch(error => {
      document.getElementById("error").classList.add("show-result"); // Show Error Message
      console.error("There was a problem with the fetch operation:", error);
    });
  });
}


/*===============================================
  9. Google Maps
===============================================*/
var mapCanvas = $(".gmap");

if (mapCanvas.length) {
  var m,divId,initLatitude, initLongitude, map;

  for (var i = 0; i < mapCanvas.length; i++) {
    m = mapCanvas[i];

    initLatitude = m.dataset["latitude"];
    initLongitude = m.dataset["longitude"];
    divId = "#"+ m["id"];

    map = new GMaps({
      el: divId,
      lat: initLatitude,
      lng: initLongitude,
      zoom: 16,
      scrollwheel: false,
      styles: [
          /* style your map at https://snazzymaps.com/editor and paste JSON here */
      ]
    });

    map.addMarker({
      lat : initLatitude,
      lng : initLongitude
    });
  }
}
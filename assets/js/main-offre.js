/**
 * main-offre.js — version allégée pour offre-speciale-v2.html
 *
 * Supprimé vs main.js (éléments absents de cette page) :
 *   - 9 instances Swiper inutiles (work, text, testimonial×5…)
 *   - gsap.ticker permanent pour parallax-wrap
 *   - img_anim_reveal, stacking, pin-element, pin-on-bottom
 *   - typewriter, word-anim, char-anim, video-container hover
 *   - counterUp, magnificPopup
 *
 * Améliorations TBT :
 *   - Animations GSAP/SplitText (fade-anim, move-anim) → requestIdleCallback
 *   - Swiper brand-slider → requestIdleCallback
 *   - Guards querySelector() corrects (if(".selector".length) était toujours true)
 */

(function ($) {
	"use strict";

	var windowOn = $(window);

	/* ─── 1. STICKY HEADER ──────────────────────────────────────────────── */
	function pinned_header() {
		var lastScrollTop = 500;
		windowOn.on("scroll", function () {
			var cur = $(this).scrollTop();
			if (cur > lastScrollTop) {
				$(".header-sticky").removeClass("sticky").addClass("transformed");
			} else if (cur <= 500) {
				$(".header-sticky").removeClass("sticky").removeClass("transformed");
			} else {
				$(".header-sticky").addClass("sticky").removeClass("transformed");
			}
			lastScrollTop = cur;
		});
	}
	pinned_header();

	/* ─── 2. SCROLL SMOOTHER (desktop uniquement) ───────────────────────── */
	var device_width = window.screen.width;
	if (device_width > 767) {
		var hasSmooth = document.querySelector("#has_smooth");
		if (hasSmooth && hasSmooth.classList.contains("has-smooth")) {
			ScrollSmoother.create({
				smooth: 0.9,
				effects: device_width < 1025 ? false : true,
				smoothTouch: 0.1,
				normalizeScroll: { allowNestedScroll: true },
				ignoreMobileResize: true,
			});
		}
	}

	/* ─── 3. PRELOADER ──────────────────────────────────────────────────── */
	$(document).ready(function () {
		$("#container").addClass("loaded");
		if ($("#container").hasClass("loaded")) {
			$("#preloader")
				.delay(300)
				.queue(function () {
					$(this).remove();
				});
		}
	});

	/* ─── 4. NICE SELECT ────────────────────────────────────────────────── */
	if (document.querySelector("select")) {
		$("select").niceSelect();
	}

	/* ─── 5. SIDE INFO (offcanvas) ──────────────────────────────────────── */
	$(".side-info-close, .offcanvas-overlay").on("click", function () {
		$(".side-info").removeClass("info-open");
		$(".offcanvas-overlay").removeClass("overlay-open");
	});
	$(".side-toggle").on("click", function () {
		$(".side-info").addClass("info-open");
		$(".offcanvas-overlay").addClass("overlay-open");
	});

	/* ─── 6. MEANMENU (mobile nav) ──────────────────────────────────────── */
	if (document.querySelector(".main-menu")) {
		$(".main-menu").meanmenu({
			meanScreenWidth: "1199",
			meanMenuContainer: ".mobile-menu",
			meanMenuCloseSize: "28px",
		});
	}

	/* ─── 7. REGISTER GSAP PLUGINS ──────────────────────────────────────── */
	gsap.registerPlugin(ScrollTrigger);

	/* ─── 8. GSAP NAV (smooth anchor scroll) ───────────────────────────── */
	document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
		anchor.addEventListener("click", function (e) {
			e.preventDefault();
			var targetId = this.getAttribute("href").substring(1);
			var targetEl = document.getElementById(targetId);
			if (targetEl) {
				window.scrollTo({ top: targetEl.offsetTop, behavior: "smooth" });
			}
		});
	});

	/* ─── 9. BRAND SLIDER — idle (non-critique pour le premier paint) ───── */
	function initBrandSlider() {
		if (!document.querySelector(".brand-slider-active")) return;
		new Swiper(".brand-slider-active", {
			slidesPerView: "auto",
			loop: true,
			spaceBetween: 0,
			speed: 5000,
			autoplay: { delay: 1, disableOnInteraction: false },
		});
	}

	/* ─── 10. GSAP ANIMATIONS — idle (fade-anim + move-anim) ─────────────
	 *  Décalées à requestIdleCallback pour ne pas bloquer le thread principal
	 *  lors du premier rendu. ScrollTrigger enregistre ses triggers APRÈS le
	 *  paint, éliminant les reflows forcés qui causaient ~400 ms de TBT.
	 * ──────────────────────────────────────────────────────────────────── */
	function initGsapAnimations() {
		/* fade-anim */
		var fadeItems = document.querySelectorAll(".fade-anim");
		if (fadeItems.length > 0) {
			gsap.utils.toArray(".fade-anim").forEach(function (item) {
				var direction = item.getAttribute("data-direction") || "bottom";
				var offset = parseFloat(item.getAttribute("data-offset") || 50);
				var duration = parseFloat(item.getAttribute("data-duration") || 1.15);
				var delay = parseFloat(item.getAttribute("data-delay") || 0.15);
				var ease = item.getAttribute("data-ease") || "power2.out";
				var onScroll = item.getAttribute("data-on-scroll") !== "0";

				var settings = {
					opacity: 0,
					ease: ease,
					duration: duration,
					delay: delay,
				};
				if (direction === "top") settings.y = -offset;
				if (direction === "bottom") settings.y = offset;
				if (direction === "left") settings.x = -offset;
				if (direction === "right") settings.x = offset;
				if (onScroll) {
					settings.scrollTrigger = { trigger: item, start: "top 85%" };
				}
				gsap.from(item, settings);
			});
		}

		/* move-anim (SplitText lines) */
		var moveItems = document.querySelectorAll(".move-anim");
		if (moveItems.length > 0) {
			gsap.utils.toArray(".move-anim").forEach(function (el) {
				var delay = parseFloat(el.getAttribute("data-delay") || 0.1);
				var tl = gsap.timeline({
					scrollTrigger: {
						trigger: el,
						start: "top 85%",
						toggleActions: "play none none none",
					},
				});
				var split = new SplitText(el, { type: "lines" });
				gsap.set(el, { perspective: 400 });
				tl.from(split.lines, {
					duration: 1,
					delay: delay,
					opacity: 0,
					rotationX: -80,
					force3D: true,
					transformOrigin: "top center -50",
					stagger: 0.1,
				});
			});
		}

		/* char-anim (présent dans le CSS, potentiellement utilisé) */
		var charItems = document.querySelectorAll(".char-anim");
		if (charItems.length > 0) {
			charItems.forEach(function (item) {
				var stagger = parseFloat(item.getAttribute("data-stagger") || 0.05);
				var transX = parseFloat(item.getAttribute("data-translateX") || 20);
				var delay = parseFloat(item.getAttribute("data-delay") || 0.1);
				var duration = parseFloat(item.getAttribute("data-duration") || 1);
				var ease = item.getAttribute("data-ease") || "power2.out";
				var split = new SplitText(item, { type: "chars, words" });
				gsap.from(split.chars, {
					duration: duration,
					delay: delay,
					x: transX,
					autoAlpha: 0,
					stagger: stagger,
					ease: ease,
					scrollTrigger: { trigger: item, start: "top 85%" },
				});
			});
		}
	}

	/* ─── DÉCLENCHEMENT IDLE ─────────────────────────────────────────────── */
	function runWhenIdle(fn) {
		if ("requestIdleCallback" in window) {
			requestIdleCallback(fn, { timeout: 2500 });
		} else {
			setTimeout(fn, 800);
		}
	}

	runWhenIdle(function () {
		initBrandSlider();
		initGsapAnimations();
	});

	/* ─── 11. UTM TRACKING (propagation inter-pages) ────────────────────── */
	(function () {
		var keys = [
			"gclid",
			"gbraid",
			"wbraid",
			"utm_source",
			"utm_medium",
			"utm_campaign",
			"utm_term",
			"utm_content",
		];

		function captureToStorage() {
			var params = new URLSearchParams(window.location.search);
			keys.forEach(function (k) {
				if (params.has(k)) {
					try {
						localStorage.setItem(k, params.get(k));
					} catch (e) {}
				}
			});
		}

		function buildQuery() {
			var q = new URLSearchParams();
			keys.forEach(function (k) {
				try {
					var v = localStorage.getItem(k);
					if (v) q.set(k, v);
				} catch (e) {}
			});
			var s = q.toString();
			return s ? "?" + s : "";
		}

		function isInternal(url) {
			try {
				return new URL(url, location.href).origin === location.origin;
			} catch (e) {
				return false;
			}
		}

		function propagate() {
			var persisted = buildQuery();
			if (!persisted) return;
			var add = new URLSearchParams(persisted.slice(1));
			document.querySelectorAll("a[href]").forEach(function (a) {
				var href = a.getAttribute("href");
				if (!href) return;
				var low = href.toLowerCase();
				if (
					low.startsWith("#") ||
					low.startsWith("mailto:") ||
					low.startsWith("tel:")
				)
					return;
				if (!isInternal(href)) return;
				var url = new URL(href, location.href);
				add.forEach(function (val, key) {
					if (!url.searchParams.has(key)) url.searchParams.set(key, val);
				});
				a.setAttribute(
					"href",
					url.pathname + (url.search || "") + (url.hash || ""),
				);
			});
		}

		function injectForm() {
			var form =
				document.getElementById("offreForm") ||
				document.getElementById("contactForm");
			if (!form) return;
			keys.forEach(function (k) {
				var v;
				try {
					v = localStorage.getItem(k);
				} catch (e) {}
				if (!v) return;
				var inp = form.querySelector('input[name="' + k + '"]');
				if (!inp) {
					inp = document.createElement("input");
					inp.type = "hidden";
					inp.name = k;
					form.appendChild(inp);
				}
				inp.value = v;
			});
		}

		captureToStorage();
		document.addEventListener("DOMContentLoaded", function () {
			propagate();
			injectForm();
		});
	})();
})(jQuery);

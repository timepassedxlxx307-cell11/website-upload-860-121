import { H as Hls } from "./video-vendor.js";

const ready = (handler) => {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", handler, { once: true });
    } else {
        handler();
    }
};

const normalizeText = (value) => (value || "").toString().trim().toLowerCase();

function bindMobileMenu() {
    const button = document.querySelector("[data-mobile-toggle]");
    const menu = document.querySelector("[data-mobile-menu]");
    if (!button || !menu) {
        return;
    }
    button.addEventListener("click", () => {
        menu.classList.toggle("is-open");
    });
}

function bindHero() {
    const hero = document.querySelector("[data-hero]");
    if (!hero) {
        return;
    }
    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    const previous = hero.querySelector("[data-hero-prev]");
    const next = hero.querySelector("[data-hero-next]");
    if (!slides.length) {
        return;
    }
    let index = 0;
    let timer = null;
    const show = (target) => {
        index = (target + slides.length) % slides.length;
        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle("is-active", slideIndex === index);
        });
        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle("is-active", dotIndex === index);
        });
    };
    const start = () => {
        stop();
        timer = window.setInterval(() => show(index + 1), 5200);
    };
    const stop = () => {
        if (timer) {
            window.clearInterval(timer);
            timer = null;
        }
    };
    previous?.addEventListener("click", () => {
        show(index - 1);
        start();
    });
    next?.addEventListener("click", () => {
        show(index + 1);
        start();
    });
    dots.forEach((dot, dotIndex) => {
        dot.addEventListener("click", () => {
            show(dotIndex);
            start();
        });
    });
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
}

function bindFilters() {
    const panels = Array.from(document.querySelectorAll("[data-filter-panel]"));
    panels.forEach((panel) => {
        const section = panel.closest(".section") || document;
        const target = section.querySelector("[data-filter-target]") || document.querySelector("[data-filter-target]");
        const input = panel.querySelector("[data-filter-input]");
        const type = panel.querySelector("[data-filter-type]");
        const empty = section.querySelector("[data-empty]");
        if (!target || !input) {
            return;
        }
        const params = new URLSearchParams(window.location.search);
        const initialQuery = params.get("q") || "";
        if (initialQuery) {
            input.value = initialQuery;
        }
        const cards = Array.from(target.querySelectorAll(".movie-card"));
        const apply = () => {
            const query = normalizeText(input.value);
            const selectedType = normalizeText(type?.value);
            let visible = 0;
            cards.forEach((card) => {
                const text = normalizeText([
                    card.dataset.title,
                    card.dataset.tags,
                    card.dataset.year,
                    card.dataset.region,
                    card.dataset.category,
                    card.textContent
                ].join(" "));
                const cardType = normalizeText(card.dataset.type);
                const matchedQuery = !query || text.includes(query);
                const matchedType = !selectedType || cardType === selectedType;
                const shown = matchedQuery && matchedType;
                card.classList.toggle("is-hidden", !shown);
                if (shown) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.hidden = visible !== 0;
            }
        };
        input.addEventListener("input", apply);
        type?.addEventListener("change", apply);
        apply();
    });
}

function bindPlayer() {
    const box = document.querySelector("[data-player]");
    if (!box) {
        return;
    }
    const video = box.querySelector("video");
    const overlay = box.querySelector(".play-overlay");
    const stream = box.dataset.stream;
    if (!video || !stream) {
        return;
    }
    let hls = null;
    let attached = false;
    const attach = () => {
        if (attached) {
            return;
        }
        attached = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = stream;
        } else if (Hls && Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 60
            });
            hls.attachMedia(video);
            hls.on(Hls.Events.MEDIA_ATTACHED, () => {
                hls.loadSource(stream);
            });
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                video.play().catch(() => {});
            });
            hls.on(Hls.Events.ERROR, (_event, data) => {
                if (data && data.fatal) {
                    if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                    } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                    } else {
                        hls.destroy();
                    }
                }
            });
        } else {
            video.src = stream;
        }
    };
    const play = () => {
        attach();
        overlay?.classList.add("is-hidden");
        video.play().catch(() => {});
    };
    overlay?.addEventListener("click", play);
    video.addEventListener("click", () => {
        if (!attached) {
            play();
        }
    });
    video.addEventListener("play", () => {
        overlay?.classList.add("is-hidden");
    });
    video.addEventListener("ended", () => {
        overlay?.classList.remove("is-hidden");
    });
}

ready(() => {
    bindMobileMenu();
    bindHero();
    bindFilters();
    bindPlayer();
});

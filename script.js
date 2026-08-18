document.addEventListener("DOMContentLoaded", () => {
    const header = document.querySelector("header");
    const nav = document.querySelector("#primary-navigation");
    const menuButton = document.querySelector(".menu-toggle");
    const navLinks = [...document.querySelectorAll("nav a[href^='#']")];
    const sections = [...document.querySelectorAll("section[id]")];
    const progressBar = document.querySelector(".scroll-progress span");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const backToTop = document.createElement("button");
    backToTop.className = "back-to-top";
    backToTop.type = "button";
    backToTop.setAttribute("aria-label", "Back to top");
    backToTop.textContent = "↑";
    document.body.appendChild(backToTop);

    backToTop.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });

    // Rotating hero role.
    const roleElement = document.querySelector("#typed-role");
    const roles = [
        "AI & ML Student",
        "Python Developer",
        "Web Developer",
        "Creative Problem Solver"
    ];
    let roleIndex = 0;
    let characterIndex = 0;
    let deleting = false;

    function typeRole() {
        if (!roleElement || reduceMotion) return;

        const role = roles[roleIndex];
        characterIndex += deleting ? -1 : 1;
        roleElement.textContent = role.slice(0, characterIndex);

        let delay = deleting ? 42 : 78;
        if (!deleting && characterIndex === role.length) {
            deleting = true;
            delay = 1450;
        } else if (deleting && characterIndex === 0) {
            deleting = false;
            roleIndex = (roleIndex + 1) % roles.length;
            delay = 280;
        }

        window.setTimeout(typeRole, delay);
    }

    if (roleElement && !reduceMotion) {
        roleElement.textContent = "";
        typeRole();
    }

    // Accessible mobile navigation.
    function closeMenu() {
        nav?.classList.remove("open");
        menuButton?.classList.remove("open");
        menuButton?.setAttribute("aria-expanded", "false");
        menuButton?.setAttribute("aria-label", "Open navigation menu");
    }

    menuButton?.addEventListener("click", () => {
        const isOpen = nav?.classList.toggle("open");
        menuButton.classList.toggle("open", Boolean(isOpen));
        menuButton.setAttribute("aria-expanded", String(Boolean(isOpen)));
        menuButton.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
    });

    navLinks.forEach((link) => link.addEventListener("click", closeMenu));
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") closeMenu();
    });

    // Scroll progress, header state and current section.
    let scrollFrame = null;

    function updateOnScroll() {
        const scrollTop = window.scrollY;
        const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = scrollableHeight > 0 ? (scrollTop / scrollableHeight) * 100 : 0;

        header?.classList.toggle("scrolled", scrollTop > 20);
        if (progressBar) progressBar.style.width = `${Math.min(progress, 100)}%`;

        let currentSection = sections[0]?.id;
        sections.forEach((section) => {
            if (scrollTop >= section.offsetTop - 190) currentSection = section.id;
        });

        navLinks.forEach((link) => {
            link.classList.toggle("active", link.getAttribute("href") === `#${currentSection}`);
        });

        backToTop.classList.toggle("visible", scrollTop > 650);
        scrollFrame = null;
    }

    window.addEventListener("scroll", () => {
        if (!scrollFrame) scrollFrame = requestAnimationFrame(updateOnScroll);
    }, { passive: true });

    // Reveal major content groups as they enter the viewport.
    const revealTargets = document.querySelectorAll(
        ".home-content, .profile-card, .section-heading, .about-container, " +
        ".skill-container, .project-container, .education-container, .contact-box"
    );

    revealTargets.forEach((element) => element.classList.add("reveal-item"));

    if (reduceMotion || !("IntersectionObserver" in window)) {
        revealTargets.forEach((element) => element.classList.add("visible"));
    } else {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });

        revealTargets.forEach((element) => revealObserver.observe(element));
    }

    // Card lighting and subtle perspective on desktop.
    const interactiveCards = document.querySelectorAll(".project-card, .skill-box, .profile-card");
    interactiveCards.forEach((card) => {
        card.addEventListener("pointermove", (event) => {
            const bounds = card.getBoundingClientRect();
            const x = event.clientX - bounds.left;
            const y = event.clientY - bounds.top;
            card.style.setProperty("--mouse-x", `${x}px`);
            card.style.setProperty("--mouse-y", `${y}px`);

            if (!reduceMotion && window.matchMedia("(pointer: fine)").matches) {
                const rotateY = (x / bounds.width - 0.5) * 4;
                const rotateX = (y / bounds.height - 0.5) * -4;
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-3px)`;
            }
        });

        card.addEventListener("pointerleave", () => {
            card.style.transform = "";
        });
    });

    // Small magnetic movement for primary actions.
    if (!reduceMotion && window.matchMedia("(pointer: fine)").matches) {
        document.querySelectorAll(".magnetic").forEach((button) => {
            button.addEventListener("pointermove", (event) => {
                const bounds = button.getBoundingClientRect();
                const x = event.clientX - bounds.left - bounds.width / 2;
                const y = event.clientY - bounds.top - bounds.height / 2;
                button.style.transform = `translate(${x * 0.08}px, ${y * 0.12}px)`;
            });
            button.addEventListener("pointerleave", () => {
                button.style.transform = "";
            });
        });

        const glow = document.createElement("div");
        glow.className = "cursor-glow";
        glow.setAttribute("aria-hidden", "true");
        document.body.appendChild(glow);

        window.addEventListener("pointermove", (event) => {
            glow.animate(
                { left: `${event.clientX}px`, top: `${event.clientY}px` },
                { duration: 550, fill: "forwards" }
            );
        }, { passive: true });
    }

    // Count the numeric highlights once.
    document.querySelectorAll("[data-count]").forEach((counter) => {
        const target = Number(counter.dataset.count);
        if (reduceMotion || !Number.isFinite(target)) return;

        let value = 0;
        const timer = window.setInterval(() => {
            value += 1;
            counter.textContent = String(value).padStart(2, "0");
            if (value >= target) window.clearInterval(timer);
        }, 95);
    });

    const year = document.querySelector("#current-year");
    if (year) year.textContent = new Date().getFullYear();

    document.querySelectorAll("a[target='_blank']").forEach((link) => {
        link.setAttribute("rel", "noopener noreferrer");
    });

    updateOnScroll();
});

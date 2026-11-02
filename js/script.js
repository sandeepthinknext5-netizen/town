/* ==========================================================================
   Town Square Realtors — Application script (Vanilla JS)
   Sections: layout injection, navbar, renderers, filtering, gallery,
   carousel, counters, reveal, forms, utilities.
   ========================================================================== */

(function () {
  "use strict";

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const PAGE = document.body.dataset.page || "";

  const qs = (key) => new URLSearchParams(window.location.search).get(key);
  const agentById = (id) => AGENTS.find((a) => a.id === id) || AGENTS[0];

  /* ------------------------------------------------------------------
     Favourites (persisted in localStorage where available)
  ------------------------------------------------------------------ */
  const FAV_KEY = "ev-favourites";
  let favourites = [];
  try {
    favourites = JSON.parse(localStorage.getItem(FAV_KEY) || "[]");
  } catch (e) {
    favourites = [];
  }
  const isFav = (id) => favourites.includes(id);
  function toggleFav(id) {
    favourites = isFav(id) ? favourites.filter((f) => f !== id) : favourites.concat(id);
    try {
      localStorage.setItem(FAV_KEY, JSON.stringify(favourites));
    } catch (e) {
      /* storage unavailable — favourites stay in-memory for this session */
    }
  }

  /* ------------------------------------------------------------------
     Shared layout: header + footer injected on every page
  ------------------------------------------------------------------ */
  const NAV_LINKS = [
    { href: "index.html", label: "Home", key: "home" },
    { href: "about.html", label: "About Us", key: "about" },
    {
      href: "properties.html", label: "Properties", key: "properties", dropdown: [
        { href: "properties.html?type=Apartment", label: "Residential Apartments" },
        { href: "properties.html?type=Villa", label: "Luxury Villas & Homes" },
        { href: "properties.html?type=Commercial", label: "Commercial Properties" },
        { href: "properties.html?type=Plot", label: "Residential Plots" },
        { href: "properties.html?status=For+Rent", label: "Rental Properties" },
      ]
    },
    { href: "services.html", label: "Services", key: "services" },
    { href: "contact.html", label: "Contact Us", key: "contact" },
  ];

  function navMarkup() {
    const items = NAV_LINKS.map((l) => {
      const active = l.key === PAGE || (l.key === "properties" && PAGE === "property-details") ||
        (l.key === "agents" && PAGE === "agent-details") || (l.key === "blog" && PAGE === "blog-details");
      const cls = "nav-link" + (active ? " active" : "");
      if (l.dropdown) {
        return `<li class="nav-item dropdown">
            <a class="${cls} dropdown-toggle" href="${l.href}" role="button" data-bs-toggle="dropdown" aria-expanded="false"${active ? ' aria-current="page"' : ""}>${l.label}</a>
            <ul class="dropdown-menu">
              <li><a class="dropdown-item" href="properties.html">All Properties</a></li>
              ${l.dropdown.map((d) => `<li><a class="dropdown-item" href="${d.href}">${d.label}</a></li>`).join("")}
            </ul>
          </li>`;
      }
      return `<li class="nav-item"><a class="${cls}" href="${l.href}"${active ? ' aria-current="page"' : ""}>${l.label}</a></li>`;
    }).join("");

    return `
    <a class="skip-link" href="#main">Skip to main content</a>
    <nav class="ev-navbar navbar navbar-expand-lg" id="evNavbar" aria-label="Main navigation">
      <div class="container">
        <a class="navbar-brand" href="index.html" aria-label="Town Square Realtors — home">
          <img class="ev-brand-logo ev-brand-logo-light" src="images/town-square-logo-white.png" alt="Town Square Realtors">
          <img class="ev-brand-logo ev-brand-logo-solid" src="images/town-logo.webp" alt="" aria-hidden="true">
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#evNav"
                aria-controls="evNav" aria-expanded="false" aria-label="Toggle navigation">
          <i class="fa-solid fa-bars" aria-hidden="true"></i>
        </button>
        <div class="collapse navbar-collapse" id="evNav">
          <ul class="navbar-nav mx-lg-auto align-items-lg-center">${items}</ul>
          <div class="mt-3 mt-lg-0 d-flex align-items-center gap-2">
            <a class="btn btn-ev btn-sm" href="tel:+917340841100">
              <i class="fa-solid fa-phone me-1" aria-hidden="true"></i> +91 7340841100
            </a>
          </div>
        </div>
      </div>
    </nav>`;
  }

  function footerMarkup() {
    return `
    <footer class="ev-footer">
      <div class="container">
        <div class="row g-4 g-lg-5">
          <div class="col-lg-4 col-md-6">
            <a class="navbar-brand d-inline-flex align-items-center gap-2 mb-3" href="index.html">
              <img class="ev-brand-logo" src="images/town-square-logo.webp" alt="Town Square Realtors">
            </a>
            <p class="text-accent fw-semibold mb-2" style="font-size:0.95rem">Where Your Dream Address Becomes Reality.</p>
            <p class="mb-4" style="max-width:36ch;font-size:0.92rem;color:#555e68">Your destination for exploring residential and commercial real estate opportunities across Zirakpur, Chandigarh, Mohali, Panchkula and surrounding locations.</p>
            <div class="social-row">
              <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <i class="fa-brands fa-facebook-f" aria-hidden="true"></i>
              </a>
              <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <i class="fa-brands fa-instagram" aria-hidden="true"></i>
              </a>
              <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                <i class="fa-brands fa-twitter" aria-hidden="true"></i>
              </a>
              <a href="https://www.youtube.com/" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                <i class="fa-brands fa-youtube" aria-hidden="true"></i>
              </a>
            </div>
          </div>
          <div class="col-lg-2 col-md-6 col-6">
            <h5>QUICK LINKS</h5>
            <ul>
              <li><a href="index.html">Home</a></li>
              <li><a href="about.html">About Us</a></li>
              <li><a href="properties.html?status=For+Sale">Buy Property</a></li>
              <li><a href="properties.html?status=For+Rent">Rent Property</a></li>
              <li><a href="properties.html?type=Commercial">Commercial Properties</a></li>
              <li><a href="contact.html?intent=list">Sell Your Property</a></li>
              <li><a href="services.html">Our Services</a></li>
              <li><a href="contact.html">Contact Us</a></li>
            </ul>
          </div>
          <div class="col-lg-3 col-md-6 col-6">
            <h5>PROPERTY CATEGORIES</h5>
            <ul>
              <li><a href="properties.html?type=Apartment">Residential Apartments</a></li>
              <li><a href="properties.html?type=Villa">Luxury Villas</a></li>
              <li><a href="properties.html?type=House">Independent Houses</a></li>
              <li><a href="properties.html?type=Commercial">Commercial Properties</a></li>
              <li><a href="properties.html?type=Plot">Residential Plots</a></li>
              <li><a href="properties.html?status=For+Rent">Rental Properties</a></li>
            </ul>
          </div>
          <div class="col-lg-3 col-md-6">
            <h5>CONTACT INFORMATION</h5>
            <ul class="mb-4">
              <li><i class="fa-solid fa-user me-2 text-accent" aria-hidden="true"></i>Contact Person: <strong>Mr. Vishul</strong></li>
              <li><i class="fa-solid fa-phone me-2 text-accent" aria-hidden="true"></i>Phone: <a href="tel:+917340841100">+91 7340841100</a>, <a href="tel:+917340861100">+91 7340861100</a></li>
              <li><i class="fa-brands fa-whatsapp me-2 text-accent" aria-hidden="true"></i>WhatsApp: <a href="https://wa.me/917340841100" target="_blank" rel="noopener">+91 7340841100</a></li>
              <li><i class="fa-solid fa-envelope me-2 text-accent" aria-hidden="true"></i>Email: <a href="mailto:info.townsquare32@gmail.com">info.townsquare32@gmail.com</a></li>
              <li class="mt-2"><i class="fa-solid fa-location-dot me-2 text-accent" aria-hidden="true"></i>SCO-32, 2nd Floor, La-Mer, Opp. Dhillon Plaza, Airport Road, Zirakpur, Punjab – 140603</li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
          <span class="fw-semibold text-dark">TOWN SQUARE REALTORS – YOUR PROPERTY GOALS, OUR PROFESSIONAL GUIDANCE.</span>
          <span>© 2026 Town Square Realtors. All Rights Reserved.</span>
        </div>
      </div>
    </footer>
    <div class="float-stack">
      <a class="float-btn float-call" href="tel:+917340841100" aria-label="Call Town Square Realtors">
        <i class="fa-solid fa-phone" aria-hidden="true"></i>
        <span class="float-label">Call</span>
      </a>
      <a class="float-btn float-whatsapp" href="https://wa.me/917340841100?text=Hello%20Town%20Square%20Realtors%2C%20I%20am%20interested%20in%20property%20opportunities" target="_blank" rel="noopener" aria-label="Chat with us on WhatsApp">
        <i class="fa-brands fa-whatsapp" aria-hidden="true"></i>
        <span class="float-label">WhatsApp</span>
      </a>
    </div>`;
  }

  function injectLayout() {
    const header = $("#site-header");
    const footer = $("#site-footer");
    if (header && !header.innerHTML.trim()) header.innerHTML = navMarkup();
    if (footer && !footer.innerHTML.trim()) footer.innerHTML = footerMarkup();
  }

  /* ------------------------------------------------------------------
     Navbar: transparent over hero, solid after scroll
  ------------------------------------------------------------------ */
  function initNavbar() {
    const nav = $("#evNavbar");
    if (!nav) return;
    const overHero = document.body.hasAttribute("data-transparent-nav");
    const update = () => {
      const solid = !overHero || window.scrollY > 60;
      nav.classList.toggle("is-solid", solid);
    };
    update();
    window.addEventListener("scroll", () => {
      update();

      const collapse = $("#evNav");
      if (
        window.matchMedia("(max-width: 991.98px)").matches &&
        collapse &&
        collapse.classList.contains("show")
      ) {
        window.bootstrap.Collapse.getOrCreateInstance(collapse).hide();
      }
    }, { passive: true });

    // Close the mobile menu after navigating to an in-page anchor
    $$("#evNav .nav-link:not(.dropdown-toggle)").forEach((link) => {
      link.addEventListener("click", () => {
        const collapse = $("#evNav");
        if (collapse && collapse.classList.contains("show")) {
          window.bootstrap.Collapse.getOrCreateInstance(collapse).hide();
        }
      });
    });
  }

  /* ------------------------------------------------------------------
     Property card renderer (shared by home + properties pages)
  ------------------------------------------------------------------ */
  function propertyCard(p) {
    const specs =
      p.type === "Commercial"
        ? `<span><i class="fa-solid fa-users" aria-hidden="true"></i>${Math.round(p.area / 80)} desks</span>
           <span><i class="fa-solid fa-restroom" aria-hidden="true"></i>${p.bathrooms} baths</span>`
        : `<span><i class="fa-solid fa-bed" aria-hidden="true"></i>${p.bedrooms} beds</span>
           <span><i class="fa-solid fa-bath" aria-hidden="true"></i>${p.bathrooms} baths</span>`;
    return `
    <article class="property-card">
      <div class="property-media">
        <img src="${p.image}" alt="${p.title} in ${p.location}" loading="lazy" width="800" height="600">
        <div class="badge-stack">
          ${p.featured ? '<span class="ev-badge accent">Featured</span>' : ""}
          <span class="ev-badge dark">${p.status}</span>
        </div>
        <button class="fav-btn${isFav(p.id) ? " is-active" : ""}" type="button" data-fav="${p.id}"
                aria-pressed="${isFav(p.id)}" aria-label="Save ${p.title} to favourites">
          <i class="fa-${isFav(p.id) ? "solid" : "regular"} fa-heart" aria-hidden="true"></i>
        </button>
      </div>
      <div class="property-body">
        <h3 class="property-title"><a href="property-details.html?id=${p.id}">${p.title}</a></h3>
        <p class="property-loc mb-0"><i class="fa-solid fa-location-dot me-1 text-accent" aria-hidden="true"></i>${p.location}</p>
        <div class="property-specs">
          ${specs}
          <span><i class="fa-solid fa-ruler-combined" aria-hidden="true"></i>${p.area.toLocaleString()} sq ft</span>
        </div>
        <div class="mt-3">
          <a class="btn btn-ev-outline btn-sm w-100" href="property-details.html?id=${p.id}">View Details</a>
        </div>
      </div>
    </article>`;
  }

  function renderProperties(container, list, colClass) {
    container.innerHTML = list
      .map((p) => `<div class="col ${colClass || ""} property-col">${propertyCard(p)}</div>`)
      .join("");
    bindFavButtons(container);
    observeReveal(container);
  }

  function bindFavButtons(scope) {
    $$("[data-fav]", scope).forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = Number(btn.dataset.fav);
        toggleFav(id);
        const active = isFav(id);
        btn.classList.toggle("is-active", active);
        btn.setAttribute("aria-pressed", String(active));
        const icon = $("i", btn);
        icon.className = `fa-${active ? "solid" : "regular"} fa-heart`;
      });
    });
  }

  /* ------------------------------------------------------------------
     Home page
  ------------------------------------------------------------------ */
  function initHome() {
    const quickEnquiryForm = $("#quickEnquiryForm");
    if (quickEnquiryForm) {
      quickEnquiryForm.addEventListener("submit", (event) => {
        event.preventDefault();
        if (!quickEnquiryForm.reportValidity()) return;

        const formData = new FormData(quickEnquiryForm);
        const message = [
          "Hello Town Square Realtors, I would like to make an enquiry.",
          `Name: ${formData.get("name")}`,
          `Email: ${formData.get("email")}`,
          `Phone: ${formData.get("phone")}`,
        ].join("\n");
        const whatsappUrl = `https://wa.me/917340841100?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, "_blank", "noopener,noreferrer");
        $("#quickEnquiryStatus").textContent = "Your enquiry is ready in WhatsApp.";
        quickEnquiryForm.reset();
      });
    }

    const heroSlider = $("#heroPropertySlider");
    if (heroSlider) {
      const slides = PROPERTIES.filter((property) => property.featured);
      const hero = $(".ev-hero");
      const headline = $(".ev-hero h1");
      const image = $("#heroPropertyImage");
      const title = $("#heroPropertyTitle");
      const location = $("#heroPropertyLocation");
      const count = $("#heroPropertyCount");
      let activeSlide = 0;
      let timer;

      const showSlide = (index) => {
        activeSlide = (index + slides.length) % slides.length;
        const property = slides[activeSlide];
        const backgroundImage = property.image
          .replace(/w=\d+/, "w=1920")
          .replace(/q=\d+/, "q=75");

        hero.style.backgroundImage = `url("${backgroundImage}")`;
        image.classList.add("is-changing");
        image.onload = () => image.classList.remove("is-changing");
        headline.textContent = property.title;
        title.textContent = property.title;
        location.textContent = property.location;
        count.textContent = `${String(activeSlide + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}`;
        image.alt = `Featured property: ${property.title}, ${property.location}`;
        image.src = property.image;
      };

      const stopTimer = () => window.clearInterval(timer);
      const resumeTimerWhenUnfocused = (event) => {
        if (!heroSlider.contains(event.relatedTarget)) startTimer();
      };
      const startTimer = () => {
        stopTimer();
        if (slides.length > 1 && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          timer = window.setInterval(() => showSlide(activeSlide + 1), 3000);
        }
      };

      $("#heroPropertyPrev").addEventListener("click", () => {
        showSlide(activeSlide - 1);
        startTimer();
      });
      $("#heroPropertyNext").addEventListener("click", () => {
        showSlide(activeSlide + 1);
        startTimer();
      });
      heroSlider.addEventListener("mouseenter", stopTimer);
      heroSlider.addEventListener("mouseleave", startTimer);
      heroSlider.addEventListener("focusin", stopTimer);
      heroSlider.addEventListener("focusout", resumeTimerWhenUnfocused);

      showSlide(0);
      startTimer();
    }

    const featured = $("#featuredGrid");
    if (featured) {
      renderProperties(featured, PROPERTIES.filter((p) => p.featured).slice(0, 6));
    }

    const locGrid = $("#locationsGrid");
    if (locGrid) {
      locGrid.innerHTML = LOCATIONS.map(
        (l) => `
        <div class="col-md-6 col-lg-4 reveal">
          <a class="location-card" href="properties.html?location=${encodeURIComponent(l.name)}">
            <img src="${l.image}" alt="Property in the ${l.name} district" loading="lazy" width="800" height="600">
            <div class="loc-body">
              <h3>${l.name}</h3>
              <p>${l.count} ${l.count === 1 ? "property" : "properties"} available</p>
              <span class="btn btn-ev-light btn-sm mt-3 align-self-start">Explore</span>
            </div>
          </a>
        </div>`
      ).join("");
      observeReveal(locGrid);
    }

    const agentsGrid = $("#homeAgents");
    if (agentsGrid) renderAgents(agentsGrid, AGENTS.slice(0, 4));

    const blogGrid = $("#homeBlog");
    if (blogGrid) renderPosts(blogGrid, POSTS.slice(0, 3));

    // Hero search forwards its values to the properties page as query params
    const heroForm = $("#heroSearch");
    if (heroForm) {
      heroForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const params = new URLSearchParams();
        new FormData(heroForm).forEach((value, key) => {
          if (value) params.set(key, value);
        });
        window.location.href = "properties.html?" + params.toString();
      });
    }
  }

  /* ------------------------------------------------------------------
     Properties page: filtering, sorting, view toggle, load more
  ------------------------------------------------------------------ */
  const PAGE_SIZE = 6;

  function initPropertiesPage() {
    const grid = $("#propertyGrid");
    if (!grid) return;

    const form = $("#filterForm");
    const countEl = $("#resultCount");
    const sortSel = $("#sortSelect");
    const loadMore = $("#loadMoreBtn");
    const emptyMsg = $("#noResults");
    let shown = PAGE_SIZE;
    let current = PROPERTIES.slice();

    // Pre-fill filters from URL (links from the navbar, footer and hero search)
    const params = new URLSearchParams(window.location.search);
    ["keyword", "location", "type", "status", "minPrice", "maxPrice", "bedrooms", "bathrooms", "minArea"].forEach((k) => {
      const field = form.elements[k];
      if (field && params.get(k)) field.value = params.get(k);
    });

    function applyFilters(resetPaging = true) {
      const f = Object.fromEntries(new FormData(form).entries());
      current = PROPERTIES.filter((p) => {
        if (f.keyword) {
          const hay = `${p.title} ${p.location} ${p.type} ${p.description}`.toLowerCase();
          if (!hay.includes(f.keyword.toLowerCase().trim())) return false;
        }
        if (f.location && p.location !== f.location) return false;
        if (f.type && p.type !== f.type) return false;
        if (f.status && p.status !== f.status) return false;
        if (f.minPrice && p.price < Number(f.minPrice)) return false;
        if (f.maxPrice && p.price > Number(f.maxPrice)) return false;
        if (f.bedrooms && p.bedrooms < Number(f.bedrooms)) return false;
        if (f.bathrooms && p.bathrooms < Number(f.bathrooms)) return false;
        if (f.minArea && p.area < Number(f.minArea)) return false;
        return true;
      });
      sortList();
      if (resetPaging) shown = PAGE_SIZE;
      draw();
    }

    function sortList() {
      const mode = sortSel ? sortSel.value : "latest";
      const by = {
        "price-asc": (a, b) => a.price - b.price,
        "price-desc": (a, b) => b.price - a.price,
        latest: (a, b) => new Date(b.added) - new Date(a.added),
        popular: (a, b) => b.popularity - a.popularity,
      }[mode];
      current.sort(by);
    }

    function draw() {
      const slice = current.slice(0, shown);
      renderProperties(grid, slice);
      if (countEl) countEl.textContent = `${current.length} ${current.length === 1 ? "property" : "properties"} found`;
      if (emptyMsg) emptyMsg.classList.toggle("d-none", current.length !== 0);
      if (loadMore) loadMore.classList.toggle("d-none", shown >= current.length);
    }

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      applyFilters();
    });
    $("#resetFilters").addEventListener("click", () => {
      form.reset();
      if (sortSel) sortSel.value = "latest";
      applyFilters();
    });
    if (sortSel) sortSel.addEventListener("change", () => applyFilters(false));
    if (loadMore)
      loadMore.addEventListener("click", () => {
        shown += PAGE_SIZE;
        draw();
      });

    // Grid / list view toggle
    $$("[data-view]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const list = btn.dataset.view === "list";
        grid.classList.toggle("view-list", list);
        grid.classList.toggle("row-cols-md-2", !list);
        grid.classList.toggle("row-cols-lg-3", !list);
        $$("[data-view]").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
      });
    });

    applyFilters();
  }

  /* ------------------------------------------------------------------
     Property details page
  ------------------------------------------------------------------ */
  function initPropertyDetails() {
    const root = $("#propertyDetail");
    if (!root) return;
    const id = Number(qs("id")) || 1;
    const p = PROPERTIES.find((x) => x.id === id) || PROPERTIES[0];
    const agent = agentById(p.agent);

    document.title = `${p.title}, ${p.location} — Town Square Realtors`;
    const md = $('meta[name="description"]');
    if (md) md.setAttribute("content", p.description.slice(0, 155));

    $("#pdTitle").textContent = p.title;
    $("#pdCrumb").textContent = p.title;
    $("#pdLocation").innerHTML = `<i class="fa-solid fa-location-dot me-1 text-accent" aria-hidden="true"></i>${p.address}`;
    $("#pdStatus").textContent = p.status;
    $("#pdType").textContent = p.type;
    $("#pdDescription").textContent = p.description;

    // Specification boxes
    const specs = [
      { icon: "fa-bed", label: "Bedrooms", value: p.bedrooms || "—" },
      { icon: "fa-bath", label: "Bathrooms", value: p.bathrooms },
      { icon: "fa-car", label: "Parking", value: p.parking },
      { icon: "fa-ruler-combined", label: "Area", value: p.area.toLocaleString() + " sq ft" },
      { icon: "fa-calendar", label: "Year Built", value: p.year },
      { icon: "fa-building", label: "Type", value: p.type },
    ];
    $("#pdSpecs").innerHTML = specs
      .map(
        (s) => `<div class="col-6 col-md-4 col-lg-2">
          <div class="spec-box"><i class="fa-solid ${s.icon}" aria-hidden="true"></i><strong>${s.value}</strong><span>${s.label}</span></div>
        </div>`
      )
      .join("");

    $("#pdFeatures").innerHTML = p.features
      .map(
        (f) => `<div class="col-6 col-md-4">
          <div class="feature-item"><i class="fa-solid ${FEATURE_ICONS[f] || "fa-check"}" aria-hidden="true"></i>${f}</div>
        </div>`
      )
      .join("");

    // Agent card
    $("#pdAgent").innerHTML = `
      <img src="${agent.photo}" alt="${agent.name}, ${agent.role}" class="rounded-circle mb-3" width="84" height="84" style="object-fit:cover" loading="lazy">
      <h3 class="h5 mb-1">${agent.name}</h3>
      <p class="text-muted-2 small mb-3">${agent.role}</p>
      <ul class="list-unstyled small mb-3">
        <li class="mb-1"><i class="fa-solid fa-phone me-2 text-accent" aria-hidden="true"></i><a href="tel:${agent.phone.replace(/[^+\d]/g, "")}">${agent.phone}</a></li>
        <li><i class="fa-solid fa-envelope me-2 text-accent" aria-hidden="true"></i><a href="mailto:${agent.email}">${agent.email}</a></li>
      </ul>
      <div class="d-grid gap-2">
        <a class="btn btn-ev" href="agent-details.html?agent=${agent.slug}">Contact Agent</a>
        <a class="btn btn-ev-outline" href="https://wa.me/${agent.whatsapp}" target="_blank" rel="noopener">
          <i class="fa-brands fa-whatsapp me-1" aria-hidden="true"></i> WhatsApp
        </a>
      </div>`;

    $("#pdMapLabel").textContent = p.address;

    // Similar properties: same type first, then same location
    const similar = PROPERTIES.filter((x) => x.id !== p.id && (x.type === p.type || x.location === p.location)).slice(0, 3);
    renderProperties($("#pdSimilar"), similar);

    initGallery(p);
  }

  /* ------------------------------------------------------------------
     Gallery + lightbox
  ------------------------------------------------------------------ */
  function initGallery(p) {
    const mainImg = $("#galleryMain");
    const strip = $("#galleryThumbs");
    if (!mainImg || !strip) return;
    let index = 0;

    strip.innerHTML = p.gallery
      .map(
        (src, i) =>
          `<button type="button" data-index="${i}" class="${i === 0 ? "is-active" : ""}" aria-label="Show image ${i + 1} of ${p.gallery.length}">
             <img src="${src}" alt="${p.title} — view ${i + 1}" loading="lazy" width="300" height="225">
           </button>`
      )
      .join("");

    function show(i) {
      index = (i + p.gallery.length) % p.gallery.length;
      mainImg.src = p.gallery[index];
      mainImg.alt = `${p.title} — view ${index + 1}`;
      $$("button", strip).forEach((b, bi) => b.classList.toggle("is-active", bi === index));
    }

    show(0);
    strip.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-index]");
      if (btn) show(Number(btn.dataset.index));
    });
    $("#galleryPrev").addEventListener("click", () => show(index - 1));
    $("#galleryNext").addEventListener("click", () => show(index + 1));

    // Lightbox
    const lb = $("#lightbox");
    const lbImg = $("#lightboxImg");
    const open = () => {
      lbImg.src = p.gallery[index];
      lbImg.alt = mainImg.alt;
      lb.classList.add("is-open");
      $("#lightboxClose").focus();
    };
    const close = () => lb.classList.remove("is-open");
    $("#galleryOpen").addEventListener("click", open);
    mainImg.addEventListener("click", open);
    $("#lightboxClose").addEventListener("click", close);
    lb.addEventListener("click", (e) => {
      if (e.target === lb) close();
    });
    document.addEventListener("keydown", (e) => {
      if (!lb.classList.contains("is-open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") { show(index + 1); lbImg.src = p.gallery[index]; }
      if (e.key === "ArrowLeft") { show(index - 1); lbImg.src = p.gallery[index]; }
    });
  }

  /* ------------------------------------------------------------------
     Agents
  ------------------------------------------------------------------ */
  function renderAgents(container, list) {
    container.innerHTML = list
      .map(
        (a) => `
      <div class="col-sm-6 col-lg-4 col-xl-3 reveal">
        <article class="agent-card">
          <div class="agent-media">
            <img src="${a.photo}" alt="${a.name}, ${a.role}" loading="lazy" width="600" height="600">
            <div class="agent-social">
              <a href="${a.socials.facebook}" aria-label="${a.name} on Facebook"><i class="fa-brands fa-facebook-f" aria-hidden="true"></i></a>
              <a href="${a.socials.instagram}" aria-label="${a.name} on Instagram"><i class="fa-brands fa-instagram" aria-hidden="true"></i></a>
              <a href="${a.socials.linkedin}" aria-label="${a.name} on LinkedIn"><i class="fa-brands fa-linkedin-in" aria-hidden="true"></i></a>
            </div>
          </div>
          <div class="p-4">
            <h3 class="h5 mb-1"><a href="agent-details.html?agent=${a.slug}" class="text-reset">${a.name}</a></h3>
            <p class="small text-muted-2 mb-2">${a.role}</p>
            <p class="small text-muted-2 mb-3"><i class="fa-regular fa-clock me-1 text-accent" aria-hidden="true"></i>${a.experience}</p>
            <ul class="list-unstyled small mb-0">
              <li class="mb-1"><i class="fa-solid fa-phone me-2 text-accent" aria-hidden="true"></i><a href="tel:${a.phone.replace(/[^+\d]/g, "")}">${a.phone}</a></li>
              <li><i class="fa-solid fa-envelope me-2 text-accent" aria-hidden="true"></i><a href="mailto:${a.email}">${a.email}</a></li>
            </ul>
          </div>
        </article>
      </div>`
      )
      .join("");
    observeReveal(container);
  }

  function initAgentsPage() {
    const grid = $("#agentsGrid");
    if (grid) renderAgents(grid, AGENTS);
  }

  function initAgentDetails() {
    const root = $("#agentDetail");
    if (!root) return;
    const slug = qs("agent");
    const a = AGENTS.find((x) => x.slug === slug) || AGENTS[0];

    document.title = `${a.name} — ${a.role} | Town Square Realtors`;
    $("#adPhoto").src = a.photo;
    $("#adPhoto").alt = `${a.name}, ${a.role}`;
    $("#adName").textContent = a.name;
    $("#adCrumb").textContent = a.name;
    $("#adRole").textContent = a.role;
    $("#adBio").textContent = a.bio;
    $("#adExperience").textContent = a.experience;
    $("#adLanguages").textContent = a.languages;
    $("#adListings").textContent = a.listings + " active listings";
    $("#adPhone").textContent = a.phone;
    $("#adPhone").href = "tel:" + a.phone.replace(/[^+\d]/g, "");
    $("#adEmail").textContent = a.email;
    $("#adEmail").href = "mailto:" + a.email;
    $("#adWhatsapp").href = "https://wa.me/" + a.whatsapp;

    const listings = PROPERTIES.filter((p) => p.agent === a.id);
    renderProperties($("#adListingsGrid"), listings.length ? listings : PROPERTIES.slice(0, 3));
  }

  /* ------------------------------------------------------------------
     Blog
  ------------------------------------------------------------------ */
  function renderPosts(container, list) {
    container.innerHTML = list
      .map(
        (b) => `
      <div class="col-md-6 col-lg-4 reveal">
        <article class="blog-card">
          <a class="blog-media d-block" href="blog-details.html?slug=${b.slug}" aria-label="${b.title}">
            <img src="${b.image}" alt="${b.title}" loading="lazy" width="800" height="500">
          </a>
          <div class="p-4 d-flex flex-column flex-grow-1">
            <div class="blog-meta mb-2">
              <span class="text-accent fw-semibold text-uppercase">${b.category}</span>
              <span class="mx-2">·</span>${b.date}<span class="mx-2">·</span>${b.author}
            </div>
            <h3 class="h5 mb-2"><a href="blog-details.html?slug=${b.slug}" class="text-reset">${b.title}</a></h3>
            <p class="small text-muted-2">${b.excerpt}</p>
            <a class="btn btn-ev-outline btn-sm mt-auto align-self-start" href="blog-details.html?slug=${b.slug}">Read More</a>
          </div>
        </article>
      </div>`
      )
      .join("");
    observeReveal(container);
  }

  function initBlogPage() {
    const grid = $("#blogGrid");
    if (grid) renderPosts(grid, POSTS);
  }

  function initBlogDetails() {
    const root = $("#blogDetail");
    if (!root) return;
    const slug = qs("slug");
    const post = POSTS.find((p) => p.slug === slug) || POSTS[0];
    const author = AGENTS.find((a) => a.name === post.author) || AGENTS[0];

    document.title = `${post.title} — Town Square Realtors Journal`;
    const md = $('meta[name="description"]');
    if (md) md.setAttribute("content", post.excerpt);

    $("#bdTitle").textContent = post.title;
    $("#bdCrumb").textContent = post.title;
    $("#bdCategory").textContent = post.category;
    $("#bdMeta").textContent = `${post.date} · ${post.author}`;
    $("#bdImage").src = post.image;
    $("#bdImage").alt = post.title;
    $("#bdLead").textContent = post.excerpt;
    $("#bdAuthorPhoto").src = author.photo;
    $("#bdAuthorPhoto").alt = author.name;
    $("#bdAuthorName").textContent = post.author;
    $("#bdAuthorRole").textContent = author.role;
    $("#bdAuthorBio").textContent = author.bio;

    renderPosts($("#bdRelated"), POSTS.filter((p) => p.slug !== post.slug).slice(0, 3));

    // Share links resolve against the live URL of the current article
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(post.title);
    const map = {
      bdShareFacebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      bdShareX: `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
      bdShareLinkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      bdShareWhatsapp: `https://wa.me/?text=${text}%20${url}`,
    };
    Object.entries(map).forEach(([id, href]) => {
      const el = document.getElementById(id);
      if (el) el.href = href;
    });
  }

  /* ------------------------------------------------------------------
     Services / testimonials shared renderers
  ------------------------------------------------------------------ */
  function initServices() {
    const grid = $("#servicesGrid");
    if (!grid) return;
    grid.innerHTML = SERVICES.map(
      (s) => `
      <div class="col-md-6 col-lg-3 reveal">
        <div class="ev-card">
          <div class="ev-icon"><i class="fa-solid ${s.icon}" aria-hidden="true"></i></div>
          <h3 class="h5 mb-2">${s.title}</h3>
          <p class="small text-muted-2">${s.text}</p>
          <a class="btn btn-ev-outline btn-sm" href="contact.html?service=${encodeURIComponent(s.title)}">Learn More</a>
        </div>
      </div>`
    ).join("");
    observeReveal(grid);
  }

  function initTestimonials() {
    const track = $("#testiTrack");
    if (!track) return;
    let page = 0;
    const perPage = () => (window.innerWidth >= 992 ? 3 : window.innerWidth >= 768 ? 2 : 1);

    function draw() {
      const per = perPage();
      const pages = Math.ceil(TESTIMONIALS.length / per);
      page = ((page % pages) + pages) % pages;
      const slice = TESTIMONIALS.slice(page * per, page * per + per);
      track.innerHTML = slice
        .map(
          (t) => `
        <div class="col-md-6 col-lg-4">
          <div class="testimonial-card">
            <div class="stars mb-3" aria-label="${t.rating} out of 5 stars">
              ${'<i class="fa-solid fa-star" aria-hidden="true"></i>'.repeat(t.rating)}${'<i class="fa-regular fa-star" aria-hidden="true"></i>'.repeat(5 - t.rating)}
            </div>
            <p class="mb-4">“${t.text}”</p>
            <div class="d-flex align-items-center gap-3">
              <img src="${t.photo}" alt="${t.name}" class="testi-avatar" loading="lazy" width="54" height="54">
              <div>
                <strong class="d-block" style="font-family:'DM Sans',sans-serif">${t.name}</strong>
                <span class="small text-muted-2">${t.location}</span>
              </div>
            </div>
          </div>
        </div>`
        )
        .join("");
    }

    draw();
    $("#testiPrev").addEventListener("click", () => { page--; draw(); });
    $("#testiNext").addEventListener("click", () => { page++; draw(); });
    window.addEventListener("resize", draw);
    // Gentle auto-advance, paused while hovering the carousel
    let timer = setInterval(() => { page++; draw(); }, 7000);
    track.addEventListener("mouseenter", () => clearInterval(timer));
    track.addEventListener("mouseleave", () => {
      timer = setInterval(() => { page++; draw(); }, 7000);
    });
  }

  /* ------------------------------------------------------------------
     Animated counters
  ------------------------------------------------------------------ */
  function initCounters() {
    const counters = $$("[data-count]");
    if (!counters.length) return;
    const run = (el) => {
      const target = Number(el.dataset.count);
      const suffix = el.dataset.suffix || "";
      const duration = 1600;
      const start = performance.now();
      const step = (now) => {
        const t = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
        el.textContent = Math.round(target * eased).toLocaleString() + suffix;
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            run(entry.target);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    counters.forEach((c) => io.observe(c));
  }

  /* ------------------------------------------------------------------
     Scroll reveal
  ------------------------------------------------------------------ */
  let revealObserver;
  function observeReveal(scope) {
    if (!revealObserver) {
      revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add("is-visible");
              revealObserver.unobserve(e.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
      );
    }
    $$(".reveal:not(.is-visible)", scope || document).forEach((el) => revealObserver.observe(el));
  }

  /* ------------------------------------------------------------------
     Forms: validation + inline success / error alerts
  ------------------------------------------------------------------ */
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function showAlert(el, ok, message) {
    if (!el) return;
    el.className = "ev-alert show " + (ok ? "ok" : "err");
    el.innerHTML = `<i class="fa-solid ${ok ? "fa-circle-check" : "fa-circle-exclamation"} me-2" aria-hidden="true"></i>${message}`;
  }

  function validateForm(form) {
    let valid = true;
    $$("[required]", form).forEach((field) => {
      const value = field.value.trim();
      let ok = value.length > 0;
      if (ok && field.type === "email") ok = EMAIL_RE.test(value);
      if (ok && field.type === "tel") ok = value.replace(/\D/g, "").length >= 7;
      field.classList.toggle("is-invalid", !ok);
      if (!ok) valid = false;
    });
    return valid;
  }

  function initForms() {
    $$("form[data-validate]").forEach((form) => {
      const alertEl = $(".ev-alert", form);
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        if (!validateForm(form)) {
          showAlert(alertEl, false, "Please complete the highlighted fields with valid details.");
          const firstBad = $(".is-invalid", form);
          if (firstBad) firstBad.focus();
          return;
        }
        showAlert(alertEl, true, form.dataset.success || "Thank you — your message has been sent. We will reply within one business day.");
        form.reset();
      });
      $$("input, textarea, select", form).forEach((f) =>
        f.addEventListener("input", () => f.classList.remove("is-invalid"))
      );
    });

    // Newsletter lives in the injected footer, so it is wired separately
    const nl = $("#newsletterForm");
    if (nl) {
      nl.addEventListener("submit", (e) => {
        e.preventDefault();
        const input = $("#newsletterEmail");
        const alertEl = $("#newsletterAlert");
        if (!EMAIL_RE.test(input.value.trim())) {
          showAlert(alertEl, false, "Please enter a valid email address.");
          input.focus();
          return;
        }
        showAlert(alertEl, true, "You're subscribed — market updates land every second Tuesday.");
        nl.reset();
      });
    }
  }

  /* ------------------------------------------------------------------
     Prefill contact form from query params (?intent=list / ?service=)
  ------------------------------------------------------------------ */
  function initContactPrefill() {
    const subject = document.getElementById("contactSubject");
    if (!subject) return;
    if (qs("intent") === "list") subject.value = "List my property with Town Square Realtors";
    else if (qs("service")) subject.value = `Enquiry: ${qs("service")}`;
  }

  /* ------------------------------------------------------------------
     Boot
  ------------------------------------------------------------------ */
  document.addEventListener("DOMContentLoaded", () => {
    injectLayout();
    initNavbar();
    initHome();
    initPropertiesPage();
    initPropertyDetails();
    initAgentsPage();
    initAgentDetails();
    initBlogPage();
    initBlogDetails();
    initServices();
    initTestimonials();
    initCounters();
    initForms();
    initContactPrefill();
    observeReveal(document);
  });
})();

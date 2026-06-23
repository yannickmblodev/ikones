const body = document.body;
body.classList.add("motion-ready");

const revealItems = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14 }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

const navToggle = document.querySelector("#nav-toggle");
document.querySelectorAll(".main-nav a").forEach((link) => {
  link.addEventListener("click", () => {
    if (navToggle) navToggle.checked = false;
  });
});

const slider = document.querySelector("[data-slider]");
const sliderTrack = document.querySelector(".slider-track");
const slides = [...document.querySelectorAll(".slide")];
const dots = [...document.querySelectorAll("[data-slider-dot]")];
const prevButton = document.querySelector("[data-slider-prev]");
const nextButton = document.querySelector("[data-slider-next]");
let activeSlide = 0;
let sliderTimer;

function showSlide(index) {
  if (!sliderTrack || slides.length === 0) return;

  activeSlide = (index + slides.length) % slides.length;
  sliderTrack.style.transform = `translateX(-${activeSlide * 100}%)`;

  slides.forEach((slide, slideIndex) => {
    slide.classList.toggle("is-active", slideIndex === activeSlide);
    slide.setAttribute("aria-hidden", slideIndex === activeSlide ? "false" : "true");
  });

  dots.forEach((dot, dotIndex) => {
    dot.classList.toggle("is-active", dotIndex === activeSlide);
  });
}

function startSlider() {
  stopSlider();
  sliderTimer = window.setInterval(() => showSlide(activeSlide + 1), 4800);
}

function stopSlider() {
  if (sliderTimer) window.clearInterval(sliderTimer);
}

prevButton?.addEventListener("click", () => {
  showSlide(activeSlide - 1);
  startSlider();
});

nextButton?.addEventListener("click", () => {
  showSlide(activeSlide + 1);
  startSlider();
});

dots.forEach((dot, index) => {
  dot.addEventListener("click", () => {
    showSlide(index);
    startSlider();
  });
});

if (slides.length > 0) {
  slider?.addEventListener("mouseenter", stopSlider);
  slider?.addEventListener("mouseleave", startSlider);
  slider?.addEventListener("focusin", stopSlider);
  slider?.addEventListener("focusout", startSlider);
  showSlide(0);
  startSlider();
}

const params = new URLSearchParams(window.location.search);
const filterButtons = [...document.querySelectorAll("[data-filter]")];
const shopProducts = [...document.querySelectorAll("[data-category]")];
const shopCount = document.querySelector("#shop-count");
const sizeOptions = ["S", "M", "L", "XL", "2XL", "3XL"];
const colorOptions = [
  { name: "Noir", value: "#14110f" },
  { name: "Rouge", value: "#8f1d1d" },
  { name: "Sable", value: "#c7a77e" },
  { name: "Ivoire", value: "#f3ead7" },
  { name: "Vert sauge", value: "#7f8d78" }
];

function syncSelectOptions(select, options) {
  if (!select) return;

  const current = select.value;
  select.innerHTML = options
    .map((option) => (option === "" ? `<option value="">Choisir</option>` : `<option>${option}</option>`))
    .join("");
  if (options.includes(current)) {
    select.value = current;
  }
}

function colorValue(name) {
  return colorOptions.find((color) => color.name === name)?.value || colorOptions[0].value;
}

function swatchMarkup(color, selectedColor = "Noir") {
  const isSelected = color.name === selectedColor;
  return `
    <button
      class="color-swatch${isSelected ? " is-selected" : ""}"
      type="button"
      role="radio"
      aria-label="${color.name}"
      aria-checked="${isSelected ? "true" : "false"}"
      data-color="${color.name}"
      style="--swatch: ${color.value}"
    >
      <span aria-hidden="true"></span>
    </button>
  `;
}

function syncColorSelect(select) {
  if (!select) return;

  const current = select.value || "Noir";
  select.innerHTML = colorOptions.map((color) => `<option>${color.name}</option>`).join("");
  select.value = colorOptions.some((color) => color.name === current) ? current : "Noir";
}

function updateSwatchGroup(swatch) {
  const group = swatch.closest(".color-swatch-group");
  if (!group) return;

  group.querySelectorAll(".color-swatch").forEach((button) => {
    const isSelected = button === swatch;
    button.classList.toggle("is-selected", isSelected);
    button.setAttribute("aria-checked", isSelected ? "true" : "false");
  });
}

function enhanceProductOptions() {
  document.querySelectorAll(".product-card").forEach((card) => {
    const sizeSelect = card.querySelector(".product-size");
    syncSelectOptions(sizeSelect, sizeOptions);

    if (card.querySelector(".color-swatch-group") || !card.querySelector(".cart-add")) return;

    const colorRow = document.createElement("div");
    colorRow.className = "card-size card-color";
    colorRow.innerHTML = `
      <span>Couleur</span>
      <div class="color-swatch-group" role="radiogroup" aria-label="Couleur ${card.querySelector("h3")?.textContent || "produit"}">
        ${colorOptions.map((color) => swatchMarkup(color)).join("")}
      </div>
    `;
    card.querySelector(".card-size")?.after(colorRow);
  });

  syncSelectOptions(document.querySelector("#order-size"), ["", ...sizeOptions]);
  syncColorSelect(document.querySelector("#order-color"));
}

enhanceProductOptions();

const orderColorSelect = document.querySelector("#order-color");
if (orderColorSelect) {
  orderColorSelect.classList.add("color-select-native");
  orderColorSelect.tabIndex = -1;
  orderColorSelect.setAttribute("aria-hidden", "true");
  if (!orderColorSelect.nextElementSibling?.classList.contains("order-color-swatches")) {
    const orderSwatches = document.createElement("div");
    orderSwatches.className = "order-color-swatches color-swatch-group";
    orderSwatches.setAttribute("role", "radiogroup");
    orderSwatches.setAttribute("aria-label", "Couleur de commande");
    orderSwatches.dataset.selectTarget = "#order-color";
    orderSwatches.innerHTML = colorOptions.map((color) => swatchMarkup(color, orderColorSelect.value || "Noir")).join("");
    orderColorSelect.after(orderSwatches);
  }
}

document.addEventListener("click", (event) => {
  const swatch = event.target.closest(".color-swatch");
  if (!swatch) return;

  updateSwatchGroup(swatch);

  const group = swatch.closest(".color-swatch-group");
  const selectTarget = group?.dataset.selectTarget;
  if (!selectTarget) return;

  const select = document.querySelector(selectTarget);
  if (!select) return;

  select.value = swatch.dataset.color || "Noir";
  select.dispatchEvent(new Event("input", { bubbles: true }));
});

document.addEventListener("keydown", (event) => {
  const swatch = event.target.closest?.(".color-swatch");
  const keys = ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"];
  if (!swatch || !keys.includes(event.key)) return;

  const group = swatch.closest(".color-swatch-group");
  const swatches = [...(group?.querySelectorAll(".color-swatch") || [])];
  const currentIndex = swatches.indexOf(swatch);
  if (currentIndex < 0) return;

  event.preventDefault();
  const direction = event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 1;
  const nextSwatch = swatches[(currentIndex + direction + swatches.length) % swatches.length];
  nextSwatch.focus();
  nextSwatch.click();
});

function runGsapScrollAnimations() {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!window.gsap || !window.ScrollTrigger || prefersReducedMotion) return;

  gsap.registerPlugin(ScrollTrigger);

  const animatedGroups = [
    ".product-grid",
    ".category-grid",
    ".journey",
    ".checkout-grid",
    ".contact-grid",
    ".footer-main"
  ];

  animatedGroups.forEach((selector) => {
    document.querySelectorAll(selector).forEach((group) => {
      const items = [...group.children].filter((item) => !item.classList.contains("is-hidden"));
      if (items.length === 0) return;

      gsap.from(items, {
        autoAlpha: 0,
        y: 58,
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.11,
        clearProps: "opacity,visibility,transform",
        scrollTrigger: {
          trigger: group,
          start: "top 82%",
          once: true
        }
      });
    });
  });

  document.querySelectorAll(".page-hero img, .atelier-image img").forEach((image) => {
    const trigger = image.closest(".page-hero, .atelier") || image;
    gsap.to(image, {
      yPercent: -7,
      ease: "none",
      scrollTrigger: {
        trigger,
        start: "top bottom",
        end: "bottom top",
        scrub: true
      }
    });
  });
}

runGsapScrollAnimations();

function applyShopFilter(filter) {
  if (shopProducts.length === 0) return;

  let visibleCount = 0;
  shopProducts.forEach((product) => {
    const categories = product.dataset.category || "";
    const isVisible = filter === "all" || categories.split(" ").includes(filter);
    product.classList.toggle("is-hidden", !isVisible);
    if (isVisible) visibleCount += 1;
  });

  filterButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.filter === filter);
  });

  if (shopCount) {
    shopCount.textContent = `${visibleCount} piece${visibleCount > 1 ? "s" : ""}`;
  }
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter || "all";
    applyShopFilter(filter);
  });
});

if (shopProducts.length > 0) {
  const requestedFilter = params.get("filter") || "all";
  const knownFilter = filterButtons.some((button) => button.dataset.filter === requestedFilter)
    ? requestedFilter
    : "all";
  applyShopFilter(knownFilter);
}

const CART_KEY = "maison-habaya-cart";
const cartCountNodes = document.querySelectorAll("[data-cart-count]");

function readCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

function writeCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();
  renderCheckout();
}

function formatPrice(value) {
  return `${new Intl.NumberFormat("fr-FR").format(value)} FCFA`;
}

function updateCartCount() {
  const count = readCart().reduce((total, item) => total + item.qty, 0);
  cartCountNodes.forEach((node) => {
    node.textContent = count;
  });
}

function createCartDialog() {
  let dialog = document.querySelector("#cart-dialog");
  if (dialog) return dialog;

  dialog = document.createElement("div");
  dialog.className = "cart-dialog";
  dialog.id = "cart-dialog";
  dialog.setAttribute("role", "dialog");
  dialog.setAttribute("aria-modal", "true");
  dialog.innerHTML = `
    <div class="cart-dialog-card">
      <p class="eyebrow">Ajout au panier reussi</p>
      <h2 id="cart-dialog-title">Ajout au panier reussi ...</h2>
      <p id="cart-dialog-copy"></p>
      <div class="cart-dialog-actions">
        <button class="button dark-button" type="button" data-cart-close>Continuer mes achats</button>
        <a class="button button-primary dark-button" href="paiement.html">Aller au paiement</a>
      </div>
    </div>
  `;
  document.body.appendChild(dialog);

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog || event.target.closest("[data-cart-close]")) {
      dialog.classList.remove("is-open");
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      dialog.classList.remove("is-open");
    }
  });

  return dialog;
}

function showCartDialog(item) {
  const dialog = createCartDialog();
  const title = dialog.querySelector("#cart-dialog-title");
  const copy = dialog.querySelector("#cart-dialog-copy");
  title.textContent = "Ajout au panier reussi ...";
  copy.textContent = `${item.name} - Taille ${item.size}, couleur ${item.color}. Vous pouvez continuer a ajouter d'autres produits au panier ou aller au paiement.`;
  dialog.classList.add("is-open");
  dialog.querySelector("[data-cart-close]")?.focus();
}

function addToCart(button) {
  const card = button.closest(".product-card");
  const size = card?.querySelector(".product-size")?.value || "M";
  const color = card?.querySelector(".color-swatch.is-selected")?.dataset.color || "Noir";
  const item = {
    id: button.dataset.id,
    name: button.dataset.name,
    price: Number(button.dataset.price || 0),
    priceLabel: button.dataset.priceLabel,
    image: button.dataset.image,
    size,
    color,
    qty: 1
  };
  const cart = readCart();
  const existing = cart.find(
    (entry) => entry.id === item.id && entry.size === item.size && (entry.color || "Noir") === item.color
  );

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push(item);
  }

  writeCart(cart);
  showCartDialog(item);
}

document.querySelectorAll(".cart-add").forEach((button) => {
  button.addEventListener("click", () => addToCart(button));
});

const orderSection = document.querySelector("#commande");
const orderForm = document.querySelector("#order-form");
const modelSelect = document.querySelector("#order-model");
const sizeSelect = document.querySelector("#order-size");
const colorSelect = document.querySelector("#order-color");
const nameInput = document.querySelector("#order-name");
const phoneInput = document.querySelector("#order-phone");
const noteInput = document.querySelector("#order-note");
const summaryModel = document.querySelector("#summary-model");
const summaryPrice = document.querySelector("#summary-price");
const summarySize = document.querySelector("#summary-size");
const summaryColor = document.querySelector("#summary-color");
const summaryMail = document.querySelector("#summary-mail");
const orderStatus = document.querySelector("#order-status");
const journeySteps = [...document.querySelectorAll("[data-step-card]")];
let orderSubmitted = false;

function selectedPrice() {
  const option = modelSelect?.selectedOptions?.[0];
  return option?.dataset.price || "Sur devis";
}

function setJourneyStep() {
  const hasSize = Boolean(sizeSelect?.value);
  const hasContact = Boolean(nameInput?.value.trim() || phoneInput?.value.trim());
  const activeStep = orderSubmitted ? 4 : hasContact ? 3 : hasSize ? 2 : 1;

  journeySteps.forEach((step, index) => {
    const stepNumber = index + 1;
    step.classList.toggle("is-active", stepNumber === activeStep);
    step.classList.toggle("is-complete", stepNumber < activeStep);
  });
}

function buildMailto() {
  const model = modelSelect?.value || "Modele a preciser";
  const price = selectedPrice();
  const size = sizeSelect?.value || "A preciser";
  const color = colorSelect?.value || "A preciser";
  const name = nameInput?.value.trim() || "A preciser";
  const phone = phoneInput?.value.trim() || "A preciser";
  const note = noteInput?.value.trim() || "Aucun detail";
  const subject = encodeURIComponent(`Commande Maison Habaya - ${model}`);
  const bodyText = [
    "Bonjour Maison Habaya,",
    "",
    "Je souhaite reserver une piece.",
    `Modele : ${model}`,
    `Prix indicatif : ${price}`,
    `Taille : ${size}`,
    `Couleur : ${color}`,
    `Nom : ${name}`,
    `Telephone : ${phone}`,
    `Details : ${note}`,
    "",
    "Merci de me confirmer la disponibilite."
  ].join("\n");

  if (summaryMail) {
    summaryMail.href = `mailto:contact@maisonhabaya.com?subject=${subject}&body=${encodeURIComponent(bodyText)}`;
  }
}

function updateOrderSummary() {
  const model = modelSelect?.value || "Modele a preciser";
  const size = sizeSelect?.value || "A preciser";
  const color = colorSelect?.value || "A preciser";

  if (summaryModel) summaryModel.textContent = model;
  if (summaryPrice) summaryPrice.textContent = selectedPrice();
  if (summarySize) summarySize.textContent = size;
  if (summaryColor) summaryColor.textContent = color;
  setJourneyStep();
  buildMailto();
}

const requestedModel = params.get("model");
if (requestedModel && modelSelect) {
  const hasModel = [...modelSelect.options].some((option) => option.value === requestedModel);
  if (hasModel) {
    modelSelect.value = requestedModel;
  }
}

document.querySelectorAll("[data-order-input]").forEach((input) => {
  input.addEventListener("input", () => {
    orderSubmitted = false;
    if (orderStatus) {
      orderStatus.textContent =
        "Votre demande sera transformee en message clair pour finaliser la disponibilite.";
    }
    updateOrderSummary();
  });
});

document.querySelectorAll(".product-select[data-model]:not(.cart-add)").forEach((button) => {
  button.addEventListener("click", () => {
    const model = button.dataset.model;
    if (modelSelect && model) {
      modelSelect.value = model;
    }

    updateOrderSummary();
    orderSection?.scrollIntoView({ behavior: "smooth", block: "start" });
    orderSection?.classList.add("is-choosing");

    window.setTimeout(() => {
      orderSection?.classList.remove("is-choosing");
    }, 900);
  });
});

orderForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  orderSubmitted = true;
  updateOrderSummary();

  if (orderStatus) {
    orderStatus.textContent =
      "Votre commande est prete. Envoyez le message pour recevoir la disponibilite et le delai.";
  }

  summaryMail?.focus();
});

updateOrderSummary();

const checkoutItems = document.querySelector("#checkout-items");
const checkoutEmpty = document.querySelector("#checkout-empty");
const checkoutTotal = document.querySelector("#checkout-total");
const checkoutForm = document.querySelector("#checkout-form");
const checkoutMail = document.querySelector("#checkout-mail");
const checkoutStatus = document.querySelector("#checkout-status");
const checkoutName = document.querySelector("#checkout-name");
const checkoutPhone = document.querySelector("#checkout-phone");
const checkoutCity = document.querySelector("#checkout-city");
const contactForm = document.querySelector("#contact-form");
const contactMail = document.querySelector("#contact-mail");
const contactName = document.querySelector("#contact-name");
const contactPhone = document.querySelector("#contact-phone");
const contactSubject = document.querySelector("#contact-subject");
const contactModel = document.querySelector("#contact-model");
const contactMessage = document.querySelector("#contact-message");

function buildCheckoutMail() {
  if (!checkoutMail) return;

  const cart = readCart();
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const lines = cart.map(
    (item) =>
      `- ${item.name} | Taille ${item.size} | Couleur ${item.color || "Noir"} | Quantite ${item.qty} | ${formatPrice(item.price * item.qty)}`
  );
  const subject = encodeURIComponent("Paiement Maison Habaya - Panier");
  const bodyText = [
    "Bonjour Maison Habaya,",
    "",
    "Je souhaite valider mon panier.",
    "",
    ...lines,
    "",
    `Total estime : ${formatPrice(total)}`,
    `Nom : ${checkoutName?.value.trim() || "A preciser"}`,
    `Telephone : ${checkoutPhone?.value.trim() || "A preciser"}`,
    `Ville / livraison : ${checkoutCity?.value.trim() || "A preciser"}`,
    "",
    "Merci de me confirmer la disponibilite et les informations de paiement."
  ].join("\n");

  checkoutMail.href = `mailto:contact@maisonhabaya.com?subject=${subject}&body=${encodeURIComponent(bodyText)}`;
}

function renderCheckout() {
  if (!checkoutItems || !checkoutTotal) return;

  const cart = readCart();
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  checkoutItems.innerHTML = "";
  checkoutTotal.textContent = formatPrice(total);
  checkoutEmpty?.classList.toggle("is-visible", cart.length === 0);

  cart.forEach((item) => {
    const itemColor = item.color || "Noir";
    const row = document.createElement("article");
    row.className = "checkout-item";
    row.innerHTML = `
      <img src="${item.image}" alt="${item.name}" />
      <div>
        <h3>${item.name}</h3>
        <p>
          Taille ${item.size} ·
          <span class="inline-color"><span class="color-dot" style="--swatch: ${colorValue(itemColor)}"></span>${itemColor}</span>
          · ${item.priceLabel}
        </p>
      </div>
      <div class="checkout-item-actions" aria-label="Quantite ${item.name}">
        <button class="qty-button" type="button" data-cart-qty="-1" data-id="${item.id}" data-size="${item.size}" data-color="${itemColor}" aria-label="Retirer une quantite">-</button>
        <span>${item.qty}</span>
        <button class="qty-button" type="button" data-cart-qty="1" data-id="${item.id}" data-size="${item.size}" data-color="${itemColor}" aria-label="Ajouter une quantite">+</button>
        <button class="remove-button" type="button" data-cart-remove data-id="${item.id}" data-size="${item.size}" data-color="${itemColor}">Retirer</button>
      </div>
    `;
    checkoutItems.appendChild(row);
  });

  buildCheckoutMail();
}

checkoutItems?.addEventListener("click", (event) => {
  const qtyButton = event.target.closest("[data-cart-qty]");
  const removeButton = event.target.closest("[data-cart-remove]");
  if (!qtyButton && !removeButton) return;

  const control = qtyButton || removeButton;
  let cart = readCart();
  const id = control.dataset.id;
  const size = control.dataset.size;
  const color = control.dataset.color || "Noir";

  if (removeButton) {
    cart = cart.filter((item) => !(item.id === id && item.size === size && (item.color || "Noir") === color));
  } else {
    const change = Number(qtyButton.dataset.cartQty);
    cart = cart
      .map((item) =>
        item.id === id && item.size === size && (item.color || "Noir") === color
          ? { ...item, qty: Math.max(0, item.qty + change) }
          : item
      )
      .filter((item) => item.qty > 0);
  }

  writeCart(cart);
});

[checkoutName, checkoutPhone, checkoutCity].forEach((input) => {
  input?.addEventListener("input", buildCheckoutMail);
});

checkoutForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const hasItems = readCart().length > 0;

  if (!hasItems) {
    if (checkoutStatus) checkoutStatus.textContent = "Ajoutez au moins un produit avant le paiement.";
    return;
  }

  buildCheckoutMail();
  if (checkoutStatus) {
    checkoutStatus.textContent = "Votre demande de paiement est prete. Envoyez le message pour validation.";
  }
  checkoutMail?.focus();
});

function buildContactMail() {
  if (!contactMail) return;

  const subject = encodeURIComponent(`Contact Maison Habaya - ${contactSubject?.value || "Demande"}`);
  const bodyText = [
    "Bonjour Maison Habaya,",
    "",
    `Nom : ${contactName?.value.trim() || "A preciser"}`,
    `Telephone : ${contactPhone?.value.trim() || "A preciser"}`,
    `Sujet : ${contactSubject?.value || "Demande"}`,
    `Modele : ${contactModel?.value.trim() || "A preciser"}`,
    "",
    contactMessage?.value.trim() || "Message a preciser",
    "",
    "Merci de me repondre avec les informations disponibles."
  ].join("\n");

  contactMail.href = `mailto:contact@maisonhabaya.com?subject=${subject}&body=${encodeURIComponent(bodyText)}`;
}

[contactName, contactPhone, contactSubject, contactModel, contactMessage].forEach((input) => {
  input?.addEventListener("input", buildContactMail);
});

contactForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  buildContactMail();
  contactMail?.focus();
});

updateCartCount();
renderCheckout();
buildContactMail();

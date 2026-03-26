<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>El Buen Sabor – Delivery Gratis · Moyobamba</title>

  <!-- ═══ Open Graph – URLs ABSOLUTAS para WhatsApp / Facebook / Instagram ═══ -->
  <meta property="og:title"        content="🍽️ El Buen Sabor – Delivery GRATIS en Moyobamba"/>
  <meta property="og:description"  content="🛵 Delivery GRATIS · Menú del día · Jugos · Broaster · ¡Pide ahora por WhatsApp!"/>
  <meta property="og:image"        content="https://koreag123.github.io/El-Buen-Sabor/img/og-banner.jpg"/>
  <meta property="og:image:width"  content="1200"/>
  <meta property="og:image:height" content="630"/>
  <meta property="og:url"          content="https://koreag123.github.io/El-Buen-Sabor/"/>
  <meta property="og:type"         content="website"/>
  <meta property="og:site_name"    content="El Buen Sabor"/>
  <meta name="twitter:card"        content="summary_large_image"/>
  <meta name="twitter:image"       content="https://koreag123.github.io/El-Buen-Sabor/img/og-banner.jpg"/>
  <meta name="theme-color"         content="#b5460f"/>

  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"/>
  <link rel="stylesheet" href="css/style.css"/>
</head>
<body>

<!-- ══════════ HERO ══════════ -->
<header class="hero">
  <!-- Imagen de fondo – si no existe usa degradado oscuro del CSS -->
  <div class="hero-media">
    <img src="img/hero.jpg" alt="" class="hero-img"
         onerror="this.remove()"/>
    <div class="hero-overlay"></div>
  </div>

  <!-- TOPBAR -->
  <nav class="topbar">
    <div class="topbar-brand">
      <!-- Logo del restaurante – usa la imagen que subiste -->
      <img src="img/logo.png" alt="El Buen Sabor" class="topbar-logo"
           onerror="this.style.display='none'"/>
      <div class="topbar-text">
        <span class="topbar-name">El Buen Sabor</span>
        <span class="topbar-sub">Moyobamba · Sabor Amazónico</span>
      </div>
    </div>
    <a href="https://wa.me/51918263264" target="_blank" rel="noopener" class="topbar-wa">
      <i class="fa-brands fa-whatsapp"></i> Pedir
    </a>
  </nav>

  <!-- CONTENIDO HERO -->
  <div class="hero-body">
    <div class="hero-badge">🛵 Delivery GRATIS</div>
    <h1 class="hero-title">Comida casera<br>con sabor a <em>selva</em></h1>
    <p class="hero-info">
      <i class="fa-solid fa-clock"></i> Lun–Sáb · 7 am – 3 pm
      &nbsp;·&nbsp;
      <i class="fa-solid fa-location-dot"></i> Jr. 25 de Mayo, Moyobamba
    </p>
    <a href="#menu" class="hero-cta">
      <i class="fa-solid fa-utensils"></i> Ver menú del día
    </a>
  </div>

  <div class="hero-wave">
    <svg viewBox="0 0 1440 64" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
      <path d="M0,32 C480,64 960,0 1440,32 L1440,64 L0,64 Z" fill="#fdf6ed"/>
    </svg>
  </div>
</header>

<!-- ══════════ INFO STRIP ══════════ -->
<div class="info-strip">
  <div class="info-strip-inner">
    <div class="info-chip">
      <i class="fa-solid fa-motorcycle"></i>
      <span>Delivery <strong>GRATIS</strong></span>
    </div>
    <div class="info-chip">
      <i class="fa-solid fa-map-marker-alt"></i>
      <a href="https://maps.app.goo.gl/1Du1t6VzoVoFPYCs9" target="_blank">
        Jr. 25 de Mayo – Antes del Grifo Sur América
      </a>
    </div>
    <div class="info-chip">
      <i class="fa-brands fa-whatsapp"></i>
      <a href="https://wa.me/51918263264" target="_blank">918 263 264</a>
    </div>
  </div>
</div>

<!-- ══════════ MENÚ ══════════ -->
<section id="menu" class="menu-section">
  <div class="container">
    <div class="sec-head">
      <h2 class="sec-title">Nuestro Menú</h2>
      <p class="sec-sub">Preparado fresco cada mañana 🌿</p>
    </div>

    <!-- Tabs categoría -->
    <div class="tabs" id="tabs">
      <button class="tab active" data-cat="all">
        <i class="fa-solid fa-th-large"></i> Todo
      </button>
      <button class="tab" data-cat="menu">
        <i class="fa-solid fa-bowl-food"></i> Menú del Día
      </button>
      <button class="tab" data-cat="postre">
        <i class="fa-solid fa-cookie-bite"></i> Postres
      </button>
      <button class="tab" data-cat="jugos">
        <i class="fa-solid fa-blender"></i> Jugos
      </button>
      <button class="tab" data-cat="broaster">
        <i class="fa-solid fa-drumstick-bite"></i> Broaster
      </button>
    </div>

    <!-- Grid de productos (llenado por JS) -->
    <div class="grid" id="grid"></div>
  </div>
</section>

<!-- ══════════ NOSOTROS / CONTACTO ══════════ -->
<section class="about-section">
  <div class="container">
    <div class="about-card">
      <div class="about-col">
        <h3>📞 Pedidos y Reservas</h3>
        <p>Comunícate con anticipación para asegurar tu mesa o tu delivery.</p>
        <a href="https://wa.me/51918263264" target="_blank" class="btn-wa-big">
          <i class="fa-brands fa-whatsapp"></i> Llamar al 918 263 264
        </a>
      </div>
      <div class="about-col">
        <h3>📍 Dónde estamos</h3>
        <p>Jr. 25 de Mayo – Subiendo la subida de Shango.<br>
           Referencia: Antes de llegar al Grifo Sur América.</p>
        <a href="https://maps.app.goo.gl/1Du1t6VzoVoFPYCs9" target="_blank" class="btn-maps">
          <i class="fa-solid fa-map-location-dot"></i> Ver en Google Maps
        </a>
      </div>
    </div>
  </div>
</section>

<!-- ══════════ CART SCRIM ══════════ -->
<div class="scrim" id="scrim"></div>

<!-- ══════════ CART DRAWER ══════════ -->
<aside class="drawer" id="drawer">
  <div class="drawer-head">
    <h3><i class="fa-solid fa-bag-shopping"></i> Tu pedido</h3>
    <button class="icon-btn" id="btnCloseDrawer">
      <i class="fa-solid fa-xmark"></i>
    </button>
  </div>
  <div class="drawer-body" id="drawerBody">
    <div class="empty-state" id="emptyState">
      <span>🍽️</span>
      <p>Tu carrito está vacío</p>
      <small>¡Agrega algo rico!</small>
    </div>
  </div>
  <div class="drawer-foot" id="drawerFoot" style="display:none">
    <div class="total-row">
      <span>Total</span>
      <strong id="totalLabel">S/ 0.00</strong>
    </div>
    <button class="btn-checkout" id="btnCheckout">
      <i class="fa-brands fa-whatsapp"></i> Hacer pedido
    </button>
  </div>
</aside>

<!-- FAB Carrito -->
<button class="fab" id="fab">
  <i class="fa-solid fa-bag-shopping"></i>
  <span class="fab-badge" id="fabBadge">0</span>
</button>

<!-- ══════════ MODAL CHECKOUT ══════════ -->
<div class="modal-bg hidden" id="modalBg">
  <div class="modal">
    <div class="modal-head">
      <h3><i class="fa-solid fa-receipt"></i> Datos de entrega</h3>
      <button class="icon-btn light" id="btnCloseModal">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>
    <div class="modal-body">
      <!-- Resumen del pedido -->
      <div class="order-preview" id="orderPreview"></div>

      <div class="field">
        <label>Nombre completo <span class="req">*</span></label>
        <input id="fName" type="text" placeholder="Ej: María García" autocomplete="name"/>
      </div>
      <div class="field">
        <label>Teléfono</label>
        <input id="fPhone" type="tel" placeholder="Ej: 920 857 471" autocomplete="tel"/>
      </div>
      <div class="field">
        <label>Dirección / Referencia <span class="req">*</span></label>
        <input id="fAddr" type="text" placeholder="Jr. Los Pinos 123, cerca del colegio"/>
      </div>

      <button class="btn-gps" id="btnGps">
        <i class="fa-solid fa-location-crosshairs"></i> Compartir ubicación GPS
      </button>
      <div class="gps-box" id="gpsBox"></div>

      <div class="field">
        <label>Método de pago</label>
        <div class="pay-grid">
          <label class="pay-opt">
            <input type="radio" name="pago" value="Efectivo" checked/>
            <span><i class="fa-solid fa-money-bill-wave"></i><br>Efectivo</span>
          </label>
          <label class="pay-opt">
            <input type="radio" name="pago" value="Yape"/>
            <span><i class="fa-solid fa-mobile-screen-button"></i><br>Yape</span>
          </label>
        </div>
      </div>

      <button class="btn-wa-send" id="btnWaSend">
        <i class="fa-brands fa-whatsapp"></i> Enviar pedido por WhatsApp
      </button>
    </div>
  </div>
</div>

<!-- ══════════ FOOTER ══════════ -->
<footer class="footer">
  <div class="footer-inner">
    <div class="footer-brand">
      <p class="footer-logo">El Buen Sabor</p>
      <p class="footer-tagline">Sabor amazónico en cada plato 🌿</p>
      <p class="footer-addr">Jr. 25 de Mayo – Moyobamba, San Martín</p>
    </div>
    <div class="footer-links">
      <a href="https://wa.me/51918263264" target="_blank" class="flink flink-wa">
        <i class="fa-brands fa-whatsapp"></i>
        <span>918 263 264</span>
      </a>
      <a href="https://tiktok.com/@elbuensaboraselvamoyo" target="_blank" class="flink flink-tk">
        <i class="fa-brands fa-tiktok"></i>
        <span>TikTok</span>
      </a>
      <a href="https://www.facebook.com/share/1CSU9ntRd1/" target="_blank" class="flink flink-fb">
        <i class="fa-brands fa-facebook"></i>
        <span>Facebook</span>
      </a>
      <a href="https://maps.app.goo.gl/1Du1t6VzoVoFPYCs9" target="_blank" class="flink flink-maps">
        <i class="fa-solid fa-map-location-dot"></i>
        <span>Ubicación</span>
      </a>
    </div>
  </div>
  <p class="footer-copy">© 2026 El Buen Sabor · Moyobamba · Hecho con ❤️</p>
</footer>

<!-- Toast notificaciones -->
<div class="toast" id="toast"></div>

<script src="js/app.js"></script>
</body>
</html>

(() => {
  const STORAGE_KEY = 'kuchis_cart';
  let cart = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

  const cartBody = document.getElementById('cartBody');
  const cartFooter = document.getElementById('cartFooter');
  const cartTotalEl = document.getElementById('cartTotal');
  const tabs = document.querySelectorAll('.tab');
  const menuGrid = document.getElementById('menuGrid'); 
  const indicator = document.querySelector('.tab-indicator');
  const tabsEl = document.querySelector('.tabs'); // contenedor de las pestañas

  //Funcionalidad de adicionales  
      const EXTRAS = [
    { name: 'Queso', price: 2.00 },
    { name: 'Platano', price: 3.00 },
    { name: 'Huevo', price: 3.00 },
    { name: 'Tocino', price: 3.00 },
    { name: 'Hot Dog', price: 3.00 },
    { name: 'Chorizo', price: 6.00 },
    { name: 'Hamburguesa', price: 6.00 },
    { name: 'Filete', price: 7.00 },
    { name: 'Alita', price: 7.00 },
    { name: 'Deshilachado', price: 6.00 }
  ];

  // ===== Mobile cart toggle =====
  const cartEl = document.querySelector('.cart');
  const openCartBtn = document.getElementById('openCartBtn');

  function toggleCart(forceOpen = null){
    if (!cartEl) return;
    if (forceOpen === true) cartEl.classList.add('open');
    else if (forceOpen === false) cartEl.classList.remove('open');
    else cartEl.classList.toggle('open');
  }

  if (openCartBtn){
    openCartBtn.addEventListener('click', () => toggleCart());
  }


  // Función unificada: ahora acepta img y guarda extras e imagen
  function addItem(name, price, img) {
    const found = cart.find(x => x.name === name);
    if (found) found.qty++;
    else cart.push({ name, price, qty: 1, extras: [], img: img || null });
    save();
    renderCart();
  }


  function updateIndicator(targetTab){
    if(!indicator || !targetTab) return;
    const parent = targetTab.parentElement;
    const parentRect = parent.getBoundingClientRect();
    const rect = targetTab.getBoundingClientRect();
    const left = rect.left - parentRect.left + parent.scrollLeft;
    const top = rect.top - parentRect.top;
    indicator.style.width = rect.width + 'px';
    indicator.style.height = rect.height + 'px';
    indicator.style.top = top + 'px';
    indicator.style.transform = `translateX(${left}px)`;
  }

  // Mostrar/ocultar categoría (ahora en scope global). Puede ejecutarse en modo instantáneo.
  function showCategory(cat, { instant = false } = {}) {
    const grid = menuGrid;
    if (!grid) return;

    // Asegurar que cada botón tenga data-img (se usa al agregar)
    document.querySelectorAll('.card').forEach(card => {
      const img = card.querySelector('.card-media img')?.getAttribute('src');
      const btn = card.querySelector('.add-btn');
      if (img && btn && !btn.dataset.img) btn.dataset.img = img;
    });

    const cards = Array.from(document.querySelectorAll('.card'));

    if (instant) {
      // Ocultar inmediatamente sin transición (evita flash al cargar)
      cards.forEach(card => card.classList.toggle('hidden', card.dataset.category !== cat));
      document.querySelectorAll('.card:not(.hidden)').forEach((card, i) => {
        card.classList.add('anim-hidden');
        setTimeout(() => card.classList.remove('anim-hidden'), 60 + i * 35);
      });
      return;
    }

    // Flujo con fade-out / transición
    grid.classList.add('fade-out');
    const onFade = (e) => {
      if (e && e.propertyName !== 'opacity') return;
      grid.removeEventListener('transitionend', onFade);
      cards.forEach(card => card.classList.toggle('hidden', card.dataset.category !== cat));
      document.querySelectorAll('.card:not(.hidden)').forEach((card, i) => {
        card.classList.add('anim-hidden');
        setTimeout(() => card.classList.remove('anim-hidden'), 60 + i * 35);
      });
      requestAnimationFrame(() => grid.classList.remove('fade-out'));
    };
    grid.addEventListener('transitionend', onFade, { once: true });
    // Fallback si no ocurre la transición
    setTimeout(() => {
      if (grid.classList.contains('fade-out')) onFade();
    }, 300);
  }

  // recalcula en resize y al cargar (usa RAF para esperar layout)
  window.addEventListener('resize', () => requestAnimationFrame(() => updateIndicator(document.querySelector('.tab.active'))));
  window.addEventListener('load', () => requestAnimationFrame(() => {
    const active = document.querySelector('.tab.active');
    updateIndicator(active);
    if (active) showCategory(active.dataset.cat, { instant: true }); // mostrar la pestaña por defecto inmediatamente
  }));
  // llamada inicial segura
  requestAnimationFrame(() => {
    const active = document.querySelector('.tab.active');
    updateIndicator(active);
    if (active) showCategory(active.dataset.cat, { instant: true });
  });

  // recalcula indicador al hacer scroll en las tabs (mobile)
  if (tabsEl) {
    let ticking = false;
    tabsEl.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        updateIndicator(document.querySelector('.tab.active'));
        ticking = false;
      });
    });
  }

  window.addEventListener('orientationchange', () => requestAnimationFrame(() => updateIndicator(document.querySelector('.tab.active'))));

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }

  function renderCart() {
    cartBody.innerHTML = '';
    cartBody.classList.toggle('is-empty', cart.length === 0);
    if (cart.length === 0) {
      cartBody.innerHTML = '<div class="empty"><div class="cart-icon">🛒</div><p>Tu pedido está vacío<br><small>Agrega algunos platillos deliciosos</small></p></div>';
      cartFooter.hidden = true;
      cartTotalEl.textContent = 'S/0.00';
      return;
    }

    cartFooter.hidden = false;
    cart.forEach((it, i) => {
      // calcular extras por item
      const extrasTotal = (it.extras || []).reduce((s, x) => s + x.price, 0);
      const itemTotal = (it.price + extrasTotal) * it.qty;

      const row = document.createElement('div');
      row.className = 'cart-item';
      row.innerHTML = `
        <div style="flex:1">
          <strong>${it.name}</strong>
          <div class="qty-controls" data-index="${i}" style="margin-top:8px">
            <button class="dec" aria-label="Disminuir cantidad" data-i="${i}">−</button>
            <div class="qty">x${it.qty}</div>
            <button class="inc" aria-label="Aumentar cantidad" data-i="${i}">＋</button>
          </div>

          <!-- lista de extras ya añadidos al item -->
          <div class="extras-list" data-index="${i}">
            ${(it.extras || []).map((ex, exIdx) => `<div class="extra-item"><span class="extra-name">${ex.name}</span><span class="extra-price">S/${ex.price.toFixed(2)}</span><button type="button" class="rm-extra" data-i="${i}" data-ex="${exIdx}" aria-label="Eliminar extra">✕</button></div>`).join('')}
          </div>

          <!-- botón para abrir panel de adicionales -->
          <div class="extras-block">
            <button class="add-extra-btn" data-i="${i}" aria-expanded="false">Añadir adicional</button>
            <div class="extras-panel" data-i="${i}" aria-hidden="true">
              ${EXTRAS.map(ex => `<div class="extras-option"><div><strong>${ex.name}</strong><div class="desc" style="color:var(--muted);font-size:12px">+ S/${ex.price.toFixed(2)}</div></div><button class="extra-add" data-i="${i}" data-name="${ex.name}" data-price="${ex.price}" type="button">Agregar</button></div>`).join('')}
            </div>
          </div>
        </div>

        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px">
          <div class="price">S/${itemTotal.toFixed(2)}</div>
          <button class="rm" aria-label="Eliminar" data-i="${i}">✕</button>
        </div>
      `;
      cartBody.appendChild(row);
    });

    const total = cart.reduce((s, x) => {
      const extrasSum = (x.extras || []).reduce((ss, ex) => ss + ex.price, 0);
      return s + (x.price + extrasSum) * x.qty;
    }, 0);
    cartTotalEl.textContent = 'S/' + total.toFixed(2);
  }

  function changeQty(index, delta) {
    if (!cart[index]) return;
    cart[index].qty += delta;
    if (cart[index].qty <= 0) cart.splice(index, 1);
    save();
    renderCart();
  }

  // Delegación de eventos
  document.addEventListener('click', (e) => {
    const t = e.target;

    // Crear pedido -> ir a pedido.html
    if (t.closest('.checkout-btn')) {
      if (cart.length === 0) {
        alert('Tu carrito está vacío. Agrega productos antes de crear el pedido.');
        return;
      }
      const total = cart.reduce((s, x) => {
        const extrasSum = (x.extras || []).reduce((ss, ex) => ss + ex.price, 0);
        return s + (x.price + extrasSum) * x.qty;
      }, 0);
      // opcional: guardar metadatos del pedido
      localStorage.setItem('kuchis_order_meta', JSON.stringify({ createdAt: Date.now(), total }));
      window.location.href = 'pedido.html';
      return;
    }

    // abrir/cerrar panel extras
    if (t.closest('.add-extra-btn')) {
      const btn = t.closest('.add-extra-btn');
      const i = +btn.dataset.i;
      const panel = cartBody.querySelector(`.extras-panel[data-i="${i}"]`);
      const expanded = panel.classList.toggle('open');
      panel.setAttribute('aria-hidden', expanded ? 'false' : 'true');
      btn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
      return;
    }

    // agregar extra al item
    if (t.closest('.extra-add')) {
      const btn = t.closest('.extra-add');
      const i = +btn.dataset.i;
      const name = btn.dataset.name;
      const price = parseFloat(btn.dataset.price);
      const item = cart[i];
      if (!item) return;
      item.extras = item.extras || [];
      item.extras.push({ name, price });
      save();
      renderCart();
      return;
    }

    // eliminar extra
    if (t.closest('.rm-extra')) {
      const btn = t.closest('.rm-extra');
      const i = +btn.dataset.i;
      const exIdx = +btn.dataset.ex;
      const item = cart[i];
      if (!item || !item.extras) return;
      item.extras.splice(exIdx, 1);
      save();
      renderCart();
      return;
    }

    // Tabs
    
    // Reemplaza la parte de "Tabs" por esta función y manejo:
    // En el handler de click, cuando detectes tab:
    if (t.closest('.tab')) {
        const btn = t.closest('.tab');
        tabs.forEach(tb => {
          tb.classList.toggle('active', tb === btn);
          tb.setAttribute('aria-selected', tb === btn ? 'true' : 'false');
        });
        const cat = btn.dataset.cat;
        // centrar visualmente la tab y actualizar indicador después del scroll
        btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        // dar tiempo al scroll y luego mover el indicador para que quede alineado
        setTimeout(() => updateIndicator(btn), 220);
        showCategory(cat);
        updateIndicator(btn);
        return;
    }

    // Agregar producto
    if (t.closest('.add-btn')) {
      const btn = t.closest('.add-btn');
      addItem(btn.dataset.name, parseFloat(btn.dataset.price), btn.dataset.img);

      // abrir carrito automáticamente en mobile
      //if (window.innerWidth <= 760) toggleCart(true);

      return;
    }

    // Incrementar
    if (t.closest('.inc')) {
      changeQty(+t.dataset.i, +1);
      return;
    }

    // Disminuir
    if (t.closest('.dec')) {
      changeQty(+t.dataset.i, -1);
      return;
    }

    // Eliminar
    if (t.closest('.rm')) {
      const i = +t.closest('.rm').dataset.i;
      cart.splice(i, 1);
      save();
      renderCart();
      return;
    }
  });

  // Inicial
  renderCart();
})();
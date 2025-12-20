(() => {
  const STORAGE_KEY = 'kuchis_cart';
  const cart = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  const container = document.getElementById('orderDetails');
  const actions = document.getElementById('orderActions');

  function fmt(n){ return 'S/' + Number(n).toFixed(2); }

  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = '<p class="empty">No hay artículos en tu pedido. <a href="index.html" class="checkout-btn">Volver al menú</a></p>';
    return;
  }

  let total = 0;
  const list = document.createElement('div');
  list.className = 'order-list';

  cart.forEach((it, i) => {
    const extrasSum = (it.extras || []).reduce((s, e) => s + e.price, 0);
    const itemTotal = (it.price + extrasSum) * it.qty;
    total += itemTotal;

    const item = document.createElement('div');
    item.className = 'card';
    item.style.marginBottom = '12px';
    item.innerHTML = `
      <div class="card-body">
        <div class="card-row"><strong>${it.name} <small style="color:var(--muted);font-weight:400">x${it.qty}</small></strong><strong>${fmt(itemTotal)}</strong></div>
        <div style="color:var(--muted);font-size:13px">Precio base: ${fmt(it.price)}${ (it.extras && it.extras.length) ? ' • Extras: ' + it.extras.map(e=> e.name).join(', ') : '' }</div>
        ${(it.extras && it.extras.length) ? `<div style="margin-top:8px" class="extras-list">${it.extras.map(e=> `<div class="extra-item"><span class="extra-name">${e.name}</span><span class="extra-price">S/${e.price.toFixed(2)}</span></div>`).join('')}</div>` : ''}
      </div>
    `;
    list.appendChild(item);
  });

  container.appendChild(list);

  // Cremas (texto)
  const cremas = document.createElement('div');
  cremas.className = 'cremas';
  cremas.innerHTML = `<strong>Cremas disponibles:</strong><p class="cremas-list">Mayonesa · Ketchup · Mostaza · Tartara · Kuchi's · Rocoto · Buffalo</p>`;
  container.appendChild(cremas);

  // Total y acciones
  const footer = document.createElement('div');
  footer.className = 'cart-footer';
  footer.innerHTML = `
    <div class="total-row"><span>Total</span><strong>${fmt(total)}</strong></div>
    <div style="display:flex;gap:8px;margin-top:10px">
      <button id="confirmOrder" class="checkout-btn">Confirmar Pedido</button>
      <a href="index.html" class="add-btn" style="background:transparent;color:var(--muted);box-shadow:none;border:1px solid rgba(255,255,255,0.04);">Volver</a>
    </div>
  `;
  actions.appendChild(footer);

  // Handlers
  document.getElementById('confirmOrder').addEventListener('click', () => {
    // Simple confirmation flow: limpiar carrito y mostrar mensaje
    localStorage.removeItem(STORAGE_KEY);
    alert('Pedido confirmado. Gracias.');
    window.location.href = 'index.html';
  });
})();
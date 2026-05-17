// ============================================
// GUPPYLANDIA - Sistema de Carrito a WhatsApp
// ============================================

// El número de WhatsApp del dueño (con código de país, sin +)
const WHATSAPP_NUMBER = "593939556268";

// --- FUNCIONES DEL CARRITO ---

// Leer el carrito desde localStorage
function getCart() {
    const cart = localStorage.getItem("guppylandia_cart");
    return cart ? JSON.parse(cart) : [];
}

// Guardar el carrito en localStorage
function saveCart(cart) {
    localStorage.setItem("guppylandia_cart", JSON.stringify(cart));
}

// Agregar un producto (con cantidad personalizada)
function addToCart(nombre, precio, cantidad, event) {
    const cart = getCart();
    const qty = cantidad || 1;

    // Buscar si el producto ya existe en el carrito
    const existing = cart.find(item => item.nombre === nombre);

    if (existing) {
        existing.cantidad += qty;
    } else {
        cart.push({ nombre: nombre, precio: precio, cantidad: qty });
    }

    saveCart(cart);
    updateCartCount();
    renderCart();

    // Feedback visual: cambiar el botón brevemente a verde
    if (event) {
        const btn = event.target.closest('.product-btn') || event.target;
        const originalText = btn.textContent;
        btn.textContent = "✓ Agregado";
        btn.classList.add("added");
        setTimeout(() => {
            btn.textContent = originalText;
            btn.classList.remove("added");
        }, 1200);
    }
}

// Cambiar la cantidad de un producto en el carrito
function changeCartQty(index, delta) {
    const cart = getCart();
    if (cart[index]) {
        cart[index].cantidad += delta;
        // Si llega a 0 o menos, quitarlo
        if (cart[index].cantidad <= 0) {
            cart.splice(index, 1);
        }
        saveCart(cart);
        updateCartCount();
        renderCart();
    }
}

// Quitar un producto por su posición (index)
function removeFromCart(index) {
    const cart = getCart();
    cart.splice(index, 1);
    saveCart(cart);
    updateCartCount();
    renderCart();
}

// Vaciar todo el carrito
function clearCart() {
    localStorage.removeItem("guppylandia_cart");
    updateCartCount();
}

// Contar cuántos productos hay
function getCartCount() {
    const cart = getCart();
    return cart.reduce((total, item) => total + item.cantidad, 0);
}

// Actualizar el número que se muestra en el ícono del carrito
function updateCartCount() {
    const badge = document.getElementById("cart-count");
    const count = getCartCount();
    if (badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? "flex" : "none";
    }
}

// --- PANEL LATERAL DEL CARRITO ---

// Abrir/cerrar el panel del carrito
function toggleCart() {
    const sidebar = document.getElementById("cart-sidebar");
    const overlay = document.getElementById("cart-overlay");
    if (sidebar && overlay) {
        sidebar.classList.toggle("open");
        overlay.classList.toggle("open");
        // Si se abre, renderizar el contenido
        if (sidebar.classList.contains("open")) {
            renderCart();
        }
    }
}

// Renderizar los items del carrito en el panel lateral
function renderCart() {
    const container = document.getElementById("cart-items");
    const footer = document.getElementById("cart-footer");
    const totalEl = document.getElementById("cart-total-amount");
    const cart = getCart();

    if (!container) return;

    // Si el carrito está vacío
    if (cart.length === 0) {
        container.innerHTML = `
            <div class="cart-empty">
                <i class="fa-solid fa-fish"></i>
                <p>Tu carrito está vacío</p>
                <span>Agrega productos para hacer tu pedido</span>
            </div>
        `;
        if (footer) footer.style.display = "none";
        return;
    }

    // Mostrar el footer
    if (footer) footer.style.display = "block";

    // Calcular total
    let total = 0;

    // Generar el HTML de cada item
    let html = "";
    cart.forEach((item, index) => {
        const subtotal = item.precio * item.cantidad;
        total += subtotal;
        html += `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h4>${item.nombre}</h4>
                    <span class="cart-item-price">$${item.precio.toFixed(2)} c/u</span>
                </div>
                <div class="cart-item-controls">
                    <div class="qty-control">
                        <button onclick="changeCartQty(${index}, -1)">−</button>
                        <span>${item.cantidad}</span>
                        <button onclick="changeCartQty(${index}, 1)">+</button>
                    </div>
                    <span class="cart-item-subtotal">$${subtotal.toFixed(2)}</span>
                    <button class="cart-item-remove" onclick="removeFromCart(${index})" title="Quitar">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;

    // Actualizar total
    if (totalEl) {
        totalEl.textContent = `$${total.toFixed(2)}`;
    }
}

// --- LA FUNCIÓN ESTRELLA: Enviar a WhatsApp ---
function sendToWhatsApp() {
    const cart = getCart();

    if (cart.length === 0) {
        alert("Tu carrito está vacío. ¡Agrega productos primero!");
        return;
    }

    let total = 0;
    let message = `*=================================*\n`;
    message += `  >>>  *NUEVO PEDIDO - GUPPYLANDIA*  <<<\n`;
    message += `*=================================*\n\n`;
    message += `*Detalle del Pedido:*\n`;
    message += `-----------------------------------------\n`;

    cart.forEach((item) => {
        const subtotal = item.precio * item.cantidad;
        total += subtotal;
        message += `• *${item.nombre}*\n`;
        message += `  Cant: ${item.cantidad}   |   Subtotal: $${subtotal.toFixed(2)}\n\n`;
    });

    message += `-----------------------------------------\n`;
    message += `*TOTAL A PAGAR: $${total.toFixed(2)}*\n`;
    message += `*=================================*\n\n`;
    message += `* ¡Hola! Vengo de la página web y me gustaría confirmar este pedido.\n`;
    message += `* Quedo atento a su respuesta para coordinar el pago y envío.`;

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
}

// --- SELECTOR DE CANTIDAD EN TARJETAS ---

// Subir o bajar la cantidad en el selector de la tarjeta de producto
function changeQty(btn, delta) {
    const wrapper = btn.closest('.qty-selector');
    const input = wrapper.querySelector('.qty-value');
    let val = parseInt(input.textContent) + delta;
    if (val < 1) val = 1;
    if (val > 99) val = 99;
    input.textContent = val;
}

// Leer la cantidad seleccionada desde la tarjeta
function getQtyFromCard(btn) {
    const card = btn.closest('.product-card');
    const qtyEl = card.querySelector('.qty-value');
    return qtyEl ? parseInt(qtyEl.textContent) : 1;
}

// Cuando la página cargue, actualizar el contador
document.addEventListener("DOMContentLoaded", updateCartCount);

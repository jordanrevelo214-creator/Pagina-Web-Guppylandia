// ============================================
// ADMIN PANEL - Lógica JavaScript
// ============================================

let allProducts = [];
let currentFilter = 'todos';
const ADMIN_KEY = 'guppylandia_admin';

// --- LOGIN ---
document.getElementById('login-btn')?.addEventListener('click', async () => {
    const password = document.getElementById('admin-password').value;
    const errorEl = document.getElementById('login-error');

    try {
        const res = await fetch('/api/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ clave: password })
        });

        if (res.ok) {
            const data = await res.json(); // Leemos la respuesta del servidor
            localStorage.setItem(ADMIN_KEY, 'true');
            localStorage.setItem('jwt_token', data.token); // GUARDAMOS EL TOKEN
            showAdminPanel();
        } else {

            errorEl.style.display = 'block';
        }
    } catch (e) {
        errorEl.textContent = 'Error de conexión';
        errorEl.style.display = 'block';
    }
});

// Enter key en el input de contraseña
document.getElementById('admin-password')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') document.getElementById('login-btn').click();
});

// Verificar si ya está logueado
if (localStorage.getItem(ADMIN_KEY) === 'true') {
    showAdminPanel();
}

function showAdminPanel() {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('admin-panel').style.display = 'block';
    loadProducts();
}

// --- CARGAR PRODUCTOS ---
async function loadProducts() {
    try {
        const res = await fetch('/api/productos');
        allProducts = await res.json();
        renderTable();
    } catch (e) {
        console.error('Error cargando productos:', e);
    }
}

function renderTable() {
    const tbody = document.getElementById('products-table-body');
    const emptyMsg = document.getElementById('admin-empty');

    let filtered = allProducts;
    if (currentFilter !== 'todos') {
        filtered = allProducts.filter(p => p.categoria === currentFilter);
    }

    if (filtered.length === 0) {
        tbody.innerHTML = '';
        emptyMsg.style.display = 'block';
        return;
    }

    emptyMsg.style.display = 'none';

    const categoryEmoji = { peces: '🐠', plantas: '🌿', productos: '🧪' };

    tbody.innerHTML = filtered.map(p => `
        <tr>
            <td><img src="${p.imagen}" alt="${p.nombre}" class="admin-thumb"></td>
            <td><strong>${p.nombre}</strong></td>
            <td>${categoryEmoji[p.categoria] || ''} ${p.categoria}</td>
            <td>$${Number(p.precio).toFixed(2)}</td>
            <td>
                <span class="${p.stock <= 3 ? 'stock-badge stock-low' : 'stock-badge stock-ok'}" style="position:static;">
                    ${p.stock}
                </span>
            </td>
            <td>
                <div class="admin-actions">
                    <button class="admin-btn-edit" onclick='editProduct(${JSON.stringify(p)})' title="Editar">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button class="admin-btn-delete" onclick="deleteProduct(${p.id})" title="Eliminar">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// --- FILTROS ---
function filterCategory(cat) {
    currentFilter = cat;
    document.querySelectorAll('.admin-filter-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    renderTable();
}

// --- MODAL ---
function openModal(product = null) {
    document.getElementById('product-modal').style.display = 'flex';

    if (product) {
        document.getElementById('modal-title').textContent = 'Editar Producto';
        document.getElementById('product-id').value = product.id;
        document.getElementById('product-nombre').value = product.nombre;
        document.getElementById('product-categoria').value = product.categoria;
        document.getElementById('product-precio').value = product.precio;
        document.getElementById('product-stock').value = product.stock;
        document.getElementById('product-descripcion').value = product.descripcion || '';
        document.getElementById('product-imagen').value = product.imagen || '';
    } else {
        document.getElementById('modal-title').textContent = 'Agregar Producto';
        document.getElementById('product-form').reset();
        document.getElementById('product-id').value = '';
    }
}

function closeModal() {
    document.getElementById('product-modal').style.display = 'none';
}

function editProduct(product) {
    openModal(product);
}

// --- GUARDAR PRODUCTO ---
document.getElementById('product-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('product-id').value;
    const data = {
        nombre: document.getElementById('product-nombre').value,
        categoria: document.getElementById('product-categoria').value,
        precio: parseFloat(document.getElementById('product-precio').value),
        stock: parseInt(document.getElementById('product-stock').value) || 0,
        descripcion: document.getElementById('product-descripcion').value,
        imagen: document.getElementById('product-imagen').value,
        activo: 1
    };

    try {
        // Preparamos los headers con el token
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('jwt_token')}` // ENVIAMOS EL TOKEN
        };
        if (id) {
            await fetch(`/api/productos/${id}`, {
                method: 'PUT',
                headers: headers,
                body: JSON.stringify(data)
            });
        } else {
            await fetch('/api/productos', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(data)
            });
        }
        
        closeModal();
        loadProducts();
    } catch (e) {
        alert('Error al guardar el producto');
    }
});

// --- ELIMINAR PRODUCTO ---
async function deleteProduct(id) {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;

    try {
        await fetch(`/api/productos/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('jwt_token')}` } // ENVIAMOS EL TOKEN
        });
        loadProducts();
    } catch (e) {
        alert('Error al eliminar');
    }
}
// --- CERRAR SESIÓN ---
function logout() {
    localStorage.removeItem(ADMIN_KEY); // Borramos la sesión
    location.reload(); // Recargamos la página para volver a mostrar el login
}

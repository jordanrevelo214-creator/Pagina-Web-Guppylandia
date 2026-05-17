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

    const categoryEmoji = { peces: '🐠', plantas: '🌿', productos: '🧪', equipos: '⚙️' };

    tbody.innerHTML = filtered.map(p => `
        <tr>
            <td><img src="${p.imagen}" alt="${p.nombre}" class="admin-thumb"></td>
            <td>
                <strong>${p.nombre}</strong>
                ${p.destacado ? `
                    <span style="background: #fff8e1; color: #d97706; border: 1px solid #fef3c7; padding: 2px 8px; border-radius: 8px; font-size: 10px; font-weight: 700; margin-left: 8px; display: inline-flex; align-items: center; gap: 4px;">
                        <i class="fa-solid fa-star" style="color: #f59e0b;"></i> Destacado
                    </span>
                ` : ''}
            </td>
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
    const previewContainer = document.getElementById('image-preview-container');
    const previewImg = document.getElementById('image-preview');
    const sizeInfo = document.getElementById('image-size-info');

    if (product) {
        document.getElementById('modal-title').textContent = 'Editar Producto';
        document.getElementById('product-id').value = product.id;
        document.getElementById('product-nombre').value = product.nombre;
        document.getElementById('product-categoria').value = product.categoria;
        document.getElementById('product-precio').value = product.precio;
        document.getElementById('product-stock').value = product.stock;
        document.getElementById('product-descripcion').value = product.descripcion || '';
        document.getElementById('product-imagen').value = product.imagen || '';
        document.getElementById('product-destacado').checked = (product.destacado === 1);
        
        if (product.imagen) {
            previewImg.src = product.imagen;
            previewContainer.style.display = 'flex';
            sizeInfo.textContent = product.imagen.startsWith('data:') ? 'Imagen subida (localmente)' : 'URL externa';
        } else {
            previewContainer.style.display = 'none';
        }
    } else {
        document.getElementById('modal-title').textContent = 'Agregar Producto';
        document.getElementById('product-form').reset();
        document.getElementById('product-id').value = '';
        document.getElementById('product-destacado').checked = false;
        previewContainer.style.display = 'none';
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
        activo: 1,
        destacado: document.getElementById('product-destacado').checked ? 1 : 0
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

// --- UTILERÍA PARA SUBIR E IMAGEN LOCAL (BASE64 COMPRIMIDO) ---

// Comprimir imagen para optimizar el tamaño en la base de datos D1
function compressImage(file, maxWidth = 800, maxHeight = 800, quality = 0.7) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Mantener relación de aspecto
                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = Math.round((width * maxHeight) / height);
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Exportar como JPEG comprimido
                const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
                resolve(compressedBase64);
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
}

// Evento cuando se selecciona un archivo de imagen
document.getElementById('product-file')?.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const previewContainer = document.getElementById('image-preview-container');
    const previewImg = document.getElementById('image-preview');
    const sizeInfo = document.getElementById('image-size-info');

    sizeInfo.textContent = "Procesando...";
    previewContainer.style.display = 'flex';
    previewImg.src = ""; 

    try {
        // Comprimimos la imagen a un tamaño razonable para D1 (max 700x700px, 0.75 de calidad)
        const compressedBase64 = await compressImage(file, 700, 700, 0.75);
        
        document.getElementById('product-imagen').value = compressedBase64;
        previewImg.src = compressedBase64;
        
        // Calcular peso aproximado
        const sizeInKB = Math.round((compressedBase64.length * 3) / 4 / 1024);
        sizeInfo.textContent = `Imagen cargada y optimizada (~${sizeInKB} KB)`;
    } catch (err) {
        console.error('Error al procesar imagen:', err);
        sizeInfo.textContent = "Error al cargar la imagen";
        alert('Ocurrió un error al optimizar la imagen.');
    }
});

// Evento al escribir una URL externa manualmente
document.getElementById('product-imagen')?.addEventListener('input', (e) => {
    const val = e.target.value.trim();
    const previewContainer = document.getElementById('image-preview-container');
    const previewImg = document.getElementById('image-preview');
    const sizeInfo = document.getElementById('image-size-info');

    if (val) {
        previewImg.src = val;
        previewContainer.style.display = 'flex';
        sizeInfo.textContent = val.startsWith('data:') ? 'Imagen subida (localmente)' : 'URL externa';
    } else {
        previewContainer.style.display = 'none';
    }
});

// Evento para quitar la imagen seleccionada
document.getElementById('remove-image-btn')?.addEventListener('click', () => {
    document.getElementById('product-imagen').value = '';
    document.getElementById('product-file').value = '';
    document.getElementById('image-preview-container').style.display = 'none';
});

// --- MODAL DE CONTRASEÑA ---
function openPasswordModal() {
    document.getElementById('password-modal').style.display = 'flex';
    document.getElementById('password-form').reset();
    document.getElementById('password-error').style.display = 'none';
    document.getElementById('password-success').style.display = 'none';
}

function closePasswordModal() {
    document.getElementById('password-modal').style.display = 'none';
}

// Evento para cambiar contraseña
document.getElementById('password-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const errorEl = document.getElementById('password-error');
    const successEl = document.getElementById('password-success');

    errorEl.style.display = 'none';
    successEl.style.display = 'none';

    if (newPassword.length < 6) {
        errorEl.textContent = 'La nueva contraseña debe tener al menos 6 caracteres.';
        errorEl.style.display = 'block';
        return;
    }

    try {
        const token = localStorage.getItem('jwt_token');
        const res = await fetch('/api/auth', {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ currentPassword, newPassword })
        });

        const data = await res.json();

        if (res.ok) {
            successEl.textContent = data.message || 'Contraseña actualizada con éxito!';
            successEl.style.display = 'block';
            setTimeout(() => {
                closePasswordModal();
            }, 1500);
        } else {
            errorEl.textContent = data.error || 'Error al cambiar contraseña';
            errorEl.style.display = 'block';
        }
    } catch (err) {
        console.error('Error changing password:', err);
        errorEl.textContent = 'Error de conexión con el servidor.';
        errorEl.style.display = 'block';
    }
});

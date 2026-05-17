// ============================================
// API: Editar (PUT) y Eliminar (DELETE) un producto por ID
// ============================================
import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { jwtVerify } from 'jose';

// Función auxiliar para verificar el Token
async function verificarToken(request: Request) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) return false;

    try {
        const token = authHeader.split(' ')[1];
        const secret = new TextEncoder().encode(import.meta.env.JWT_SECRET || 'secreto-respaldo');
        await jwtVerify(token, secret);
        return true;
    } catch {
        return false;
    }
}

// PUT /api/productos/[id] — Actualizar un producto (Protegido con JWT)
export const PUT: APIRoute = async ({ params, request }) => {
    // 🔒 1. Verificamos la llave
    const autorizado = await verificarToken(request);
    if (!autorizado) return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 });

    try {
        const db = env.DB;
        const id = params.id;
        const body = await request.json();
        const { nombre, precio, stock, descripcion, imagen, categoria, activo } = body;

        await db.prepare(
            'UPDATE productos SET nombre = ?, precio = ?, stock = ?, descripcion = ?, imagen = ?, categoria = ?, activo = ? WHERE id = ?'
        ).bind(
            nombre, precio, stock, descripcion || '', imagen || '', categoria, activo ?? 1, id
        ).run();

        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Error al actualizar producto' }), { status: 500 });
    }
};

// DELETE /api/productos/[id] — Eliminar un producto (Protegido con JWT)
export const DELETE: APIRoute = async ({ params, request }) => {
    // 🔒 1. Verificamos la llave
    const autorizado = await verificarToken(request);
    if (!autorizado) return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 });

    try {
        const db = env.DB;
        const id = params.id;

        await db.prepare('DELETE FROM productos WHERE id = ?').bind(id).run();

        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Error al eliminar producto' }), { status: 500 });
    }
};

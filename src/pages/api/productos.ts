// ============================================
// API: Obtener productos (GET) y crear producto (POST)
// ============================================
import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { jwtVerify } from 'jose'; // Importamos la librería

// Función auxiliar para verificar el Token
async function verificarToken(request: Request) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) return false;

    try {
        const token = authHeader.split(' ')[1];
        const secret = new TextEncoder().encode(import.meta.env.JWT_SECRET || 'secreto-respaldo');
        await jwtVerify(token, secret); // Verificamos que la firma matemática sea correcta
        return true;
    } catch {
        return false;
    }
}

// GET /api/productos — Leer todos los productos (Público, para que la tienda los muestre)
export const GET: APIRoute = async ({ request }) => {
    try {
        const db = env.DB;
        const url = new URL(request.url);
        const categoria = url.searchParams.get('categoria');

        let query = 'SELECT * FROM productos WHERE activo = 1';
        const params: string[] = [];

        if (categoria) {
            query += ' AND categoria = ?';
            params.push(categoria);
        }

        query += ' ORDER BY created_at DESC';

        const { results } = await db.prepare(query).bind(...params).all();

        return new Response(JSON.stringify(results), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Error al obtener productos' }), { status: 500 });
    }
};

// POST /api/productos — Crear un nuevo producto (Protegido con JWT)
export const POST: APIRoute = async ({ request }) => {
    // 🔒 1. Verificamos la llave antes de continuar
    const autorizado = await verificarToken(request);
    if (!autorizado) {
        return new Response(JSON.stringify({ error: 'No autorizado. Token inválido o ausente.' }), { status: 401 });
    }

    // 2. Si tiene la llave válida, procedemos a crear
    try {
        const db = env.DB;
        const body = await request.json();
        const { nombre, precio, stock, descripcion, imagen, categoria } = body;

        const result = await db.prepare(
            'INSERT INTO productos (nombre, precio, stock, descripcion, imagen, categoria) VALUES (?, ?, ?, ?, ?, ?)'
        ).bind(nombre, precio, stock || 0, descripcion || '', imagen || '', categoria).run();

        return new Response(JSON.stringify({ success: true, id: result.meta.last_row_id }), { status: 201 });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Error al crear producto' }), { status: 500 });
    }
};

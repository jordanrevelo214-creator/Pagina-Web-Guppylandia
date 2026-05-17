// ============================================
// API: Verificar contraseña del admin y generar JWT
// ============================================
import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { SignJWT } from 'jose';

export const POST: APIRoute = async ({ request }) => {
    try {
        const db = env.DB;
        const { clave } = await request.json();

        // Buscamos la contraseña en la BD
        const result = await db.prepare(
            'SELECT clave FROM admin_config WHERE id = 1'
        ).first();

        // Si la contraseña coincide...
        if (result && result.clave === clave) {

            // 1. Preparamos nuestra clave secreta del archivo .env
            const secret = new TextEncoder().encode(import.meta.env.JWT_SECRET || 'secreto-respaldo');

            // 2. Fabricamos el JWT
            const token = await new SignJWT({ role: 'admin' })
                .setProtectedHeader({ alg: 'HS256' })
                .setIssuedAt()
                .setExpirationTime('8h') // El token será válido por 8 horas
                .sign(secret);

            // 3. Devolvemos el token al navegador del usuario
            return new Response(JSON.stringify({ success: true, token: token }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return new Response(JSON.stringify({ error: 'Contraseña incorrecta' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Error del servidor' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};

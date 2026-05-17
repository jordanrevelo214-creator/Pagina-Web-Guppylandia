// ============================================
// API: Autenticación, Login (POST) y Cambio de Contraseña (PUT)
// ============================================
import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { SignJWT, jwtVerify } from 'jose';

// Función para cifrar la contraseña con SHA-256 usando Web Crypto API
async function hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Función auxiliar para verificar el JWT Token del Administrador
async function verificarToken(request: Request): Promise<boolean> {
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

// POST /api/auth — Iniciar sesión y emitir JWT
export const POST: APIRoute = async ({ request }) => {
    try {
        const db = env.DB;
        const { clave } = await request.json();

        // 1. Obtener la clave almacenada en la base de datos
        const result = await db.prepare(
            'SELECT clave FROM admin_config WHERE id = 1'
        ).first();

        if (!result) {
            return new Response(JSON.stringify({ error: 'Configuración de administrador no encontrada' }), { status: 404 });
        }

        const storedClave = result.clave as string;
        let isMatch = false;

        // 2. Comprobar si la clave coincide (soporta texto plano heredado y SHA-256 de 64 caracteres)
        if (storedClave.length === 64) {
            const hashedInput = await hashPassword(clave);
            isMatch = (storedClave === hashedInput);
        } else {
            // Retrocompatibilidad: contraseña semilla sin hash
            isMatch = (storedClave === clave);
        }

        // Si la contraseña coincide...
        if (isMatch) {
            // Preparamos nuestra clave secreta del archivo .env
            const secret = new TextEncoder().encode(import.meta.env.JWT_SECRET || 'secreto-respaldo');

            // Fabricamos el JWT
            const token = await new SignJWT({ role: 'admin' })
                .setProtectedHeader({ alg: 'HS256' })
                .setIssuedAt()
                .setExpirationTime('8h') // El token será válido por 8 horas
                .sign(secret);

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

// PUT /api/auth — Cambiar contraseña (Protegido con JWT)
export const PUT: APIRoute = async ({ request }) => {
    // 🔒 1. Validar el token de administrador antes de hacer nada
    const autorizado = await verificarToken(request);
    if (!autorizado) {
        return new Response(JSON.stringify({ error: 'No autorizado. Token inválido o ausente.' }), { status: 401 });
    }

    try {
        const db = env.DB;
        const { currentPassword, newPassword } = await request.json();

        if (!newPassword || newPassword.length < 6) {
            return new Response(JSON.stringify({ error: 'La nueva contraseña debe tener al menos 6 caracteres.' }), { status: 400 });
        }

        // 2. Obtener la clave actual de la BD
        const result = await db.prepare(
            'SELECT clave FROM admin_config WHERE id = 1'
        ).first();

        if (!result) {
            return new Response(JSON.stringify({ error: 'Configuración no encontrada' }), { status: 404 });
        }

        const storedClave = result.clave as string;
        let isMatch = false;

        // 3. Verificar contraseña actual
        if (storedClave.length === 64) {
            const hashedInput = await hashPassword(currentPassword);
            isMatch = (storedClave === hashedInput);
        } else {
            isMatch = (storedClave === currentPassword);
        }

        if (!isMatch) {
            return new Response(JSON.stringify({ error: 'La contraseña actual es incorrecta.' }), { status: 400 });
        }

        // 4. Cifrar la nueva contraseña en SHA-256
        const hashedNewPassword = await hashPassword(newPassword);

        // 5. Actualizar la base de datos
        await db.prepare(
            'UPDATE admin_config SET clave = ? WHERE id = 1'
        ).bind(hashedNewPassword).run();

        return new Response(JSON.stringify({ success: true, message: 'Contraseña actualizada correctamente.' }), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Error al cambiar la contraseña' }), { status: 500 });
    }
};

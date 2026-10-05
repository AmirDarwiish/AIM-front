import { cookies } from 'next/headers';
import config from '../public/config.json';
export const SESSION_COOKIE = 'aim_admin_session';
export function apiBase() {
    const url = new URL(process.env.AIM_API_BASE_URL || config.apiBaseUrl);
    if (!['https:', 'http:'].includes(url.protocol))
        throw new Error('Invalid API origin');
    return url.origin;
}
export const cookieOptions = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' as const, path: '/', maxAge: 7200 };
export function sameOrigin(request: Request) {
    const origin = request.headers.get('origin');
    if (!origin || request.headers.get('sec-fetch-site') === 'cross-site') return false;
    try {
        const parsed = new URL(origin);
        // Next may reconstruct request.url using an internal hostname behind a proxy.
        // Host is the browser's destination; do not trust a caller's forwarded host.
        return origin === parsed.origin && ['https:', 'http:'].includes(parsed.protocol)
            && parsed.host === request.headers.get('host');
    } catch { return false; }
}
export async function clearSession() { (await cookies()).set(SESSION_COOKIE, '', { ...cookieOptions, maxAge: 0 }); }
export function sessionUser(token: string) {
    try {
        const claims = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString('utf8'));
        if (!Number.isFinite(claims.exp) || claims.exp * 1000 <= Date.now())
            return null;
        return { fullName: String(claims['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || claims.unique_name || 'مدير الموقع') };
    }
    catch {
        return null;
    }
}
export function fail(message: string, status: number) { return Response.json({ error: message }, { status, headers: { 'Cache-Control': 'no-store' } }); }
// Only the documented dashboard operations can be forwarded.
export function allowedPath(method: string, path: string) {
    if (method === 'GET' && path === 'public/website/home')
        return true;
    const list = method === 'GET';
    if (path === 'admin/site-settings')
        return list || method === 'PUT';
    if (path === 'admin/leads')
        return list;
    if (/^admin\/leads\/\d+$/.test(path))
        return list;
    if (/^admin\/leads\/\d+\/notes$/.test(path))
        return list || method === 'POST';
    if (/^admin\/leads\/\d+\/status$/.test(path))
        return method === 'PATCH';
    if (/^admin\/(sliders|sections)$/.test(path))
        return list || method === 'POST';
    if (/^admin\/(sliders|sections)\/\d+$/.test(path))
        return list || ['PUT', 'DELETE'].includes(method);
    if (/^admin\/sliders\/\d+\/activate$/.test(path))
        return method === 'POST';
    if (/^admin\/sections\/\d+\/items$/.test(path))
        return list || method === 'POST';
    if (/^admin\/sections\/\d+\/items\/\d+$/.test(path))
        return ['PUT', 'DELETE'].includes(method);
    if (/^admin\/lookups\/(business-categories|cities)$/.test(path))
        return list || method === 'POST';
    if (/^admin\/lookups\/(business-categories|cities)\/\d+$/.test(path))
        return ['PUT', 'DELETE'].includes(method);
    if (path === 'admin/media')
        return method === 'POST';
    if (/^admin\/media\/\d+$/.test(path))
        return method === 'DELETE';
    return false;
}

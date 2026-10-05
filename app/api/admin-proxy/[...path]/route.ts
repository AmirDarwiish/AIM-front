import { cookies } from 'next/headers';
import { apiBase, SESSION_COOKIE, sameOrigin, clearSession, sessionUser, allowedPath, fail } from '@/lib/admin-server';
export const runtime = 'nodejs';
async function proxy(request: Request, context: {
    params: Promise<{
        path: string[];
    }>;
}) {
    const method = request.method;
    if (method !== 'GET' && !sameOrigin(request))
        return fail('طلب غير مسموح.', 403);
    const path = (await context.params).path.join('/');
    if (!allowedPath(method, path))
        return fail('المسار غير متاح.', 404);
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    if (!token || !sessionUser(token)) {
        await clearSession();
        return fail('انتهت الجلسة. سجّل الدخول مرة أخرى.', 401);
    }
    try {
        const contentType = request.headers.get('content-type');
        const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
        if (contentType)
            headers['Content-Type'] = contentType;
        const res = await fetch(`${apiBase()}/api/${path}${new URL(request.url).search}`, { method, headers, body: method === 'GET' ? undefined : await request.arrayBuffer(), cache: 'no-store', signal: AbortSignal.timeout(30000), redirect: 'error' });
        if (res.status === 401)
            await clearSession();
        return new Response(res.status === 204 ? null : await res.arrayBuffer(), { status: res.status, headers: { 'Content-Type': res.headers.get('content-type') || 'application/json', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
    }
    catch {
        return fail('تعذر الاتصال بالسيرفر. حاول مرة أخرى.', 502);
    }
}
export { proxy as GET, proxy as POST, proxy as PUT, proxy as PATCH, proxy as DELETE };

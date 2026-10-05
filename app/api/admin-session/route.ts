import { cookies } from 'next/headers';
import { apiBase, SESSION_COOKIE, cookieOptions, sameOrigin, clearSession, sessionUser, fail } from '@/lib/admin-server';
export const runtime = 'nodejs';
export async function GET() {
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    const user = token && sessionUser(token);
    if (!user) {
        await clearSession();
        return fail('يرجى تسجيل الدخول.', 401);
    }
    return Response.json(user, { headers: { 'Cache-Control': 'no-store' } });
}
export async function POST(request: Request) {
    if (!sameOrigin(request))
        return fail('طلب غير مسموح.', 403);
    try {
        const body = await request.json().catch(() => null) as {
            email?: unknown;
            password?: unknown;
        } | null;
        if (!body || typeof body.email !== 'string' || typeof body.password !== 'string' || !body.email.trim() || !body.password)
            return fail('أدخل البريد الإلكتروني وكلمة المرور.', 400);
        const res = await fetch(`${apiBase()}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: body.email.trim(), password: body.password }), cache: 'no-store', signal: AbortSignal.timeout(20000), redirect: 'error' });
        if (!res.ok)
            return fail(res.status === 401 ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة.' : 'تعذر تسجيل الدخول. حاول مرة أخرى.', res.status);
        const data = await res.json() as {
            token?: unknown;
            fullName?: string;
        };
        if (typeof data.token !== 'string' || !sessionUser(data.token))
            return fail('استجابة تسجيل الدخول غير صالحة.', 502);
        (await cookies()).set(SESSION_COOKIE, data.token, cookieOptions);
        return Response.json({ fullName: data.fullName || 'مدير الموقع' }, { headers: { 'Cache-Control': 'no-store' } });
    }
    catch {
        return fail('تعذر الاتصال بالسيرفر. حاول مرة أخرى.', 502);
    }
}
export async function DELETE(request: Request) {
    if (!sameOrigin(request))
        return fail('طلب غير مسموح.', 403);
    await clearSession();
    return new Response(null, { status: 204 });
}

export type AdminUser = {
    fullName: string;
};
export type RecordData = Record<string, string | number | boolean | null | undefined> & {
    id?: number;
};
export type LeadRecord = {
    id: number;
    requestType: number | string;
    fullName: string;
    phone: string;
    email?: string;
    businessName?: string;
    businessCategoryId?: number;
    cityId?: number;
    message?: string;
    status: number | string;
    createdAtUtc: string;
    updatedAtUtc?: string;
};
export type PageResult = {
    items: LeadRecord[];
    totalCount: number;
    page: number;
    pageSize: number;
};
export type LeadActivity = {
    notes: {
        id: number;
        content: string;
        createdAtUtc: string;
        createdByUserId: number;
    }[];
    statusHistory: {
        id: number;
        previousStatus: string;
        newStatus: string;
        changedAtUtc: string;
    }[];
};
export type MediaRecord = {
    id: number;
    url: string;
};
export class AdminError extends Error {
    constructor(public status: number, message: string) { super(message); }
}
export async function adminRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
    const isSession = path === 'session';
    let res: Response;
    try {
        res = await fetch(isSession ? '/api/admin-session' : `/api/admin-proxy/${path}`, { ...options, cache: 'no-store', headers: { ...(options.body && !(options.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}), ...options.headers } });
    }
    catch (e) {
        if (e instanceof DOMException && e.name === 'AbortError')
            throw e;
        throw new AdminError(0, 'تعذر الاتصال. تحقق من الإنترنت وحاول مرة أخرى.');
    }
    const data = await res.json().catch(() => null) as {
        errors?: Record<string, string[]>;
        error?: string;
        detail?: string;
    } | null;
    if (!res.ok) {
        if (res.status === 401 && !isSession)
            window.dispatchEvent(new Event('aim-session-expired'));
        const fields = data?.errors ? Object.values(data.errors).flat().join(' • ') : '';
        const message = res.status === 403 ? 'ليس لديك صلاحية لهذا الإجراء. راجع صلاحيات حسابك مع المسؤول.' : res.status === 401 ? (data?.error || 'انتهت الجلسة. سجّل الدخول مرة أخرى.') : fields || data?.error || data?.detail || (res.status >= 500 ? 'حدث خطأ بالسيرفر. حاول مرة أخرى.' : 'تعذر تنفيذ الطلب.');
        const translations:Record<string,string>={
            'Category is referenced by existing leads. Deactivate instead.':'هذا النشاط مرتبط بطلبات موجودة. يمكنك إخفاؤه بدلًا من حذفه.',
            'City is referenced by existing leads. Deactivate instead.':'هذه المدينة مرتبطة بطلبات موجودة. يمكنك إخفاؤها بدلًا من حذفها.',
            'Media is referenced by content and cannot be deleted. Deactivate or remove references first.':'الصورة مستخدمة في محتوى الموقع. أزل ارتباطها بالمحتوى قبل الحذف.'
        };
        throw new AdminError(res.status, translations[String(message)] || String(message));
    }
    return data as T;
}
export const write = <T>(path: string, method: string, data?: unknown) => adminRequest<T>(path, { method, ...(data !== undefined ? { body: JSON.stringify(data) } : {}) });
export const statuses = [{ value: 1, key: 'New', label: 'جديد' }, { value: 2, key: 'Contacted', label: 'تم التواصل' }, { value: 3, key: 'InProgress', label: 'قيد المتابعة' }, { value: 4, key: 'Closed', label: 'مغلق' }];
export function statusValue(value: number | string) { return statuses.find(s => s.value === Number(value) || s.key === value)?.value || 1; }
export function statusLabel(value: number | string) { return statuses.find(s => s.value === Number(value) || s.key === value)?.label || String(value); }
export function requestLabel(value: number | string) { return value === 1 || value === 'BusinessJoin' ? 'انضمام نشاط' : 'استفسار عام'; }
export function dateLabel(value?: string) { if (!value)
    return '—'; const date = new Date(/(Z|[+-]\d{2}:?\d{2})$/i.test(value) ? value : `${value}Z`); return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' }); }

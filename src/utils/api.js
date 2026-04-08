export const BACKEND_URL = 'https://supportsmartschoolserp.com';
const BASE_URL = `${BACKEND_URL}/api`;
// const BASE_URL = 'http://localhost:5001/api';

const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
};

const handleResponse = async (res) => {
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Request failed');
    return data;
};

// Upload a file — returns { url, filename, ... }
export const apiUploadFile = async (file, folder = 'general') => {
    const token = localStorage.getItem('token');
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch(`${BASE_URL}/upload/${folder}`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
    });
    return handleResponse(res);
};



// ─── Auth ─────────────────────────────────────────────────────
export const apiLogin = async (email, password) => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    return handleResponse(res);
};

export const apiGetMe = async () => {
    const res = await fetch(`${BASE_URL}/auth/me`, { headers: getHeaders() });
    return handleResponse(res);
};

// ─── Requests ─────────────────────────────────────────────────
export const apiGetRequests = async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const res = await fetch(`${BASE_URL}/requests?${params}`, { headers: getHeaders() });
    return handleResponse(res);
};

export const apiGetRequestStats = async () => {
    const res = await fetch(`${BASE_URL}/requests/stats`, { headers: getHeaders() });
    return handleResponse(res);
};

export const apiGetRequestById = async (id) => {
    const res = await fetch(`${BASE_URL}/requests/${id}`, { headers: getHeaders() });
    return handleResponse(res);
};

export const apiCreateRequest = async (data) => {
    const res = await fetch(`${BASE_URL}/requests`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    return handleResponse(res);
};

export const apiUpdateRequestStatus = async (id, status, remarks) => {
    const res = await fetch(`${BASE_URL}/requests/${id}/status`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ status, remarks }),
    });
    return handleResponse(res);
};

export const apiDispatchRequest = async (id, trackingInfo) => {
    const res = await fetch(`${BASE_URL}/requests/${id}/dispatch`, {
        method: 'PATCH',
        headers: getHeaders(), // Ensure getHeaders() handles JSON content-type
        body: JSON.stringify({
            status: 'DISPATCHED',
            tracking_info: trackingInfo
        }),
    });
    return handleResponse(res);
};

// ─── Students ─────────────────────────────────────────────────
export const apiGetStudentsByRequest = async (requestId) => {
    const res = await fetch(`${BASE_URL}/students/request/${requestId}`, { headers: getHeaders() });
    return handleResponse(res);
};

export const apiBulkCreateStudents = async (students, tenant_id, request_id) => {
    const res = await fetch(`${BASE_URL}/students/bulk`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ students, tenant_id, request_id }),
    });
    return handleResponse(res);
};

export const apiAddStudent = async (data) => {
    const res = await fetch(`${BASE_URL}/students`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    return handleResponse(res);
};

export const apiDeleteStudent = async (id) => {
    const res = await fetch(`${BASE_URL}/students/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
    });
    return handleResponse(res);
};


// ─── Samples ─────────────────────────────────────────────────
export const apiGetSamplesByRequest = async (requestId) => {
    const res = await fetch(`${BASE_URL}/samples/request/${requestId}`, { headers: getHeaders() });
    return handleResponse(res);
};

export const apiCreateSample = async (data) => {
    const res = await fetch(`${BASE_URL}/samples`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    return handleResponse(res);
};

// ─── Approvals ────────────────────────────────────────────────
export const apiGetApprovalsByRequest = async (requestId) => {
    const res = await fetch(`${BASE_URL}/approvals/request/${requestId}`, { headers: getHeaders() });
    return handleResponse(res);
};

export const apiGetTimeline = async (requestId) => {
    const res = await fetch(`${BASE_URL}/approvals/timeline/${requestId}`, { headers: getHeaders() });
    return handleResponse(res);
};

export const apiCreateApproval = async (data) => {
    const res = await fetch(`${BASE_URL}/approvals`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    return handleResponse(res);
};

// ─── Tenants ─────────────────────────────────────────────────
export const apiGetTenants = async () => {
    const res = await fetch(`${BASE_URL}/tenants`, { headers: getHeaders() });
    return handleResponse(res);
};

export const apiCreateTenant = async (data) => {
    const res = await fetch(`${BASE_URL}/tenants`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    return handleResponse(res);
};

export const apiUpdateTenant = async (id, data) => {
    const res = await fetch(`${BASE_URL}/tenants/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    return handleResponse(res);
};

// ─── Users ────────────────────────────────────────────────────
export const apiGetUsers = async () => {
    const res = await fetch(`${BASE_URL}/users`, { headers: getHeaders() });
    return handleResponse(res);
};

export const apiGetAdminStats = async () => {
    const res = await fetch(`${BASE_URL}/users/stats`, { headers: getHeaders() });
    return handleResponse(res);
};

export const apiCreateUser = async (data) => {
    const res = await fetch(`${BASE_URL}/users`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    return handleResponse(res);
};

export const apiUpdateUser = async (id, data) => {
    const res = await fetch(`${BASE_URL}/users/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    return handleResponse(res);
};

export const apiResetUserPassword = async (id, password) => {
    const res = await fetch(`${BASE_URL}/users/${id}/reset-password`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ password }),
    });
    return handleResponse(res);
};

// ─── Marketing ───────────────────────────────────────────────
export const apiGetMarketingSchools = async () => {
    const res = await fetch(`${BASE_URL}/marketing/schools`, { headers: getHeaders() });
    return handleResponse(res);
};

// Admin-only: returns ALL schools regardless of agent role (for Assign Leads page)
export const apiGetAllMarketingSchools = async () => {
    const res = await fetch(`${BASE_URL}/marketing/schools/all`, { headers: getHeaders() });
    return handleResponse(res);
};

export const apiCreateMarketingSchool = async (data) => {
    const res = await fetch(`${BASE_URL}/marketing/schools`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    return handleResponse(res);
};

export const apiGetMarketingSchoolDetail = async (id) => {
    const res = await fetch(`${BASE_URL}/marketing/schools/${id}`, { headers: getHeaders() });
    return handleResponse(res);
};

export const apiUpdateMarketingSchool = async (id, data) => {
    const res = await fetch(`${BASE_URL}/marketing/schools/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    return handleResponse(res);
};

export const apiAssignSchool = async (data) => {
    const res = await fetch(`${BASE_URL}/marketing/assign`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    return handleResponse(res);
};

export const apiLogMarketingActivity = async (data) => {
    const res = await fetch(`${BASE_URL}/marketing/activities`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    return handleResponse(res);
};

export const apiGetMyMarketingActivities = async () => {
    const res = await fetch(`${BASE_URL}/marketing/activities/my`, { headers: getHeaders() });
    return handleResponse(res);
};

export const apiGetPendingFollowUps = async () => {
    const res = await fetch(`${BASE_URL}/marketing/activities/followups`, { headers: getHeaders() });
    return handleResponse(res);
};

export const apiUpdateActivityStatus = async (id, status) => {
    const res = await fetch(`${BASE_URL}/marketing/activities/${id}/status`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ status }),
    });
    return handleResponse(res);
};

export const apiGetAgentStats = async (id) => {
    const res = await fetch(`${BASE_URL}/marketing/agent/${id}/stats`, { headers: getHeaders() });
    return handleResponse(res);
};

// ─── Ticketing ───────────────────────────────────────────────
export const apiGetTickets = async () => {
    const res = await fetch(`${BASE_URL}/ticketing`, { headers: getHeaders() });
    return handleResponse(res);
};

export const apiGetTicketById = async (id) => {
    const res = await fetch(`${BASE_URL}/ticketing/${id}`, { headers: getHeaders() });
    return handleResponse(res);
};

export const apiCreateTicket = async (data) => {
    const res = await fetch(`${BASE_URL}/ticketing`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    return handleResponse(res);
};

export const apiUpdateTicket = async (id, data) => {
    const res = await fetch(`${BASE_URL}/ticketing/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    return handleResponse(res);
};

export const apiGetDevelopers = async () => {
    const res = await fetch(`${BASE_URL}/ticketing/developers`, { headers: getHeaders() });
    return handleResponse(res);
};

// ─── Orders ──────────────────────────────────────────────────
export const apiGetOrders = async () => {
    const res = await fetch(`${BASE_URL}/orders`, { headers: getHeaders() });
    return handleResponse(res);
};

export const apiGetOrderStats = async () => {
    const res = await fetch(`${BASE_URL}/orders/stats`, { headers: getHeaders() });
    return handleResponse(res);
};

export const apiGetOrdersBySchool = async (school_id) => {
    const res = await fetch(`${BASE_URL}/orders/school/${school_id}`, { headers: getHeaders() });
    return handleResponse(res);
};

export const apiGetOrderById = async (id) => {
    const res = await fetch(`${BASE_URL}/orders/${id}`, { headers: getHeaders() });
    return handleResponse(res);
};

export const apiCreateOrder = async (data) => {
    const res = await fetch(`${BASE_URL}/orders`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    return handleResponse(res);
};

export const apiUpdateOrder = async (id, data) => {
    const res = await fetch(`${BASE_URL}/orders/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    return handleResponse(res);
};

export const apiDeleteOrder = async (id) => {
    const res = await fetch(`${BASE_URL}/orders/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
    });
    return handleResponse(res);
};

// ─── Payments ─────────────────────────────────────────────────
export const apiCreateRzpOrder = async (order_id, amount) => {
    const res = await fetch(`${BASE_URL}/payments/create-order`, {
        method: 'POST', headers: getHeaders(),
        body: JSON.stringify({ order_id, amount }),
    });
    return handleResponse(res);
};

export const apiVerifyRzpPayment = async (data) => {
    const res = await fetch(`${BASE_URL}/payments/verify-payment`, {
        method: 'POST', headers: getHeaders(),
        body: JSON.stringify(data),
    });
    return handleResponse(res);
};

export const apiRecordCashPayment = async (order_id, amount) => {
    const res = await fetch(`${BASE_URL}/payments/record-cash`, {
        method: 'POST', headers: getHeaders(),
        body: JSON.stringify({ order_id, amount }),
    });
    return handleResponse(res);
};

export const apiGetOrderPayments = async (order_id) => {
    const res = await fetch(`${BASE_URL}/payments/history/${order_id}`, {
        headers: getHeaders(),
    });
    return handleResponse(res);
};

export const apiGetAllPayments = async () => {
    const res = await fetch(`${BASE_URL}/payments/all-history`, {
        headers: getHeaders(),
    });
    return handleResponse(res);
};

export const apiGetPaymentStats = async () => {
    const res = await fetch(`${BASE_URL}/payments/stats`, {
        headers: getHeaders(),
    });
    return handleResponse(res);
};



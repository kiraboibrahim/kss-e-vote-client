import { UserRole } from "./types";
import { storeVoter } from "./utils";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function validateStudentId(studentId: string, pin: string) {
    const response = await fetch(`${API_BASE_URL}/auth/voter/login/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            voter_no: studentId.trim(),
            pin: pin.trim()
        }),
    });

    const data = await response.json();
    
    if (!data.success) {
        throw new Error(data.message || 'Invalid Voter No');
    }
    storeVoter(data.data);
    return data.data;
}

export async function loginAdmin(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/viewer/login/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email: email.trim(),
            password: password.trim()
        }),
    });

    const data = await response.json();

    if (!data.success) {
        throw new Error(data.message || 'Login failed');
    }

    return data.data;
}

export async function authenticate(
    role: UserRole,
    credentials: { studentId?: string; pin?: string; email?: string; password?: string }
) {
    if (role === 'voter') {
        if (!credentials.studentId?.trim()) {
            throw new Error('Voter Number is required');
        }
        if (!credentials.pin?.trim()) {
            throw new Error('PIN is required');
        }
        return await validateStudentId(credentials.studentId, credentials.pin);
    } else {
        if (!credentials.email?.trim() || !credentials.password?.trim()) {
            throw new Error('Email and password are required');
        }
        return await loginAdmin(credentials.email, credentials.password);
    }
}
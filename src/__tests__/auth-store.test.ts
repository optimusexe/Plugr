jest.mock('@/lib/azure/postgres', () => ({
  query: jest.fn(),
  execute: jest.fn(),
}));
jest.mock('@/lib/azure/messaging', () => ({
  sendOtpEmail: jest.fn(),
  sendEmail: jest.fn(),
}));
jest.mock('@/lib/audit', () => ({
  logAudit: jest.fn(),
}));

import crypto from 'crypto';
import { query as mockQuery, execute as mockExecute } from '@/lib/azure/postgres';
import { sendEmail } from '@/lib/azure/messaging';

// Import after mocks
import { verifyUserPassword, deactivateAccount, deleteAccountWithNotify } from '@/lib/auth-store';

describe('auth-store integrations (unit-level with mocks)', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('verifyUserPassword returns true for correct password', async () => {
    const password = 'secret123';
    const hash = crypto.createHash('sha256').update(password).digest('hex');

    (mockQuery as jest.Mock).mockResolvedValueOnce({ rows: [{ id: 'u_1', full_name: 'Test', email: 'a@b.com', password_hash: hash, verified: true, is_admin: false, deactivated_until: null, verification_code: null, verification_code_expires_at: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }] });

    const ok = await verifyUserPassword('u_1', password);
    expect(ok).toBe(true);
  });

  test('deactivateAccount rejects past or too long dates', async () => {
    const pastDate = new Date(Date.now() - 1000).toISOString();
    (mockQuery as jest.Mock).mockResolvedValue({ rows: [{ id: 'u_2', full_name: 'X', email: 'x@x.com', password_hash: 'h', verified: true, is_admin: false, deactivated_until: null, verification_code: null, verification_code_expires_at: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }] });

    await expect(deactivateAccount('u_2', pastDate)).rejects.toThrow();

    const farFuture = new Date(Date.now() + 366 * 24 * 60 * 60 * 1000).toISOString();
    await expect(deactivateAccount('u_2', farFuture)).rejects.toThrow(/cannot exceed/);
  });

  test('deleteAccountWithNotify calls delete statements and sends email', async () => {
    (mockQuery as jest.Mock).mockResolvedValueOnce({ rows: [{ id: 'u_3', email: 'z@z.com', full_name: 'Z', password_hash: 'h', verified: true, is_admin: false, deactivated_until: null, verification_code: null, verification_code_expires_at: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }] });
    (mockExecute as jest.Mock).mockResolvedValue({});

    await deleteAccountWithNotify('u_3');

    expect(mockExecute).toHaveBeenCalled();
    expect(sendEmail).toHaveBeenCalledWith('z@z.com', expect.any(String), expect.any(String));
  });
});

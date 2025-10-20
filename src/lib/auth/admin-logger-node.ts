import { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function logAdminOperationNode(
  operationType: 'create_member' | 'adjust_credits' | 'login' | 'logout',
  adminUsername: string,
  description: string,
  targetUserId?: string,
  targetUserEmail?: string,
  creditAmount?: number,
  beforeBalance?: number,
  afterBalance?: number,
  request?: NextRequest
): Promise<void> {
  const supabase = createServerSupabaseClient();

  const ipAddress =
    (request as any)?.ip ||
    request?.headers.get('x-forwarded-for') ||
    request?.headers.get('x-real-ip') ||
    'unknown';

  const userAgent = request?.headers.get('user-agent') || 'unknown';

  await supabase.from('admin_operation_logs').insert({
    admin_username: adminUsername,
    operation_type: operationType,
    target_user_id: targetUserId || null,
    target_user_email: targetUserEmail || null,
    credit_amount: creditAmount || 0,
    before_balance: beforeBalance || 0,
    after_balance: afterBalance || 0,
    description,
    ip_address: ipAddress,
    user_agent: userAgent,
  });
}

export const runtime = 'nodejs';


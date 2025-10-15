/**
 * 管理后台首页
 * 
 * 重定向到管理后台仪表板
 */

import { redirect } from 'next/navigation';

export default function AdminPage() {
  // 重定向到管理后台仪表板
  redirect('/admin/dashboard');
}

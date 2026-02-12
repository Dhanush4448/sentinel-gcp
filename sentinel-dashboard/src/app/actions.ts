'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function clearAllLogs() {
  try {
    await prisma.securityLog.deleteMany({});
    // This tells Next.js to refresh the page data immediately
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Failed to clear logs:', error);
    return { success: false };
  }
}

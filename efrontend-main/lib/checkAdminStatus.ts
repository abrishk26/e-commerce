// lib/checkAdminAccess.ts
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

interface UserProfile {
  role: string;
  // Add other expected fields
}

export async function checkAdminAccess(): Promise<UserProfile> {
  const cookieStore = await cookies(); // ✅ Add `await` here
  const accessToken = cookieStore.get('accessToken')?.value;

  if (!accessToken) {
    redirect('/unauthorized');
  }

  try {
    console.log('Token: ', accessToken)
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
    const res = await fetch(`${apiUrl}/v1/profile`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      redirect('/unauthorized');
    }

    let user: UserProfile;
    try {
      user = await res.json() as UserProfile;
    } catch (error) {
      console.error('Error parsing user profile:', error);
      redirect('/unauthorized');
    }

    if (user?.role !== 'admin') {
      redirect('/unauthorized');
    }

    return user;
  } catch (error) {
    console.error('Error checking admin access:', error);
    redirect('/unauthorized');
  }
}
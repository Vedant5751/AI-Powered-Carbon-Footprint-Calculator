import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Define the protected routes that require authentication
const protectedPaths = [
  '/dashboard',
  '/calculator',
  '/trends',
  '/history',
  '/recommendations',
  '/profile',
];

export async function middleware(request: NextRequest) {
  // Get the path of the request
  const path = request.nextUrl.pathname;
  
  // Check if the path is in the protected paths list
  const isProtectedPath = protectedPaths.some(protectedPath => 
    path === protectedPath || path.startsWith(`${protectedPath}/`)
  );
  
  // If the path is not protected, allow the request
  if (!isProtectedPath) {
    return NextResponse.next();
  }
  
  // Get the token from the request
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  });
  
  // If there is no token and the path is protected, redirect to the login page
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    
    // Add the callbackUrl so the user is redirected back after login
    loginUrl.searchParams.set('callbackUrl', path);
    
    return NextResponse.redirect(loginUrl);
  }
  
  // If the token exists, allow the request
  return NextResponse.next();
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/calculator/:path*',
    '/trends/:path*',
    '/history/:path*',
    '/recommendations/:path*',
    '/profile/:path*',
    '/dashboard',
    '/calculator',
    '/trends',
    '/history',
    '/recommendations',
    '/profile',
  ],
}; 
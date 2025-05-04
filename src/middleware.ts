import { clerkMiddleware } from '@clerk/nextjs/server'

// Pass the clerkMiddleware to Next.js as middleware
export default clerkMiddleware();

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}; 
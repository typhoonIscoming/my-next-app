import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export const config = {
    matcher: ['/((?!api|_next|.*\\..*).*)'],
};
export default createMiddleware(routing);

// const protectedRoutes = [
//     { path: '/admin', role: 'admin' },
//     { path: '/dashboard', role: 'user' },
// ];

// const PUBLIC_FILE = /\.(.*)$/;

// export function middleware(request: NextRequest) {
//     const { pathname } = request.nextUrl;

//     if (
//         pathname.startsWith('/_next') ||
//         pathname.startsWith('/api') ||
//         PUBLIC_FILE.test(pathname)
//     ) {
//         return NextResponse.next();
//     }

//     const auth = request.cookies.get('auth')?.value;
//     const role = request.cookies.get('role')?.value;

//     const protectedRoute = protectedRoutes.find(
//         (route) =>
//             pathname === route.path || pathname.startsWith(`${route.path}/`)
//     );

//     if (!protectedRoute) {
//         return NextResponse.next();
//     }

//     if (auth !== 'true') {
//         const loginUrl = new URL('/login', request.url);
//         loginUrl.searchParams.set('from', pathname);
//         return NextResponse.redirect(loginUrl);
//     }

//     if (protectedRoute.role === 'admin' && role !== 'admin') {
//         const loginUrl = new URL('/login', request.url);
//         loginUrl.searchParams.set('from', pathname);
//         loginUrl.searchParams.set('error', 'permission');
//         return NextResponse.redirect(loginUrl);
//     }

//     return NextResponse.next();
// }

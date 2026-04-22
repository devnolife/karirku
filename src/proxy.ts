/**
 * MOCK MODE — middleware disabled.
 * Di mode UI/UX demo tidak ada proteksi route berbasis session.
 */
import { NextResponse } from "next/server";

export default function middleware() {
  return NextResponse.next();
}

export const config = {
  matcher: [],
};

import Link from 'next/link'
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { Sparkles } from 'lucide-react'

export function Navbar() {
  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
      <Link href="/" className="flex items-center gap-2 font-black tracking-tight text-ink">
        <span className="rounded-2xl bg-ink p-2 text-cream"><Sparkles size={18} /></span>
        WaitlistForCreators
      </Link>
      <nav className="flex items-center gap-3 text-sm font-semibold">
        <SignedOut>
          <Link href="/sign-in" className="rounded-full px-4 py-2 text-slate-700 hover:text-ink">Sign in</Link>
          <Link href="/sign-up" className="rounded-full bg-ink px-4 py-2 text-white shadow-lg shadow-slate-900/20">Start free</Link>
        </SignedOut>
        <SignedIn>
          <Link href="/dashboard" className="rounded-full bg-white px-4 py-2 text-ink shadow-sm ring-1 ring-slate-200">Dashboard</Link>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
      </nav>
    </header>
  )
}

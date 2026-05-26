import { Navbar } from '@/components/Navbar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="bg-slate-950 text-white">
        <Navbar />
      </div>
      {children}
    </>
  )
}

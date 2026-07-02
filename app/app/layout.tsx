import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LocalDateSync from '@/components/LocalDateSync'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  // LocalDateSync writes the `vitality_local_date` cookie so the workout logger
  // rolls over at the user's local midnight, not Vercel's UTC clock.
  return (
    <>
      <LocalDateSync />
      {children}
    </>
  )
}

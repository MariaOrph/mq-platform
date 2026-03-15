import AdminDashboard from '@/components/AdminDashboard'

// Client Admins use the same AdminDashboard component.
// The component detects the role internally and restricts
// what data is shown (company-only cohorts, no per-dimension scores).
export default function ClientPage() {
  return <AdminDashboard />
}

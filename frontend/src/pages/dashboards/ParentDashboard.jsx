import DashboardPage from '../../components/dashboard/DashboardPage.jsx';

export default function ParentDashboard() {
  return (
    <DashboardPage
      title="Parent Dashboard"
      subtitle="Monitor your children's attendance and learning progress."
      stats={[
        { label: 'Children', value: '—', description: 'Coming soon' },
        { label: 'Attendance', value: '—', description: 'Coming soon' },
        { label: 'Progress', value: '—', description: 'Coming soon' },
      ]}
    >
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Family Overview</h2>
        <p className="mt-2 text-sm text-slate-600">
          Your children&apos;s attendance and progress reports will appear here.
        </p>
      </div>
    </DashboardPage>
  );
}

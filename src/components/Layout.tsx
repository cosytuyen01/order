import BottomNav from './BottomNav'
import PageHeader from './PageHeader'
import ReminderBanner from './ReminderBanner'
import ScheduleReminderWatcher from './ScheduleReminderWatcher'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-page pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))]">
      <ScheduleReminderWatcher />
      <ReminderBanner />

      <div className="sticky top-0 z-40">
        <PageHeader />
      </div>

      <main className="relative z-10 min-h-[calc(100vh-10rem)] flex-1 bg-page px-4 py-5 md:px-6">
        {children}
      </main>

      <BottomNav />
    </div>
  )
}

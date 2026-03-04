import { usePlannerStore } from './store/usePlannerStore';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import Dashboard from './components/Dashboard/Dashboard';
import Tasks from './components/Tasks/Tasks';
import CalendarView from './components/Calendar/CalendarView';
import DailyPlanner from './components/DailyPlanner/DailyPlanner';
import Goals from './components/Goals/Goals';
import Notes from './components/Notes/Notes';

export default function App() {
  const { activeSection } = usePlannerStore();

  const sectionMap = {
    dashboard: <Dashboard />,
    tasks: <Tasks />,
    calendar: <CalendarView />,
    daily: <DailyPlanner />,
    goals: <Goals />,
    notes: <Notes />,
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          {sectionMap[activeSection]}
        </main>
      </div>
    </div>
  );
}

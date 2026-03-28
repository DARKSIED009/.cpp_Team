import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import Landing from './Landing';
import Dashboard from './Dashboard';
import Onboarding from './Onboarding';
import Simulator from './Simulator';
import AdminPanel from './AdminPanel';
import ScoreExplanation from './ScoreExplanation';
import Sidebar from './Sidebar';

function AppLayout() {
    return (
        <div className="app-layout">
            <Sidebar />
            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Full screen routes */}
                <Route path="/" element={<Landing />} />
                <Route path="/onboarding" element={<Onboarding />} />

                {/* Dashboard layout routes with Sidebar */}
                <Route element={<AppLayout />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/simulator" element={<Simulator />} />
                    <Route path="/admin" element={<AdminPanel />} />
                    <Route path="/score-explanation" element={<ScoreExplanation />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

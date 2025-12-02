import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/layout';
import {
    DashboardPage,
    DocumentViewPage,
    DocumentsPage,
    SettingsPage,
    HelpPage,
} from '@/pages';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<Layout />}>
                    <Route path="/" element={<DashboardPage />} />
                    <Route path="/documents" element={<DocumentsPage />} />
                    <Route path="/documents/:id" element={<DocumentViewPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/help" element={<HelpPage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;

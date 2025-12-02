import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { ThemeProvider } from '@/contexts';
import {
    DashboardPage,
    DocumentViewPage,
    DocumentsPage,
    SettingsPage,
    HelpPage,
} from '@/pages';

function App() {
    return (
        <ThemeProvider>
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
        </ThemeProvider>
    );
}

export default App;

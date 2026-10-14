import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { AppProvider } from './context/AppContextT0T1';
import { AppProviderT2T3 } from './context/AppContextT2T3';
import HomePage from './pages/HomePage';
import UploadPage from './pages/t0t1/UploadPageT0T1';
import ValidationPage from './pages/t0t1/ValidationPageT0T1';
import PreviewPage from './pages/t0t1/PreviewPageT0T1';
import ExportPage from './pages/t0t1/ExportPageT0T1';
import SendPage from './pages/t0t1/SendPageT0T1';
import UploadPageT2T3 from './pages/t2t3/UploadPageT2T3';
import ValidationPageT2T3 from './pages/t2t3/ValidationPageT2T3';
import PreviewPageT2T3 from './pages/t2t3/PreviewPageT2T3';
import ExportPageT2T3 from './pages/t2t3/ExportPageT2T3';
import SendPageT2T3 from './pages/t2t3/SendPageT2T3';

function T0Shell() {
  return <AppProvider><Outlet /></AppProvider>;
}

function T2Shell() {
  return <AppProviderT2T3><Outlet /></AppProviderT2T3>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />

        {/* T0/T1 flow — single AppProvider wraps all child routes */}
        <Route path="/t0" element={<T0Shell />}>
          <Route index element={<UploadPage />} />
          <Route path="validate" element={<ValidationPage />} />
          <Route path="preview" element={<PreviewPage />} />
          <Route path="export" element={<ExportPage />} />
          <Route path="send" element={<SendPage />} />
        </Route>

        {/* T2/T3 flow — single AppProviderT2T3 wraps all child routes */}
        <Route path="/t2" element={<T2Shell />}>
          <Route index element={<UploadPageT2T3 />} />
          <Route path="validate" element={<ValidationPageT2T3 />} />
          <Route path="preview" element={<PreviewPageT2T3 />} />
          <Route path="export" element={<ExportPageT2T3 />} />
          <Route path="send" element={<SendPageT2T3 />} />
        </Route>

        {/* Legacy root routes redirect to T0/T1 */}
        <Route path="/validate" element={<Navigate to="/t0/validate" replace />} />
        <Route path="/preview" element={<Navigate to="/t0/preview" replace />} />
        <Route path="/export" element={<Navigate to="/t0/export" replace />} />
        <Route path="/send" element={<Navigate to="/t0/send" replace />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

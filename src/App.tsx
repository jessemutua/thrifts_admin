// src/App.tsx
// Which screen shows for which address. Signed out: only the sign-in screen. Signed in: the shell with its sections.
// To add a section: a route here, and an entry in NAV in ui/components/portalShell.tsx.
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { SessionProvider, useSession } from './features/session/hooks/useSession';
import { SignInScreen } from './features/session/screens/SignInScreen';
import { PortalShell } from './ui/components/portalShell';
import { ToastProvider } from './ui/components/toastNote';
import { LoadingNote } from './ui/components/stateNotes';
import { HomeScreen } from './features/home/screens/HomeScreen';
import { ShopListScreen } from './features/shops/screens/ShopListScreen';
import { ShopDetailScreen } from './features/shops/screens/ShopDetailScreen';
import { PeopleScreen } from './features/people/screens/PeopleScreen';
import { FeedbackScreen } from './features/feedback/screens/FeedbackScreen';
import { MetricsScreen } from './features/metrics/screens/MetricsScreen';
import { OnlineStoresScreen } from './features/online/screens/OnlineStoresScreen';
import { AppSettingsScreen } from './features/appSettings/screens/AppSettingsScreen';

function Gate() {
  const { state } = useSession();
  if (state === 'checking') return <div className="signin"><LoadingNote /></div>;
  if (state === 'signedOut') return <SignInScreen />;
  return (
    <Routes>
      <Route element={<PortalShell />}>
        <Route index element={<HomeScreen />} />
        <Route path="metrics" element={<MetricsScreen />} />
        <Route path="online" element={<OnlineStoresScreen />} />
        <Route path="shops" element={<ShopListScreen />} />
        <Route path="shops/:shopId" element={<ShopDetailScreen />} />
        <Route path="people" element={<PeopleScreen />} />
        <Route path="feedback" element={<FeedbackScreen />} />
        <Route path="app" element={<AppSettingsScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <SessionProvider>
        <ToastProvider>
          <Gate />
        </ToastProvider>
      </SessionProvider>
    </BrowserRouter>
  );
}

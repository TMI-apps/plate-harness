import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import { QueryProvider } from "@/shared/context/QueryProvider";
import { AuthProvider } from "@/shared/context/AuthContext";
import { Topbar } from "@/layouts/Topbar";
import { DevTasksFab } from "@/features/tasks/components/DevTasksFab/DevTasksFab";
import { QueryDevtoolsGate } from "@/components/common/QueryDevtoolsGate";
import { MainLayout } from "@/layouts/MainLayout/MainLayout";
import { PageLoadingState } from "@/components/common/PageLoadingState";
import { QueryErrorBoundary } from "@/components/common/QueryErrorBoundary";

const HomePage = lazy(() => import("@/pages/HomePage").then((m) => ({ default: m.HomePage })));
const TasksPage = lazy(() =>
  import("@/pages/tasks/TasksPage").then((m) => ({ default: m.TasksPage }))
);
const LoginPage = lazy(() => import("@/pages/LoginPage").then((m) => ({ default: m.LoginPage })));
const ResetPasswordPage = lazy(() =>
  import("@/pages/ResetPasswordPage").then((m) => ({ default: m.ResetPasswordPage }))
);
const AuthCallbackPage = lazy(() =>
  import("@/pages/AuthCallbackPage").then((m) => ({ default: m.AuthCallbackPage }))
);

function AppContent() {
  const theme = useTheme();
  const location = useLocation();
  const isTasksRoute = location.pathname === "/tasks";

  return (
    <>
      {!isTasksRoute && <Topbar />}
      <Box
        sx={{
          pt: isTasksRoute ? 0 : `${theme.mixins.toolbar.minHeight}px`,
        }}
      >
        <QueryErrorBoundary>
          <Suspense fallback={<PageLoadingState />}>
            <Routes>
              <Route element={<MainLayout />}>
                <Route path="/" element={<HomePage />} />
              </Route>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/auth/callback" element={<AuthCallbackPage />} />
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </QueryErrorBoundary>
      </Box>
      <DevTasksFab />
      <QueryDevtoolsGate />
    </>
  );
}

function App() {
  return (
    <QueryProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AuthProvider>
    </QueryProvider>
  );
}

export default App;

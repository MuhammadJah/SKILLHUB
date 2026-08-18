import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";
import TenderDetail from "./pages/TenderDetail";


function ProtectedRoute({ component: Component, requiredRole }: { component: any; requiredRole?: 'admin' | 'user' }) {
  const { isAuthenticated, profile } = useAuth();
  
  if (!isAuthenticated) {
    return <Login />;
  }
  
  if (requiredRole === 'admin' && profile?.role !== 'admin') {
    return <NotFound />;
  }
  
  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/login"} component={Login} />
      <Route path={"/admin"} component={() => <ProtectedRoute component={AdminDashboard} requiredRole="admin" />} />
      <Route path={"/dashboard"} component={() => <ProtectedRoute component={UserDashboard} />} />
      <Route path={"/tender/:id"} component={({ params }) => <TenderDetail params={params} />} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider
          defaultTheme="light"
          // switchable
        >
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;

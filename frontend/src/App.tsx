import { useEffect } from "react";
import { AppShell } from "./components/layout/AppShell";
import { isTokenValid, useAuth } from "./context/AuthContext";
import { useRoute } from "./hooks/useRoute";
import { Signin, Signup } from "./pages/Auth";
import { Home } from "./pages/Home";
import { Landing } from "./pages/Landing";
import { Profile } from "./pages/Profile";
import { TweetDetail } from "./pages/TweetDetail";
import { redirect } from "./utils/navigation";

export function App() {
  const path = useRoute();

  if (path === "/") return isTokenValid() ? <Redirect to="/home" /> : <Landing />;
  if (path === "/auth/signin") return isTokenValid() ? <Redirect to="/home" /> : <Signin />;
  if (path === "/auth/signup") return isTokenValid() ? <Redirect to="/home" /> : <Signup />;

  return <ProtectedRoute path={path} />;
}

function ProtectedRoute({ path }: { path: string }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated || !isTokenValid()) return <Redirect to="/auth/signin" />;

  if (path === "/home" || path === "/feed" || path === "/explore") {
    return <AppShell><Home /></AppShell>;
  }

  if (path.startsWith("/api/users/")) {
    return <AppShell><Profile username={decodeURIComponent(path.split("/").pop() || "")} /></AppShell>;
  }

  if (path.startsWith("/api/tweet/")) {
    return <AppShell><TweetDetail tweetId={Number(path.split("/").pop())} /></AppShell>;
  }

  return <Redirect to="/home" />;
}

function Redirect({ to }: { to: string }) {
  useEffect(() => { redirect(to); }, [to]);
  return null;
}

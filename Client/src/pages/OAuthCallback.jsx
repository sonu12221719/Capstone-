import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Landing page after Google OAuth server-side redirect.
 * URL: /oauth-callback?token=ACCESS_TOKEN
 * Stores the token, fetches the user profile, then redirects to dashboard.
 */
export default function OAuthCallback() {
  const [params] = useSearchParams();
  const { fetchProfile } = useAuth();
  const navigate = useNavigate();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const token = params.get("token");
    if (!token) {
      navigate("/login?error=oauth_failed", { replace: true });
      return;
    }

    localStorage.setItem("token", token);
    fetchProfile().then(() => {
      navigate("/dashboard", { replace: true });
    }).catch(() => {
      localStorage.removeItem("token");
      navigate("/login?error=oauth_failed", { replace: true });
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-14 h-14 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600 font-medium">Signing you in with Google...</p>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRightLeft, User, LogOut } from "lucide-react";
import NotificationCenter from "./NotificationCenter";

const Navigation = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if user is logged in by checking for token in localStorage
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, [location.pathname]); // Re-check when route changes

  const handleLogout = () => {
    // Remove token from localStorage
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    // Redirect to home page
    navigate('/');
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <button 
              onClick={() => handleNavigation('/')}
              className="flex items-center hover:opacity-80 transition-opacity"
            >
              <ArrowRightLeft className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">SlotSwapper</span>
            </button>
          </div>

          {/* Navigation Items */}
          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              // Logged in state
              <>
                <Button variant="ghost" onClick={() => handleNavigation('/dashboard')}>
                  <User className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
                <Button variant="ghost" onClick={() => handleNavigation('/marketplace')}>
                  Marketplace
                </Button>
                <Button variant="ghost" onClick={() => handleNavigation('/requests')}>
                  Requests
                </Button>
                <NotificationCenter />
                <Button variant="outline" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              // Logged out state
              <>
                <Button variant="ghost" onClick={() => handleNavigation('/')}>
                  Home
                </Button>
                <Button variant="ghost" onClick={() => handleNavigation('/login')}>
                  Login
                </Button>
                <Button onClick={() => handleNavigation('/signup')}>
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
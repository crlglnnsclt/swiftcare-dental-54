import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, Stethoscope, LogOut, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="fixed top-0 w-full z-50 glass-card border-b border-white/20">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="medical-gradient p-2 rounded-xl group-hover:scale-110 smooth-transition">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-medical-blue to-dental-mint bg-clip-text text-transparent">
              SwiftCare
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-foreground hover:text-medical-blue smooth-transition font-medium">
              Home
            </Link>
            <a href="/#features" className="text-foreground hover:text-medical-blue smooth-transition font-medium">
              Features
            </a>
            <a href="/#roles" className="text-foreground hover:text-medical-blue smooth-transition font-medium">
              Roles
            </a>
            {user && (
              <Link to="/dashboard" className="text-foreground hover:text-medical-blue smooth-transition font-medium">
                Dashboard
              </Link>
            )}
            <a href="/#contact" className="text-foreground hover:text-medical-blue smooth-transition font-medium">
              Contact
            </a>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-medical-blue" />
                  <span className="text-sm text-foreground">
                    {profile?.full_name || user.email}
                  </span>
                  <span className="text-xs bg-medical-blue/10 text-medical-blue px-2 py-1 rounded-full">
                    {profile?.role || 'user'}
                  </span>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/profile')}
                  className="hover:bg-medical-blue hover:text-white smooth-transition"
                >
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleSignOut}
                  className="hover:bg-destructive hover:text-destructive-foreground smooth-transition"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <>
                <Button variant="ghost" className="text-foreground hover:text-medical-blue" asChild>
                  <Link to="/auth">Sign In</Link>
                </Button>
                <Button asChild className="medical-gradient btn-3d hover:shadow-lg text-white px-6">
                  <Link to="/auth">
                    Get Started
                  </Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-lg hover:bg-white/10 smooth-transition"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-foreground" />
            ) : (
              <Menu className="w-6 h-6 text-foreground" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-white/20">
            <nav className="flex flex-col space-y-4 mt-4">
              <Link 
                to="/" 
                className="text-foreground hover:text-medical-blue smooth-transition font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <a 
                href="/#features" 
                className="text-foreground hover:text-medical-blue smooth-transition font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Features
              </a>
              <a 
                href="/#roles" 
                className="text-foreground hover:text-medical-blue smooth-transition font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Roles
              </a>
              {user && (
                <Link 
                  to="/dashboard" 
                  className="text-foreground hover:text-medical-blue smooth-transition font-medium py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
              )}
              <a 
                href="/#contact" 
                className="text-foreground hover:text-medical-blue smooth-transition font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </a>
              <div className="flex flex-col space-y-2 pt-4 border-t border-white/20">
                {user ? (
                  <div className="space-y-2">
                    <div className="text-sm text-foreground py-2">
                      {profile?.full_name || user.email}
                      <span className="block text-xs text-muted-foreground">
                        {profile?.role || 'user'}
                      </span>
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full hover:bg-medical-blue hover:text-white smooth-transition"
                      onClick={() => {
                        navigate('/profile');
                        setIsMenuOpen(false);
                      }}
                    >
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full hover:bg-destructive hover:text-destructive-foreground smooth-transition"
                      onClick={handleSignOut}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <>
                    <Button variant="ghost" className="justify-start text-foreground hover:text-medical-blue" asChild>
                      <Link to="/auth">Sign In</Link>
                    </Button>
                    <Button asChild className="medical-gradient btn-3d text-white">
                      <Link to="/auth">
                        Get Started
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
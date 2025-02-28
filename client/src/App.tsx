import { useState } from 'react';
import PostList from "./components/PostsList";
import Registration from "./components/Registration";
import Login from "./components/Login";
import ProfileMenu from './components/ProfileMenu';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(true);
  const [userEmail, setUserEmail] = useState('');

  const handleLoginSuccess = (email: string) => {
    setIsLoggedIn(true);
    setUserEmail(email);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserEmail('');
    setShowLogin(true);
  };

  const toggleAuthMode = () => {
    setShowLogin(!showLogin);
  };

  return (
    <div className="p-2">
      {!isLoggedIn ? (
        <div className="container">
          {showLogin ? (
            <div>
              <Login onLoginSuccess={handleLoginSuccess} />
              <p className="text-center mt-3">
                Don't have an account?{' '}
                <button 
                  className="btn btn-link p-0" 
                  onClick={toggleAuthMode}
                >
                  Sign up
                </button>
              </p>
            </div>
          ) : (
            <div>
              <Registration onRegisterSuccess={handleLoginSuccess} />
              <p className="text-center mt-3">
                Already have an account?{' '}
                <button 
                  className="btn btn-link p-0" 
                  onClick={toggleAuthMode}
                >
                  Log in
                </button>
              </p>
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="d-flex justify-content-end mb-3">
            <ProfileMenu onLogout={handleLogout} userEmail={userEmail} />
          </div>
          <PostList />
        </div>
      )}
    </div>
  );
}

export default App;
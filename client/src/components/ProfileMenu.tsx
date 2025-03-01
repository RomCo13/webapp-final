import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt, faUser } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import './ProfileMenu.css';

interface ProfileMenuProps {
  onLogout: () => void;
  userEmail: string;
}

function ProfileMenu({ onLogout, userEmail }: ProfileMenuProps) {
  const [showDropdown, setShowDropdown] = useState(false);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleLogout = () => {
    // Clear all items from localStorage
    localStorage.clear();
    // Call the original onLogout handler
    onLogout();
  };

  // Get first letter of email for avatar
  const userInitial = userEmail.charAt(0).toUpperCase();

  return (
    <div className="profile-menu">
      <button 
        className="profile-button"
        onClick={toggleDropdown}
        title={userEmail}
      >
        <div className="profile-button-content">
          <span className="profile-avatar">{userInitial}</span>
          <span className="profile-name">{userEmail}</span>
        </div>
      </button>
      
      {showDropdown && (
        <div className="profile-dropdown">
          <Link 
           to="/profile" 
           className="dropdown-item"
           onClick={() => setShowDropdown(false)}>
          <div className="user-info">
            <span className="profile-avatar-small">{userInitial}</span>
            <span className="user-label">Profile</span>
          </div>
          <div className="dropdown-divider"></div>
          </Link>
          <button 
            className="dropdown-item text-danger" 
            onClick={handleLogout}
            style={{ padding: "0.75rem 1rem" }}
          >
            <FontAwesomeIcon icon={faSignOutAlt} className="me-3" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

export default ProfileMenu; 
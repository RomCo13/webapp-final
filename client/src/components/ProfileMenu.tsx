import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt, faEdit } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import './ProfileMenu.css';
import { editProfile, IUser } from '../services/user-service'; // Import the service

interface ProfileMenuProps {
  onLogout: () => void;
  userEmail: string;
}

function ProfileMenu({ onLogout, userEmail }: ProfileMenuProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [email, setEmail] = useState(userEmail);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
    setShowEditForm(false); // Reset edit form when closing dropdown
    setError(null);
    setSuccess(null);
  };

  const handleLogout = () => {
    localStorage.clear();
    onLogout();
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const updates: Partial<IUser> = {};
      if (email && email !== userEmail) updates.email = email;
      if (password) updates.password = password;

      if (Object.keys(updates).length === 0) {
        setError('No changes to submit');
        return;
      }

      const updatedUser = await editProfile(updates);
      setSuccess('Profile updated successfully');
      setEmail(updatedUser.email); // Update local email state
      setPassword(''); // Clear password field
      setTimeout(() => setSuccess(null), 2000); // Clear success message after 2s
    } catch (err) {
      console.log(err);
    }
  };

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
            onClick={() => setShowDropdown(false)}
          >
            <div className="user-info">
              <span className="profile-avatar-small">{userInitial}</span>
              <span className="user-label">Profile</span>
            </div>
          </Link>
          
          <button
            className="dropdown-item"
            onClick={() => setShowEditForm(!showEditForm)}
            style={{ padding: "0.75rem 1rem" }}
          >
            <FontAwesomeIcon icon={faEdit} className="me-3" />
            Edit Profile
          </button>

          {showEditForm && (
            <form onSubmit={handleEditSubmit} className="edit-profile-form p-3">
              <div className="mb-2">
                <label htmlFor="email" className="form-label">Email</label>
                <input
                  type="email"
                  id="email"
                  className="form-control form-control-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter new email"
                />
              </div>
              <div className="mb-2">
                <label htmlFor="password" className="form-label">Password</label>
                <input
                  type="password"
                  id="password"
                  className="form-control form-control-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                />
              </div>
              {error && <div className="text-danger small mb-2">{error}</div>}
              {success && <div className="text-success small mb-2">{success}</div>}
              <button type="submit" className="btn btn-primary btn-sm w-100">
                Save Changes
              </button>
            </form>
          )}

          <div className="dropdown-divider"></div>
          
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
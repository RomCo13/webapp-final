import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGlobe, faUser } from '@fortawesome/free-solid-svg-icons';
import './TabNav.css';

function TabNav() {
  const location = useLocation();
  const currentPath = location.pathname;
  
  return (
    <div className="tab-navigation">
      <Link 
        to="/" 
        className={`tab-item ${currentPath === '/' ? 'active' : ''}`}
      >
        <FontAwesomeIcon icon={faGlobe} />
        <span>All Posts</span>
      </Link>
      <Link 
        to="/profile" 
        className={`tab-item ${currentPath === '/profile' ? 'active' : ''}`}
      >
        <FontAwesomeIcon icon={faUser} />
        <span>My Posts</span>
      </Link>
    </div>
  );
}

export default TabNav; 
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
    const navigate = useNavigate();

    // This hook forces the Navbar to re-render whenever the route changes
    const location = useLocation();

    // Check if the user has a VIP wristband
    const token = localStorage.getItem('token');

    // The Logout function
    const handleLogout = () => {
        localStorage.removeItem('token'); // Shred the wristband
        navigate('/login');               // Kick user to the login page
    };

    return (
        <nav className='bg-surface border-b border-gray-800 p-4'>
            <div className='container mx-auto flex justify-between items-center'>
                <Link to="/" className="text-xl font-bold text-primary">
                    FitnessTracker
                </Link>

                <div className='space-x-6 flex items-center'>
                    {token ? (
                        <>
                            <Link to="/dashboard" className='text-textMuted hover:text-textMain transition-colors'>
                                Dashboard
                            </Link>
                            <button
                                onClick={handleLogout}
                                className='text-danger hover:text-red-400 font-medium transition-colors'
                            >
                                Log out
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to='/login' className='text-textMuted hover:text-textMain transition-colors'>
                                Log in
                            </Link>
                            <Link
                                to="/register"
                                className='bg-primary hover:bg-primaryHover text-white px-4 py-2 rounded transition-colors'
                            >
                                Sign up
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar

import { Link } from 'react-router-dom';

const Navbar = () => {
    return (
        <nav className='bg-surface border-b border-gray-800 p-4'>
            <div className='container mx-auto flex justify-between items-center'>
                <Link to="/" className="text-xl font-bold text-primary">
                    FitnessTracker
                </Link>

                <div className='space-x-6 flex items-center'>
                    <Link to='/login' className="text-textMuted hover:text-textMain transition-colors">
                        Log in
                    </Link>
                    <Link
                        to="/register"
                        className="bg-primary hover:bg-primaryHover text-white px-4 py-2 rounded transition-colors">
                        Sign up
                    </Link>
                </div>
            </div>
        </nav>
    );
}

export default Navbar

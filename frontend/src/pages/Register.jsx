import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    const navigate = useNavigate();

    // State to hold user input
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
    });

    // State for UI feedback
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Handle typing in the inputs
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent the page from refreshing
        setError('');
        setLoading(true);

        try {
            // Send the POST request to FastAPI
            const response = await axios.post('http://localhost:8000/register', formData);

            console.log("Success:", response.data);
            // On success, redirect the user to the login page
            navigate('/login');
        } catch (err) {
            // If FastAPI returns an error (like "username taken"), display it
            if (err.response && err.response.data.detail) {
                setError(err.response.data.detail);
            } else {
                setError("An unexpected error occurred. Is the server running?");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='flex justify-center items-center mt-16'>
            <div className='bg-surface p-8 rounded-lg shadow-lg w-full max-w-md'>
                <h2 className='text-3xl font-bold mb-6 text-center text-textMain'>
                    Sign Up
                </h2>

                {error && (
                    <div className="bg-danger/10 border border-danger text-danger p-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className='space-y-4'>
                    <div>
                        <label className='block text-textMuted mb-1 text-sm'>Username</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className="w-full bg-background border border-gray-700 rounded p-2 text-textMain focus:outline-none focus:border-primary"
                            required
                        />
                    </div>
                    <div>
                        <label className='block text-textMuted mb-1 text-sm'>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full bg-background border border-gray-700 rounded p-2 text-textMain focus:outline-none focus:border-primary"
                            required
                        />
                    </div>
                    <div>
                        <label className='block text-textMuted mb-1 text-sm'>Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full bg-background border border-gray-700 rounded p-2 text-textMain focus:outline-none focus:border-primary"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary hover:bg-primaryHover text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>
                <p className='mt-4 text-center text-sm text-textMuted'>
                    Already have an account? <Link to="/login" className='text-primary hover:underline'>Log in</Link>
                </p>
            </div>
        </div>
    )
}

export default Register

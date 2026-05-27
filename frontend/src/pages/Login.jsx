import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await axios.post("http://localhost:8000/login", formData);

            // Save the VIP wristband to the browser's local storage
            localStorage.setItem('token', response.data.access_token);

            // Redirect to the Dashboard!
            navigate('/dashboard');
        } catch (err) {
            if (err.response && err.response.data.detail) {
                setError(err.response.data.detail);
            } else {
                setError("Unable to connect to the server.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='flex justify-center items-center mt-16'>
            <div className='bg-surface p-8 rounded-lg shadow-lg w-full max-w-md'>
                <h2 className='text-3xl font-bold mb-6 text-center text-textMain'>
                    Welcome Back
                </h2>

                {error && (
                    <div className='bg-danger/10 border border-danger text-danger p-3 rounded mb-4'>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className='space-y-4'>
                    <div>
                        <label className='block text-textMuted mb-1 text-sm'>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className='w-full bg-background border border-gray-700 rounded p-2 text-textMain focus:outline-none focus:border-primary'
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
                            className='w-full bg-background border border-gray-700 rounded p-2 text-textMain focus:outline-none focus:border-primary'
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className='w-full bg-primary hover:bg-primaryHover text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50'
                    >
                        {loading ? "Logging in..." : "Log In"}
                    </button>
                </form>

                <p className='mt-4 text-center text-sm text-textMuted'>
                    Don't have an account? <Link to="/register" className='text-primary hover:underline'>Sign up</Link>
                </p>
            </div>
        </div>
    );
}


export default Login

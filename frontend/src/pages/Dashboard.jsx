import { use, useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            // Check if the user has a token
            const token = localStorage.getItem('token');

            if (!token) {
                // No wristband? Kick them back to login.
                navigate('/login');
                return;
            }

            try {
                // Fetch the secure profile route, attaching the token to the header
                const response = await axios.get('http://localhost:8000/users/me', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                // Save the data to state
                setUser(response.data);
            } catch (error) {
                console.error("Auth error:", error);
                // If the token is fake or expired, destroy it and kick them out
                localStorage.removeItem('token');
                navigate('/login');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [navigate]);

    if (loading) {
        return <div className='text-center mt-20 text-textMuted'>Loading dashboard...</div>;
    }

    return (
        <div className="mt-10">
            <h1 className='text-3xl font-bold text-textMain mb-6'>
                Welcome back, <span className='text-primary'>{user?.username}</span>!
            </h1>
            <div className='bg-surface p-6 rounded-lg shadow-lg'>
                <h2 className='text-xl text-primary mb-4'>Your Stats</h2>
                <p className='text-textMuted'>This is where your workout data will live.</p>
            </div>
        </div>
    );
}

export default Dashboard

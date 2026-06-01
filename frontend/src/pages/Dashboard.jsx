import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const [profile, setProfile] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem('token');

            if (!token) {
                navigate('/login');
                return;
            }

            try {
                const response = await axios.get('http://localhost:8000/users/me', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setProfile(response.data);
            } catch (error) {
                console.error('Auth error:', error);
                localStorage.removeItem('token');
                navigate('/login');
            }
        };

        fetchProfile();
    }, [navigate]);

    const testLogSession = async () => {
        const token = localStorage.getItem('token');

        const testSession = {
            focus: 'upper_body',
            notes: 'Testing from the React Dashboard!',
            logs: [
                { name: 'Bench Press', set_number: 1, reps: 8, weight_lbs: 135 },
                { name: 'Bench Press', set_number: 2, reps: 8, weight_lbs: 135 },
            ]
        };

        try {
            const response = await axios.post('http://localhost:8000/sessions', testSession, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log("SUCCESS! Session saved:", response.data);
            alert("Session Saved! Check your browser consle.");
        } catch (error) {
            console.error("FAILED TO SAVE:", error);
            alert("Failed to save. Check your browser console.");
        }
    };

    if (!profile) {
        return <div className='p-8 text-center text-textMuted'>
            Loading dashboard...
        </div>
    }

    return (
        <div className="container mx-auto p-8 max-w-4xl">
            <div className='bg-surface border border-gray-800 rounded-xl p-8 mb-8 shadow-lg'>
                <div className='flex justify-between items-center mb-6'>
                    <h1 className='text-3xl font-bold text-textMain'>
                        Welcome back, {profile.username}!
                    </h1>
                    <div className='text-sm text-textMuted'>
                        Member since: {new Date(profile.created_at).toLocaleDateString()}
                    </div>
                </div>

                <button
                    onClick={testLogSession}
                    className='bg-primary hover:bg-primaryHover text-white px-6 py-3 rounded-lg font-medium transition-colors'
                >
                    Test Logging a Session
                </button>
            </div>
        </div>
    );
}

export default Dashboard

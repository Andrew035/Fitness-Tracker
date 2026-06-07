import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const [profile, setProfile] = useState(null);
    const navigate = useNavigate();

    // Form State
    const [focus, setFocus] = useState('upper_body');
    const [notes, setNotes] = useState('');
    const [logs, setLogs] = useState([
        { name: '', set_number: 1, reps: '', weight_lbs: '', distance_miles: '', duration_seconds: '' }
    ]);
    const [statusMsg, setStatusMsg] = useState({ test: '', type: '' });

    // History State
    const [history, setHistory] = useState([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);

    // Fetching Data
    const fetchHistory = async (token) => {
        try {
            const response = await axios.get('http://localhost:8000/sessions', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setHistory(response.data);
        } catch (error) {
            console.error('Failed to fetch history:', error);
        } finally {
            setIsLoadingHistory(false);
        }
    }

    useEffect(() => {
        const fetchProfileAndData = async () => {
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

                // Fetch history immediately after confirming the user
                await fetchHistory(token);

            } catch (error) {
                localStorage.removeItem('token');
                navigate('/login');
            }
        };
        fetchProfileAndData();
    }, [navigate]);


    // Form Handlers
    const addExerciseRow = () => {
        setLogs([
            ...logs,
            { name: '', set_number: logs.length + 1, reps: '', weight_lbs: '', distance_miles: '', duration_seconds: '' }
        ])
    }

    const updateLog = (index, field, value) => {
        const newLogs = [...logs];
        newLogs[index][field] = value;
        setLogs(newLogs);
    };

    const removeLog = (index) => {
        const newLogs = logs.filter((_, i) => i !== index);
        setLogs(newLogs);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatusMsg({ text: 'Saving session...', type: 'loading' });
        const token = localStorage.getItem('token');

        // Clean the data: Convert strings to numbers and drop empty rows
        const cleanedLogs = logs
            .filter(log => log.name.trim() !== '') // Must have an exercise name
            .map(log => ({
                name: log.name,
                set_number: parseInt(log.set_number) || null,
                reps: parseInt(log.reps) || null,
                weight_lbs: parseFloat(log.weight_lbs) || null,
                distance_miles: parseFloat(log.distance_miles) || null,
                duration_seconds: parseInt(log.duration_seconds) || null,
            }));

        const sessionData = {
            focus: focus,
            notes: notes || null,
            logs: cleanedLogs
        };

        try {
            await axios.post('http://localhost:8000/sessions', sessionData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setStatusMsg({ text: 'Workout saved successfully!', type: 'success' });

            // Reset form for the next workout
            setNotes('');
            setLogs([{ name: '', set_number: 1, reps: '', weight_lbs: '', distance_miles: '', duration_seconds: '' }])

            // Instantly refresh the histroy feed!
            fetchHistory(token);

            setTimeout(() => setStatusMsg({ text: '', type: '' }), 3000);
        } catch (error) {
            console.error("Save error:", error);
            setStatusMsg({ text: 'Failed to save workout. Check console.', type: 'error' });
        }
    };

    // Helper Formatters
    const formatFocus = (focusStr) => {
        return focusStr.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    const formatDate = (dateString) => {
        const options = { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    if (!profile) {
        return <div className='p-8 text-center text-textMuted'>Loading dashboard...</div>
    }

    return (
        <div className='container mx-auto p-8 max-w-4xl'>
            <div className='flex justify-between items-center mb-8'>
                <h1 className='text-3xl font-bold text-textMain'>Dashboard</h1>
                <div className='text-sm text-textMuted'>
                    Logged in as {profile.username}
                </div>
            </div>

            {/* Workout Entry Form */}
            <div className='bg-surface border border-gray-800 rounded-xl p-8 shadow-lg'>
                <h2 className='text-2xl font-semibold text-textMain mb-6 border-b border-gray-800 pb-4'>Log a Session</h2>

                <form onSubmit={handleSubmit} className='space-y-6'>
                    {/* Top Section: Focus & Notes */}
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                        <div className='flex flex-col'>
                            <label className='text-sm font-medium text-textMuted mb-2'>Workout Focus</label>
                            <select
                                value={focus}
                                onChange={(e) => setFocus(e.target.value)}
                                className='bg-[#1e1e2e] border border-gray-700 text-textMain rounded-lg p-3 focus:outline-none focus:border-primary transition-colors'
                            >
                                <option value="upper_body">Upper Body</option>
                                <option value="lower_body">Lower Body</option>
                                <option value="cardio">Cardio</option>
                                <option value="full_body">Full Body</option>
                            </select>
                        </div>

                        <div className='flex flex-col md:col-span-2'>
                            <label className='text-sm font-medium text-textMuted mb-2'>Session Notes</label>
                            <input
                                type="text"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder='How did it feel today?'
                                className='bg-[#1e1e2e] border border-gray-700 text-textMain rounded-lg p-3 focus:outline-none focus:border-primary transition-colors'
                            />
                        </div>
                    </div>

                    {/* Dynamic Exercise Logs */}
                    <div className='mt-8'>
                        <div className='flex justify-between items-end mb-4'>
                            <h3 className='text-lg font-medium text-textMain'>Exercises</h3>
                        </div>

                        <div className='space-y-3'>
                            {logs.map((log, index) => (
                                <div key={index} className='grid grid-cols-12 gap-3 items-center bg-[#181825] p-3 rounded-lg border border-gray-800/50'>
                                    <div className="col-span-12 md:col-span-3">
                                        <input type="text" placeholder="Exercise Name" value={log.name} onChange={(e) => updateLog(index, 'name', e.target.value)} className='w-full bg-transparent border border-gray-700 rounded p-2 text-textMain text-sm focus:border-primary focus:outline-none' required />
                                    </div>

                                    <div className="col-span-4 md:col-span-1">
                                        <input type="number" placeholder="Set" value={log.set_number} onChange={(e) => updateLog(index, 'set_number', e.target.value)} className='w-full bg-transparent border border-gray-700 rounded p-2 text-textMain text-sm focus:border-primary focus:outline-none' />
                                    </div>

                                    <div className="col-span-4 md:col-span-2">
                                        <input type="number" placeholder="Reps" value={log.reps} onChange={(e) => updateLog(index, 'reps', e.target.value)} className='w-full bg-transparent border border-gray-700 rounded p-2 text-sm  focus:border-primary focus:outline-none' />
                                    </div>

                                    <div className="col-span-4 md:col-span-2">
                                        <input type="number" placeholder="Weight (lbs)" value={log.weight_lbs} onChange={(e) => updateLog(index, 'weight_lbs', e.target.value)} className='w-full bg-transparent border border-gray-700 rounded p-2 text-textMain text-sm focus:border-primary focus:outline-none' />
                                    </div>

                                    <div className="col-span-6 md:col-span-2">
                                        <input type="number" step="0.1" placeholder="Miles" value={log.distance_miles} onChange={(e) => updateLog(index, 'distance_miles', e.target.value)} className='w-full bg-transparent border border-gray-700 rounded p-2 text-textMain text-sm focus:border-primary focus:outline-none' />
                                    </div>

                                    <div className="col-span-6 md:col-span-2">
                                        <input type="number" step="0.1" placeholder="Duration (seconds)" value={log.duration_seconds} onChange={(e) => updateLog(index, 'duration_seconds', e.target.value)} className='w-full bg-transparent border border-gray-700 rounded p-2 text-textMain text-sm focus:border-primary focus:outline-none' />
                                    </div>

                                    <div className="col-span-4 md:col-span-1">
                                        <button type="button" onClick={() => removeLog(index)} className="w-full text-red-500 hover:text-red-400 p-2 font-bold transition-colors">
                                            X
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button type="button" onClick={addExerciseRow} className='mt-4 text-sm font-medium text-primary hover:text-primaryHover transition-colors flex items-center'>
                            + Add Another Set
                        </button>
                    </div>

                    {/* Submission & Status */}
                    <div className='flex items-center justify-between pt-6 border-t border-gray-800'>
                        <span className={`text-sm font-medium ${statusMsg.type === 'error' ? 'text-red-400' : 'text-green-400'}`}>
                            {statusMsg.text}
                        </span>
                        <button type="submit" className='bg-primary hover:bg-primaryHover text-white px-8 py-3 rounded-lg font-bold transition-colors shadow-lg shadow-primary/20'>
                            Save Session
                        </button>
                    </div>
                </form>
            </div>

            {/* History Feed */}
            <div>
                <h2 className='text-2xl font-semibold text-textMain mb-6 border-b border-gray-800 pb-4'>Recent Sessions</h2>

                {isLoadingHistory ? (
                    <div className='text-textMuted'>Loading history...</div>
                ) : history.length === 0 ? (
                    <div className='text-textMuted bg-surface p-8 rounded-xl border border-gray-800 text-center'>No workouts logged yet. Time to get after it!</div>
                ) : (
                    <div className='space-y-6'>
                        {history.map((session) => (
                            <div key={session.id} className='bg-surface border border-gray-800 rounded-xl p-6'>
                                {/* Session Header */}
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <span className="inline-block px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
                                            {formatFocus(session.focus)}
                                        </span>
                                        <h3 className="text-sm text-textMuted">{formatDate(session.start_time)}</h3>
                                    </div>
                                    {session.notes && (
                                        <div className="bg-[#181825] border border-gray-800/50 px-4 py-2 rounded-lg text-sm text-textMain max-w-xs italic">
                                            "{session.notes}"
                                        </div>
                                    )}
                                </div>

                                {/* Session Logs Table */}
                                {session.logs && session.logs.length > 0 && (
                                    <div className="mt-4 overflow-hidden rounded-lg border border-gray-800/50">
                                        <table className="w-full text-left text-sm text-textMain">
                                            <thead className="bg-[#181825] text-textMuted text-xs uppercase font-medium">
                                                <tr>
                                                    <th className="px-4 py-3">Set</th>
                                                    <th className="px-4 py-3">Reps</th>
                                                    <th className="px-4 py-3">Weight (lbs)</th>
                                                    <th className="px-4 py-3">Distance (mi)</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-800/50 bg-surface">
                                                {session.logs.map((log) => (
                                                    <tr key={log.id} className="hover:bg-[#181825]/50 transition-colors">
                                                        <td className="px-4 py-3 text-textMuted">{log.set_number || '-'}</td>
                                                        <td className="px-4 py-3">{log.reps || '-'}</td>
                                                        <td className="px-4 py-3">{log.weight_lbs || '-'}</td>
                                                        <td className="px-4 py-3">{log.distance_miles || '-'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )

}

export default Dashboard

import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Import components
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

function App() {
    return (
        <BrowserRouter>
            {/* This div ensures the background color stretches to the bottom 
        of the screen even if the page has very little content.
      */}
            <div className="min-h-screen flex flex-col">
                <Navbar />

                {/* Main content area where the pages will swap out */}
                <main className="flex-grow container mx-auto p-4">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                    </Routes>
                </main>
            </div>
        </BrowserRouter>
    )
}

export default App

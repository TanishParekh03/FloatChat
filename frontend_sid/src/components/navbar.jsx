import React, { useState } from "react";
import { LayoutDashboard, Home, Map, Thermometer, Droplets, Gauge, ChartNoAxesCombined, Menu, X } from "lucide-react";
import logo from '../assets/logo.png';


function Navbar({ activePage, setActivePage }) {
    const [mobileOpen, setMobileOpen] = useState(false);

    const navItems = [
        { name: "Home", icon: <Home size={16} /> },
        { name: "Depth Profiles", icon: <ChartNoAxesCombined size={16} /> },
        { name: "Argo Floats", icon: <Map size={16} /> },
        { name: "Temperature", icon: <Thermometer size={16} /> },
        { name: "Salinity", icon: <Droplets size={16} /> },
        { name: "Pressure", icon: <Gauge size={16} /> },
    ];

    function handleNav(name) {
        setActivePage(name);
        setMobileOpen(false);
    }

    return (
        <header className="w-full glass px-4 py-2.5 md:px-6 sticky top-0 z-30 rounded-none" style={{ borderTop: 'none', borderLeft: 'none', borderRight: 'none' }}>
            <div className="flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center gap-2.5 min-w-0">
                    <img src={logo} className="h-7 w-7 md:h-8 md:w-8 rounded-lg" alt="floatCHAT logo" />
                    <span className="text-lg md:text-xl font-semibold tracking-tight text-gradient">floatCHAT</span>
                </div>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-1">
                    {navItems.map((item) => (
                        <button
                            key={item.name}
                            onClick={() => handleNav(item.name)}
                            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                                activePage === item.name
                                    ? 'text-white bg-white/8'
                                    : 'text-white/60 hover:text-white/90 hover:bg-white/4'
                            }`}
                            title={item.name}
                        >
                            <span className={`transition-colors ${activePage === item.name ? 'text-[var(--accent)]' : ''}`}>
                                {item.icon}
                            </span>
                            <span>{item.name}</span>
                            {activePage === item.name && (
                                <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-[var(--accent)] rounded-full" />
                            )}
                        </button>
                    ))}
                </nav>

                {/* Mobile Hamburger */}
                <button
                    className="md:hidden btn-ghost p-1.5 rounded-lg"
                    onClick={() => setMobileOpen(!mobileOpen)}
                    aria-label="Toggle navigation"
                >
                    {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            {/* Mobile Nav Dropdown */}
            {mobileOpen && (
                <nav className="md:hidden mt-2 pb-2 flex flex-col gap-0.5 animate-slide-up">
                    {navItems.map((item) => (
                        <button
                            key={item.name}
                            onClick={() => handleNav(item.name)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                activePage === item.name
                                    ? 'text-white bg-white/8 border-l-2 border-[var(--accent)]'
                                    : 'text-white/60 hover:text-white/90 hover:bg-white/4'
                            }`}
                        >
                            <span className={activePage === item.name ? 'text-[var(--accent)]' : ''}>{item.icon}</span>
                            <span>{item.name}</span>
                        </button>
                    ))}
                </nav>
            )}
        </header>
    );
}

export default Navbar;
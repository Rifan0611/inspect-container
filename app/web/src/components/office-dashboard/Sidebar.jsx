import React from 'react';
import { HomeIcon, ClipboardDocumentListIcon, DocumentTextIcon, ChartPieIcon, UsersIcon, Cog6ToothIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

const Sidebar = ({ onNavigate }) => {
    const menuItems = [
        { name: 'Dashboard', icon: HomeIcon, active: true },
        { name: 'Data Inspeksi', icon: ClipboardDocumentListIcon },
        { name: 'User', icon: UsersIcon },
    ];

    return (
        <div className="w-64 bg-nph-navy text-white flex flex-col h-full rounded-r-2xl shadow-xl z-10 transition-all">
            <div className="p-6 flex items-center justify-center border-b border-white/10">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full border-2 border-nph-orange flex items-center justify-center">
                        <div className="w-6 h-6 bg-nph-orange rounded-full"></div>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold tracking-wider text-nph-orange">NPH</h2>
                        <p className="text-xs text-gray-300 tracking-widest uppercase">Adipurusa</p>
                    </div>
                </div>
            </div>

            <nav className="flex-1 py-6">
                <ul className="space-y-2 px-4">
                    {menuItems.map((item, index) => (
                        <li key={index}>
                            <button className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 ${item.active ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                                <item.icon className="w-5 h-5" />
                                <span className="font-medium text-sm">{item.name}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="p-6">
                <button 
                    onClick={() => onNavigate("login")} 
                    className="w-full flex items-center gap-4 px-4 py-3 text-gray-400 hover:text-white hover:bg-red-500/20 rounded-xl transition-all"
                >
                    <ArrowRightOnRectangleIcon className="w-5 h-5" />
                    <span className="font-medium text-sm">Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;

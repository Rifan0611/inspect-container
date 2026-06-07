import React from 'react';

const StatsCard = ({ title, value, subtitle, bgColor, icon: Icon }) => {
    return (
        <div className={`${bgColor} text-white rounded-xl p-6 shadow-md relative overflow-hidden transition-transform hover:scale-105 duration-300`}>
            <div className="relative z-10">
                <h4 className="text-sm font-medium text-white/80 mb-2">{title}</h4>
                <div className="text-4xl font-bold mb-1">{value}</div>
                <div className="text-xs text-white/80">{subtitle}</div>
            </div>
            {Icon && (
                <Icon className="absolute -right-4 -bottom-4 w-24 h-24 text-white/10" />
            )}
        </div>
    );
};

export default StatsCard;

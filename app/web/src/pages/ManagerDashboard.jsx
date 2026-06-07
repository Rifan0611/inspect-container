import React from 'react';
import '../styles/manager.css';
import { users } from '../data/users';

const ManagerDashboard = () => {
  return (
    <div className="manager-dashboard">
      <h1>Manager Dashboard</h1>
      <div className="dashboard-content">
        <section className="users-section">
          <h2>User Management</h2>
          <div className="users-list">
            <ul>
              {users.map(user => (
                <li key={user.id} className="user-item">
                  <span className="user-name">{user.name}</span>
                  <span className="user-role">{user.role}</span>
                  <span className={`user-status status-${user.status.toLowerCase()}`}>{user.status}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ManagerDashboard;

import React, { useState, useEffect } from 'react';

// Priority weight rules: Placement > Result > Event
const PRIORITY_WEIGHTS = {
    placement: 3,
    result: 2,
    event: 1
};

export default function PriorityInbox() {
    const [topNotifications, setTopNotifications] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    const sortNotifications = (notificationsList) => {
        return [...notificationsList].sort((a, b) => {
            // Accessing with matching case protection
            const weightA = PRIORITY_WEIGHTS[a.Type?.toLowerCase()] || 0;
            const weightB = PRIORITY_WEIGHTS[b.Type?.toLowerCase()] || 0;

            if (weightB !== weightA) {
                return weightB - weightA;
            }
            return new Date(b.Timestamp) - new Date(a.Timestamp);
        });
    };

    useEffect(() => {
        // ⚠️ Replace with your actual Authorization Token from the /auth step
        const authToken = "YOUR_RECEIVED_AUTH_TOKEN_HERE";

        const fetchNotifications = async () => {
            try {
                const response = await fetch('http://4.224.186.213/evaluation-service/notifications', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();

                // Extract array from the "notifications" root object key
                const rawList = data.notifications || data;

                if (Array.isArray(rawList)) {
                    const sorted = sortNotifications(rawList);
                    setTopNotifications(sorted.slice(0, 10));
                }
                setError(null);
            } catch (err) {
                console.error("Failed to fetch notifications:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
        const intervalId = setInterval(fetchNotifications, 10000);

        return () => clearInterval(intervalId);
    }, []);

    return (
        <div style={{ padding: '30px', fontFamily: 'system-ui, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
            <header style={{ borderBottom: '2px solid #edf2f7', paddingBottom: '15px', marginBottom: '25px' }}>
                <h1 style={{ color: '#1a202c', fontSize: '28px', margin: 0 }}>Campus Notification Hub</h1>
                <p style={{ color: '#718096', margin: '5px 0 0 0' }}>Real-time Priority Inbox monitoring system</p>
            </header>

            {error && (
                <div style={{ padding: '14px', backgroundColor: '#fed7d7', color: '#9b2c2c', borderRadius: '6px', marginBottom: '20px' }}>
                    ⚠️ <strong>Connection Error:</strong> {error}. Ensure your Authorization Bearer token is valid.
                </div>
            )}

            {loading && topNotifications.length === 0 ? (
                <p>Connecting to evaluation streaming channels...</p>
            ) : topNotifications.length === 0 ? (
                <p>No unread notifications inside evaluation queues right now.</p>
            ) : (
                <div style={{ overflowX: 'auto', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', backgroundColor: '#ffffff' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                                <th style={{ padding: '16px', color: '#4a5568' }}>ID</th>
                                <th style={{ padding: '16px', color: '#4a5568' }}>Classification</th>
                                <th style={{ padding: '16px', color: '#4a5568' }}>Received At</th>
                                <th style={{ padding: '16px', color: '#4a5568' }}>Message Broadcast</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topNotifications.map((notif) => {
                                const typeLower = notif.Type?.toLowerCase();
                                const badgeStyle = {
                                    padding: '6px 12px',
                                    borderRadius: '20px',
                                    fontWeight: '600',
                                    fontSize: '11px',
                                    textTransform: 'uppercase',
                                    backgroundColor: typeLower === 'placement' ? '#dcfce7' : typeLower === 'result' ? '#fef9c3' : '#e0f2fe',
                                    color: typeLower === 'placement' ? '#14532d' : typeLower === 'result' ? '#713f12' : '#0369a1'
                                };

                                return (
                                    <tr key={notif.ID} style={{ borderBottom: '1px solid #edf2f7' }}>
                                        <td style={{ padding: '16px', fontWeight: '600' }}>{notif.ID}</td>
                                        <td style={{ padding: '16px' }}>
                                            <span style={badgeStyle}>{notif.Type}</span>
                                        </td>
                                        <td style={{ padding: '16px', color: '#4a5568' }}>
                                            {new Date(notif.Timestamp).toLocaleString()}
                                        </td>
                                        <td style={{ padding: '16px', color: '#2d3748' }}>{notif.Message}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
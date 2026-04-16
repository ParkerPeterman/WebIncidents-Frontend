import { useState, useEffect } from 'react'
import './App.css'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

function App() {
  // 1. All state must be defined here at the top level
  const [metrics, setMetrics] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [chartData, setChartData] = useState([]); 
  const API_BASE = "https://webincidents-backend.onrender.com/" 

  // 2. Fetch data inside useEffect
  useEffect(() => {
    fetch('{API_BASE}/metrics/summary')
      .then(response => response.json())
      .then(data => setMetrics(data))
      .catch(err => console.error("Summary error:", err));

    fetch('{API_BASE}/incidents/active')
      .then(res => res.json())
      .then(data => setIncidents(data))
      .catch(err => console.error("Incidents error:", err));

    fetch('{API_BASE}/metrics/chart')
      .then(res => res.json())
      .then(data => setChartData(data))
      .catch(err => console.error("Chart error:", err));
  }, []);

  return (
  <div className="dashboard">
    <h1>Service Advisory Dashboard</h1>
    
    {metrics ? (
      <> {/* This is a Fragment to wrap multiple sections */}
        
        {/* KPI Section - The three cards at the top */}
        <div className="kpi-container">
          <div className="card">
            <h3>Mean Time To Repair</h3>
            <p className="value">{metrics.mttr_hours} hrs</p>
          </div>

          <div className="card">
            <h3>Active Outages</h3>
            <p className="value">{metrics.active_outages}</p>
          </div>

          <div className="card">
            <h3>System Health</h3>
            <p className={`status ${metrics.system_health.toLowerCase()}`}>
              {metrics.system_health}
            </p>
          </div>
        </div>

        {/* Chart Section - Now outside the container so it goes underneath */}
        <div className="chart-section">
          <h2>Incident Volume by Service</h2>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                {/* The "Total" bar acts as the background/larger bar */}
                <Bar dataKey="total" fill="#e9adad" radius={[4, 4, 0, 0]} />
                {/* The "Resolved" bar sits on top (or inside) */}
                {/* By using stackId="a", they will stack; to make it "inside," we can use barSize */}
                <Bar dataKey="resolved" fill="#8ad181" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Incident Table Section */}
        <div className="incident-section">
          <h2>Active Service Advisories</h2>
          <table className="incident-table">
            <thead>
              <tr>
                <th>Service</th>
                <th>Issue</th>
                <th>Status</th>
                <th>Started</th>
              </tr>
            </thead>
            <tbody>
              {incidents.map((incident) => (
                <tr key={incident.ticket_id}>
                  <td>{incident.service_name}</td>
                  <td>{incident.issue_type}</td>
                  <td><span className="badge">{incident.status}</span></td>
                  <td>{new Date(incident.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </>
    ) : (
      <p>Loading real-time network data...</p>
    )}
  </div>
  )
}

export default App
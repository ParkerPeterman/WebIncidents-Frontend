import { useState, useEffect } from 'react'
import './App.css'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

function App() {
  const [metrics, setMetrics] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [chartData, setChartData] = useState([]);

  // CHANGE THIS URL once your Render backend is live
  const API_BASE = "http://127.0.0.1:8000"; 

  const fetchData = () => {
    fetch(`${API_BASE}/metrics/summary`)
      .then(res => res.json())
      .then(data => setMetrics(data))
      .catch(err => console.error("Summary error:", err));

    fetch(`${API_BASE}/incidents/active`)
      .then(res => res.json())
      .then(data => setIncidents(data));

    fetch(`${API_BASE}/metrics/chart`)
      .then(res => res.json())
      .then(data => setChartData(data));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleGenerate = () => {
    fetch(`${API_BASE}/generate-data`, { method: 'POST' })
      .then(() => fetchData()); // Refresh data after generating
  };

  return (
    <div className="dashboard">
      <div className="header-row">
        <h1>Service Advisory</h1>
        <button onClick={handleGenerate} className="generate-btn">
          Simulate New Incidents
        </button>
      </div>
      
      {metrics ? (
        <>
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

          <div className="chart-section">
            <h2>Incident Volume (Total vs Resolved)</h2>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={chartData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total" fill="#dfe6e9" barSize={60} />
                  <Bar dataKey="resolved" fill="#2ecc71" barSize={35} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="incident-section">
            <h2>Active Service Advisories</h2>
            <table className="incident-table">
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Issue</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {incidents.map((incident) => (
                  <tr key={incident.ticket_id}>
                    <td>{incident.service_name}</td>
                    <td>{incident.issue_type}</td>
                    <td><span className="badge">{incident.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <p>Connecting to Sentinel API...</p>
      )}
    </div>
  );
}

export default App;
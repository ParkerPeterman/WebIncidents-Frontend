import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, Legend // Added missing components
} from 'recharts';
import './App.css';

function App() {
  const [metrics, setMetrics] = useState(null);
  const [chartData, setChartData] = useState([]);
  // --- New State for Trends ---
  const [trendData, setTrendData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [hiddenCategories, setHiddenCategories] = useState([]);
  // ----------------------------
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088fe"];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const summaryRes = await fetch('http://127.0.0.1:8000/metrics/summary');
        const summaryData = await summaryRes.json();
        
        const chartRes = await fetch('http://127.0.0.1:8000/metrics/chart');
        const chartJson = await chartRes.json();

        // 3. Fetch Trend Data
        const trendRes = await fetch('http://127.0.0.1:8000/metrics/trends');
        const trendJson = await trendRes.json();

        setMetrics(summaryData);
        setChartData(chartJson);
        setTrendData(trendJson.data);
        setCategories(trendJson.categories);
      } catch (err) {
        console.error("Fetch Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleLegendClick = (e) => {
    const { dataKey } = e;
    setHiddenCategories(prev => 
      prev.includes(dataKey) ? prev.filter(c => c !== dataKey) : [...prev, dataKey]
    );
  };

  if (loading) return <div className="loading">Loading Real-Time Metrics...</div>;
  if (error) return <div className="error-container"><h2>Error: {error}</h2></div>;

  return (
    <div className="dashboard">
      <header className="chart-section">
        <h1>Service Advisory Dashboard</h1>
        <div className={`status ${metrics?.system_health?.toLowerCase()}`}>
          System Health: <strong>{metrics?.system_health}</strong>
        </div>
      </header>

      <div className="kpi-container">
        <div className="card">
          <h3>Total Tickets</h3>
          <p className="value">{metrics?.total_tickets || 0}</p>
        </div>
        <div className="card">
          <h3>Active Outages</h3>
          <p className="value">{metrics?.active_outages || 0}</p>
        </div>
        <div className="card">
          <h3>Avg. Resolution (Hrs)</h3>
          <p className="value">{metrics?.mttr_hours || 'N/A'}</p>
        </div>
      </div>

      <section className="chart-section">
        <h2>Ticket Resolution by Category</h2>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip cursor={{fill: 'transparent'}} />
              <Bar dataKey="total" fill="#df9292" name="Total" />
              <Bar dataKey="resolved" fill="#2ecc71" name="Resolved" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <h2 style={{marginTop: '40px'}}>Incident Trends by Category</h2>
        <div style={{ width: '100%', height: 400 }}>
          <ResponsiveContainer>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend onClick={handleLegendClick} wrapperStyle={{ cursor: 'pointer' }} />
              {categories.map((cat, index) => (
                <Line
                  key={cat}
                  type="monotone"
                  dataKey={cat}
                  stroke={colors[index % colors.length]}
                  hide={hiddenCategories.includes(cat)}
                  strokeWidth={2}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}

export default App;
import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, Legend,
  ScatterChart, Scatter, ZAxis, Cell
} from 'recharts';
import './App.css';

// Holding API response data
function App() {
  const [metrics, setMetrics] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [hiddenCategories, setHiddenCategories] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088fe"];

  //Populates the dashboard from the FastAPI backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const summaryRes = await fetch('http://127.0.0.1:8000/metrics/summary');
        const summaryData = await summaryRes.json();
        
        const chartRes = await fetch('http://127.0.0.1:8000/metrics/chart');
        const chartJson = await chartRes.json();

        const trendRes = await fetch('http://127.0.0.1:8000/metrics/trends');
        const trendJson = await trendRes.json();

        const heatmapRes = await fetch('http://127.0.0.1:8000/metrics/heatmap');
        const heatmapJson = await heatmapRes.json();

        setMetrics(summaryData);
        setChartData(chartJson);
        setTrendData(trendJson.data);
        setCategories(trendJson.categories);
        setHeatmapData(heatmapJson);
      } catch (err) {
        console.error("Fetch Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // when toggle is clicked it hides the specified line from the trend graph to improve the visibility
  const handleLegendClick = (e) => {
    const { dataKey } = e;
    setHiddenCategories(prev => 
      prev.includes(dataKey) ? prev.filter(c => c !== dataKey) : [...prev, dataKey]
    );
  };

  // Handles color for heatmap based on frequency of issues at specified time 
  const getColor = (value, max) => {
    const safeMax = max > 0 ? max : 1;
    const ratio = Math.min(value / safeMax, 1);
  
    const r = Math.floor(220 + (11) * ratio);
    const g = Math.floor(245 + (-169) * ratio);
    const b = Math.floor(255 + (-195) * ratio);
  
    return `rgb(${r}, ${g}, ${b})`;
  };

const maxIncidentCount = heatmapData.length > 0 ? Math.max(...heatmapData.map(d => d.value)) : 0;
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

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

        <h2>Incident Density (Day vs. Hour)</h2>
        <div style={{width: '100%', height: 350}}>
          <ResponsiveContainer>
            <ScatterChart margin={{top: 20, right: 20, bottom: 20, left:20}}>
              <XAxis 
                type="number"
                dataKey="hour"
                Name="Hour"
                domain={[-1,24]}
                unit=":00"
                ticks={[0,4,8,12,16,20,23]}
              />
              <YAxis
                type="number"
                dataKey="day_idx"
                name="Day"
                domain={[-0.5,6.5]}
                tickFormatter={(idx) => days[idx]}
                reversed
                ticks={[0, 1, 2, 3, 4, 5, 6]}
              />
              <ZAxis type="number" dataKey="value" range={[400,401]} />
              <Tooltip cursor={{ strokeDasharray: '3 3'}} />
              <Scatter data={heatmapData} shape="square">
                {heatmapData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getColor(entry.value, maxIncidentCount)} stroke="#fff" strokeWidth={1} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#666' }}>
          Darker/Redder squares indicate high-incident time periods.
          </p>
      </section>
    </div>
  );
}

export default App;
import React, { useState, useEffect } from 'react';
import { ArrowUpward, ArrowDownward, TrendingUp } from '@mui/icons-material';

export default function History() {
  const [history, setHistory] = useState({ records: [], stats: {} });

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/api/batch_history');
        if (res.ok) {
          const data = await res.json();
          setHistory(data);
        }
      } catch { /* ignore */ }
    };
    fetchHistory();
    const interval = setInterval(fetchHistory, 5000);
    return () => clearInterval(interval);
  }, []);

  const stats = history.stats || {};
  const records = history.records || [];

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', fontFamily: '"Inter", sans-serif' }}>
      
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ margin: 0, fontSize: '2rem', letterSpacing: '-0.5px' }}>Batch History</h1>
        <p style={{ color: '#666', marginTop: '0.5rem' }}>Performance timeline and continuous improvement tracking</p>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '0.85rem', color: '#666', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Batches</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, marginTop: '0.5rem' }}>{stats.total_batches || 0}</div>
        </div>
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '0.85rem', color: '#666', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Improvement Rate</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, marginTop: '0.5rem', display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            {stats.improvement_rate || 0}%
            <TrendingUp style={{ fontSize: '1.25rem', color: '#2e7d32' }} />
          </div>
        </div>
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '0.85rem', color: '#666', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Qdrant Updates</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, marginTop: '0.5rem' }}>{stats.qdrant_updates || 0}</div>
        </div>
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '0.85rem', color: '#666', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Carbon (kgCO₂)</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, marginTop: '0.5rem' }}>{(stats.total_carbon_kg || 0).toFixed(1)}</div>
        </div>
      </div>

      {/* Quality Delta Trend */}
      {stats.recent_trend && stats.recent_trend.length > 0 && (
        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', marginBottom: '2rem' }}>
          <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.15rem' }}>Recent Quality Delta Trend</h2>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '120px' }}>
            {stats.recent_trend.map((delta, i) => {
              const isPositive = delta > 0;
              const barHeight = Math.min(100, Math.abs(delta) * 500 + 10);
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 600, color: isPositive ? '#2e7d32' : '#d32f2f', marginBottom: '4px' }}>
                    {delta > 0 ? '+' : ''}{delta.toFixed(4)}
                  </div>
                  <div style={{
                    width: '100%', maxWidth: '60px',
                    height: `${barHeight}px`,
                    backgroundColor: isPositive ? '#c8e6c9' : '#ffcdd2',
                    borderRadius: '4px 4px 0 0',
                    border: `1px solid ${isPositive ? '#81c784' : '#ef9a9a'}`,
                  }} />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Batch Records Table */}
      <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.15rem' }}>Batch Records</h2>
        
        {records.length === 0 ? (
          <div style={{ color: '#999', padding: '2rem', textAlign: 'center', fontSize: '0.95rem' }}>
            No batches have been executed yet. Run a batch from the Dashboard to see history here.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.75rem' }}>Batch ID</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.75rem' }}>Time</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.75rem' }}>Quality Δ</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.75rem' }}>Carbon (kg)</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.75rem' }}>Qdrant</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.75rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '0.75rem 1rem', fontFamily: '"SF Mono", monospace', fontWeight: 500 }}>{r.batch_id}</td>
                    <td style={{ padding: '0.75rem 1rem', color: '#666' }}>{r.timestamp_iso}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span style={{ color: r.quality_delta > 0 ? '#2e7d32' : '#d32f2f', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {r.quality_delta > 0 ? <ArrowUpward style={{ fontSize: '0.85rem' }} /> : <ArrowDownward style={{ fontSize: '0.85rem' }} />}
                        {r.quality_delta > 0 ? '+' : ''}{r.quality_delta.toFixed(4)}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 500 }}>{(r.carbon_metrics?.carbon_kg || 0).toFixed(2)}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span style={{ backgroundColor: r.qdrant_updated ? '#e8f5e9' : '#f5f5f5', color: r.qdrant_updated ? '#2e7d32' : '#999', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                        {r.qdrant_updated ? 'Updated' : 'No Change'}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span style={{ backgroundColor: r.human_approved ? '#e3f2fd' : '#ffebee', color: r.human_approved ? '#1565c0' : '#c62828', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                        {r.human_approved ? 'Approved' : 'Rejected'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

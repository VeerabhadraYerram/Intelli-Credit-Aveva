import React, { useState, useEffect } from 'react';

export default function SettingsPage() {
  const [targets, setTargets] = useState({
    max_carbon_per_batch_kg: 25.0,
    max_power_per_batch_kwh: 50.0,
    min_yield_pct: 90.0,
    min_hardness: 4.0,
    max_friability: 1.0,
    emission_factor_name: 'india_grid',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchTargets = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/api/regulatory_targets');
        if (res.ok) {
          const data = await res.json();
          setTargets(data);
        }
      } catch { /* ignore */ }
    };
    fetchTargets();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/regulatory_targets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(targets),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      alert('Failed to save: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const emissionFactors = [
    { value: 'india_grid', label: 'India Grid (0.82 kgCO₂/kWh)' },
    { value: 'eu_grid', label: 'EU Grid (0.23 kgCO₂/kWh)' },
    { value: 'us_grid', label: 'US Grid (0.39 kgCO₂/kWh)' },
    { value: 'natural_gas', label: 'Natural Gas (0.45 kgCO₂/kWh)' },
    { value: 'renewable', label: 'Renewable (0.02 kgCO₂/kWh)' },
  ];

  const inputStyle = {
    width: '100%', padding: '0.75rem 1rem', border: '1px solid #ddd', borderRadius: '8px',
    fontSize: '1rem', fontFamily: '"Inter", sans-serif', outline: 'none', transition: 'border-color 0.2s',
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', fontFamily: '"Inter", sans-serif' }}>
      
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ margin: 0, fontSize: '2rem', letterSpacing: '-0.5px' }}>Regulatory Settings</h1>
        <p style={{ color: '#666', marginTop: '0.5rem' }}>Configure compliance targets and emission parameters</p>
      </div>

      {/* Carbon Settings */}
      <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', marginBottom: '2rem' }}>
        <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.15rem', borderBottom: '1px solid #eee', paddingBottom: '0.75rem' }}>Carbon & Energy Limits</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#666', fontWeight: 600, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Max Carbon per Batch (kgCO₂)
            </label>
            <input 
              type="number" step="0.5" min="0"
              value={targets.max_carbon_per_batch_kg}
              onChange={(e) => setTargets({...targets, max_carbon_per_batch_kg: parseFloat(e.target.value) || 0})}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#666', fontWeight: 600, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Max Power per Batch (kWh)
            </label>
            <input 
              type="number" step="1" min="0"
              value={targets.max_power_per_batch_kwh}
              onChange={(e) => setTargets({...targets, max_power_per_batch_kwh: parseFloat(e.target.value) || 0})}
              style={inputStyle}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#666', fontWeight: 600, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Emission Factor
          </label>
          <select 
            value={targets.emission_factor_name}
            onChange={(e) => setTargets({...targets, emission_factor_name: e.target.value})}
            style={{ ...inputStyle, cursor: 'pointer', backgroundColor: 'white' }}
          >
            {emissionFactors.map(ef => (
              <option key={ef.value} value={ef.value}>{ef.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Quality Settings */}
      <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', marginBottom: '2rem' }}>
        <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.15rem', borderBottom: '1px solid #eee', paddingBottom: '0.75rem' }}>Quality Floor Thresholds</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#666', fontWeight: 600, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Min Yield (%)
            </label>
            <input 
              type="number" step="0.5" min="0" max="100"
              value={targets.min_yield_pct}
              onChange={(e) => setTargets({...targets, min_yield_pct: parseFloat(e.target.value) || 0})}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#666', fontWeight: 600, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Min Hardness (kP)
            </label>
            <input 
              type="number" step="0.1" min="0"
              value={targets.min_hardness}
              onChange={(e) => setTargets({...targets, min_hardness: parseFloat(e.target.value) || 0})}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#666', fontWeight: 600, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Max Friability (%)
            </label>
            <input 
              type="number" step="0.1" min="0"
              value={targets.max_friability}
              onChange={(e) => setTargets({...targets, max_friability: parseFloat(e.target.value) || 0})}
              style={inputStyle}
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <button 
          onClick={handleSave}
          disabled={saving}
          style={{
            backgroundColor: '#131b2f', color: 'white', border: 'none', padding: '1rem 2.5rem',
            fontSize: '0.85rem', fontWeight: 700, letterSpacing: '1px', cursor: saving ? 'not-allowed' : 'pointer',
            borderRadius: '8px', opacity: saving ? 0.7 : 1
          }}
        >
          {saving ? 'SAVING...' : 'SAVE SETTINGS'}
        </button>
        {saved && (
          <span style={{ color: '#2e7d32', fontWeight: 600, fontSize: '0.9rem' }}>
            ✓ Settings saved successfully
          </span>
        )}
      </div>
    </div>
  );
}

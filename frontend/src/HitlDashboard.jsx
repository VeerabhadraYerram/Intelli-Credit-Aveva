import React, { useState, useEffect, useRef } from 'react';
import './HitlDashboard.css';

/**
 * Hook for Magnetic Button physics.
 * Calculates cursor distance from button center to translate it gently towards the cursor.
 */
const useMagnetic = () => {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      const { left, top, width, height } = el.getBoundingClientRect();
      const cx = left + width / 2;
      const cy = top + height / 2;
      // Max displacement is 15px
      const distX = (clientX - cx) * 0.15;
      const distY = (clientY - cy) * 0.15;
      
      el.style.transform = `translate(${distX}px, ${distY}px)`;
    };

    const handleMouseLeave = () => {
      el.style.transform = `translate(0px, 0px)`;
    };

    el.addEventListener('mousemove', handleMouseMove);
    el.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      el.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return ref;
};

/**
 * Context Provider for global mouse tracking (for the flashlight radial glow).
 */
const GlowCard = ({ children, className = "" }) => {
  const ref = useRef(null);

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ref.current.style.setProperty('--mouse-x', `${x}px`);
    ref.current.style.setProperty('--mouse-y', `${y}px`);
  };

  return (
    <div 
      ref={ref} 
      className={`glass-panel glow-card ${className}`}
      onMouseMove={handleMouseMove}
    >
      {children}
    </div>
  );
};

export default function HitlDashboard() {
  const [priority, setPriority] = useState(50);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gameState, setGameState] = useState(null);
  const [error, setError] = useState(null);
  
  // Hardcoded for demo; typically fetched or context-driven
  const batchId = "TEST-BATCH-001";
  const approveBtnRef = useMagnetic();
  const rejectBtnRef = useMagnetic();

  // Polling LangGraph state via FastAPI
  useEffect(() => {
    let active = true;
    const pollBackend = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/graph_state?batch_id=${batchId}`);
        if (!active) return;
        
        if (res.ok) {
          const data = await res.json();
          if (data.status !== "not_found") {
            setGameState(data);
            setError(null);
          }
        } else {
          setError(`HTTP Error: ${res.status}`);
        }
      } catch (err) {
        if (active) setError(err.message);
      }
    };

    pollBackend();
    const interval = setInterval(pollBackend, 1500); // 1.5s real-time pull
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [batchId]);

  // Derived settings fallback if state is not available
  const currentSettings = gameState?.proposed_settings || {};
  const baselineValues = gameState?.historical_baseline || {};
  const liveTelemetry = gameState?.current_telemetry || {};
  
  // Real or theoretical derived metric overrides from sliders (if allowed)
  const theoreticYield = (99.2 + (priority - 50) * 0.01).toFixed(2);
  const theoreticEnergy = (22.5 - (priority - 50) * 0.1).toFixed(1);

  // ────────────────────────────────────────────────────────────────
  // API HOOKS FOR PHASE 2 LANGGRAPH BACKEND
  // ────────────────────────────────────────────────────────────────
  const handleDecision = async (approved) => {
    setIsSubmitting(true);
    
    const payload = {
      batch_id: batchId,
      approved: approved,
      feedback: approved ? "Approved via HITL Dashboard" : "Manual override requested"
    };

    console.log("Sending decision to LangGraph backend:", payload);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/execute_decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.detail || "API Error");
      }
      
      console.log("Decision accepted by backend:", result);
    } catch (err) {
      console.error("Failed to hit backend", err);
      alert("Failed to submit decision: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="dashboard-container">
      {/* LEFT COLUMN: 40% Context */}
      <div className="left-column">
        
        {/* Dynamic Priority Sliders */}
        <GlowCard>
          <h3 style={{ marginTop: 0, marginBottom: '0.5rem' }}>Optimization Priority</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Adjusting priority impacts the neural proxy's Repair Layer constraints.
          </p>
          
          <div className="slider-container">
            <input 
              type="range" 
              min="0" max="100" 
              value={priority}
              onChange={(e) => setPriority(Number(e.target.value))}
              className="priority-slider"
            />
            <div className="slider-labels">
              <span>Maximum Yield</span>
              <span>Balanced</span>
              <span>Minimum Energy</span>
            </div>
          </div>

          <div style={{ marginTop: '2rem', display: 'flex', gap: '2rem' }}>
            <div>
              <div className="telemetry-label">Est. Tablet Weight</div>
              <div className="tabular-num" style={{ fontSize: '1.8rem', color: 'var(--accent-cyan)' }}>
                {theoreticYield}%
              </div>
            </div>
            <div>
              <div className="telemetry-label">Est. Power (kW)</div>
              <div className="tabular-num" style={{ fontSize: '1.8rem', color: 'var(--text-primary)' }}>
                {theoreticEnergy}
              </div>
            </div>
          </div>
        </GlowCard>

        {/* Live Telemetry vs Baseline */}
        <GlowCard>
          <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>Live Telemetry vs Baseline</h3>
          <div className="telemetry-grid">
            <div className="telemetry-card">
              <span className="telemetry-label">Drying Temp (°C)</span>
              <div className="telemetry-val">
                <span className="tabular-num">{(liveTelemetry?.Temperature_C || 80.0).toFixed(1)}</span>
                <span className="delta positive">
                  {baselineValues?.ctx_Temperature_C ? 
                    (liveTelemetry.Temperature_C - baselineValues.ctx_Temperature_C > 0 ? "+" : "") + 
                    (liveTelemetry.Temperature_C - baselineValues.ctx_Temperature_C).toFixed(1) + "°C" 
                    : "-2.1°C"}
                </span>
              </div>
            </div>
            {/* Keeping others mostly static but hooked where possible for demo effect */}
            <div className="telemetry-card">
              <span className="telemetry-label">Machine Speed (RPM)</span>
              <div className="telemetry-val">
                <span className="tabular-num">{(liveTelemetry?.Motor_Speed_RPM || 60.0).toFixed(1)}</span>
                <span className="delta positive">-5 RPM</span>
              </div>
            </div>
            <div className="telemetry-card">
              <span className="telemetry-label">Compression (kN)</span>
              <div className="telemetry-val">
                <span className="tabular-num">{(liveTelemetry?.Compression_Force_kN || 25.0).toFixed(1)}</span>
                <span className="delta negative">+1.2 kN</span>
              </div>
            </div>
            <div className="telemetry-card">
              <span className="telemetry-label">Vibration AUC</span>
              <div className="telemetry-val">
                <span className="tabular-num">315.4</span>
                <span className="delta positive">-12%</span>
              </div>
            </div>
          </div>
        </GlowCard>
      </div>

      {/* RIGHT COLUMN: 60% Action */}
      <div className="right-column">
        
        {/* SHAP Explainability */}
        <GlowCard>
          <h3 style={{ marginTop: 0, marginBottom: '1rem', color: 'var(--accent-cyan)' }}>
            Optimization Rationale
          </h3>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
            Based on Golden Signature <span style={{ fontFamily: 'var(--font-mono)' }}>#4021</span>: 
            Reducing Machine Speed by <b>5 RPM</b> and increasing Compression Force by <b>1.2 kN</b> 
            shifts the process into a more efficient Pareto frontier, saving <b>~10kW</b> with a negligible 
            effect on friability.
          </p>
          
          {/* Mock Feature Importance Bar */}
          <div style={{ background: '#1a1a1a', padding: '1rem', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.8rem' }}>
              Repair Layer Clamp Audit
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ width: '120px', fontSize: '0.9rem' }}>Machine Speed</span>
                <div style={{ flex: 1, height: '6px', background: '#333', borderRadius: '3px', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '45%', background: 'var(--accent-cyan)', borderRadius: '3px' }}/>
                  <div style={{ position: 'absolute', top: '-10px', bottom: '-10px', left: '44%', width: '2%', background: 'var(--accent-orange)' }} title="Clamped by physics model"/>
                </div>
              </div>
            </div>
          </div>
        </GlowCard>

        {/* Execution Gate */}
        <GlowCard className="execution-gate">
          <div>
            <h2 style={{ margin: 0, letterSpacing: '1px' }}>
               {gameState?.status === "executed" ? "Execution Complete" : "Pending AI Recommendation"}
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
              Batch ID: {batchId} 
              {gameState?.paused_for_hitl && <span style={{ color: 'var(--accent-cyan)', marginLeft: '10px' }}>(Awaiting Review)</span>}
            </p>
          </div>

          <div className="proposed-settings">
            <div className="setting-item">
              <span>Granulation_Time</span>
              <span>{(currentSettings.Granulation_Time || 27.0).toFixed(2)} s</span>
            </div>
            <div className="setting-item">
              <span>Binder_Amount</span>
              <span>{(currentSettings.Binder_Amount || 5.0).toFixed(2)} L</span>
            </div>
            <div className="setting-item">
              <span>Drying_Temp</span>
              <span>{(currentSettings.Drying_Temp || 80.0).toFixed(2)} °C</span>
            </div>
            <div className="setting-item">
              <span>Machine_Speed</span>
              <span>{(currentSettings.Machine_Speed || 80.0).toFixed(2)} RPM</span>
            </div>
          </div>

          {gameState?.status === "executed" ? (
             <div style={{color: 'lime', fontSize: '1.2rem', padding: '1rem'}}>
               Settings Applied. Quality Delta: {gameState.quality_delta > 0 ? "+" : ""}{gameState.quality_delta.toFixed(4)}
             </div>
          ) : (
            <div className="action-buttons">
              <button 
                ref={approveBtnRef} 
                className="magnetic-btn btn-approve"
                onClick={() => handleDecision(true)}
                disabled={isSubmitting || !gameState?.paused_for_hitl}
                style={{ opacity: (!gameState?.paused_for_hitl && !isSubmitting) ? 0.3 : 1 }}
              >
                <span className="magnetic-content">
                  {isSubmitting ? "Executing..." : "Approve & Execute"}
                </span>
              </button>
              <button 
                ref={rejectBtnRef} 
                className="magnetic-btn btn-reject"
                onClick={() => handleDecision(false)}
                disabled={isSubmitting || !gameState?.paused_for_hitl}
                style={{ opacity: (!gameState?.paused_for_hitl && !isSubmitting) ? 0.3 : 1 }}
              >
                <span className="magnetic-content">
                  {isSubmitting ? "Processing..." : "Reject / Override"}
                </span>
              </button>
            </div>
          )}
        </GlowCard>

      </div>
    </div>
  );
}

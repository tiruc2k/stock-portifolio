import React, { useMemo, useState } from 'react';
import './Components.css';

const mockEvents = [
  { date: '2025-08-18', time: '08:30 ET', event: 'CPI (YoY)', consensus: '3.2%', previous: '3.0%', impact: 'High' },
  { date: '2025-08-18', time: '08:30 ET', event: 'Core CPI (YoY)', consensus: '3.4%', previous: '3.3%', impact: 'High' },
  { date: '2025-08-20', time: '10:00 ET', event: 'Existing Home Sales', consensus: '4.18M', previous: '4.11M', impact: 'Medium' },
  { date: '2025-08-21', time: '08:30 ET', event: 'Initial Jobless Claims', consensus: '232K', previous: '235K', impact: 'Medium' },
  { date: '2025-08-22', time: '11:00 ET', event: 'Fed Chair Speech (Jackson Hole)', consensus: '-', previous: '-', impact: 'High' },
];

export default function EconomicCalendar() {
  const [impactFilter, setImpactFilter] = useState('All'); // All | High | Medium | Low

  const rows = useMemo(() => {
    const impactRank = { High: 3, Medium: 2, Low: 1 };
    return [...mockEvents]
      .filter(e => impactFilter === 'All' ? true : (e.impact || 'Low') === impactFilter)
      .sort((a, b) => {
        const ir = (impactRank[b.impact] || 0) - (impactRank[a.impact] || 0);
        if (ir !== 0) return ir;
        const ad = a.date.localeCompare(b.date);
        if (ad !== 0) return ad;
        return (a.time || '').localeCompare(b.time || '');
      });
  }, [impactFilter]);

  const guideText = (e) => {
    const name = (e.event || '').toLowerCase();
    const Section = ({ title, children }) => (
      <div className="tip-section">
        <div className="tip-sec-title">{title}</div>
        <ul className="tip-list">{children}</ul>
      </div>
    );
    const Wrapper = ({ title, sections }) => (
      <div className="tip-content">
        <div className="tip-title">{title}</div>
        {sections}
      </div>
    );

    if (name.includes('core cpi') || name.includes('cpi')) {
      return (
        <Wrapper
          title="CPI / Core CPI (inflation)"
          sections={(
            <>
              <Section title="Summary">
                <li>Hotter than consensus: hawkish; softer: dovish</li>
                <li>Moves policy path and real yields</li>
              </Section>
              <Section title="Stocks">
                <li>Hotter: broad ↓; growth/long-duration ↓</li>
                <li>Softer: broad ↑; growth/tech ↑</li>
              </Section>
              <Section title="Bonds">
                <li>Hotter: yields ↑, prices ↓</li>
                <li>Softer: yields ↓, prices ↑</li>
              </Section>
              <Section title="Commodities">
                <li>Gold: inversely to real yields (hotter ↓ / softer ↑)</li>
                <li>Oil: mixed; reacts to growth vs USD</li>
              </Section>
            </>
          )}
        />
      );
    }
    if (name.includes('jobless')) {
      return (
        <Wrapper
          title="Initial Jobless Claims (labor)"
          sections={(
            <>
              <Section title="Summary">
                <li>Lower claims = stronger labor (hawkish)</li>
                <li>Higher claims = cooling labor (dovish)</li>
              </Section>
              <Section title="Stocks">
                <li>Stronger: mixed/↓ if hike odds ↑; financials can hold up</li>
                <li>Cooling: ↑; growth/long-duration ↑</li>
              </Section>
              <Section title="Bonds">
                <li>Stronger: yields ↑, prices ↓</li>
                <li>Cooling: yields ↓, prices ↑</li>
              </Section>
              <Section title="Commodities">
                <li>Gold: hawkish ↓ / dovish ↑</li>
                <li>Oil: growth optimism ↑ / slowdown ↓</li>
              </Section>
            </>
          )}
        />
      );
    }
    if (name.includes('home sales')) {
      return (
        <Wrapper
          title="Existing Home Sales (housing/consumer)"
          sections={(
            <>
              <Section title="Summary">
                <li>Above consensus signals housing strength</li>
                <li>Below consensus flags softness in cyclicals</li>
              </Section>
              <Section title="Stocks">
                <li>Above: housing/cyclicals ↑ (homebuilders, materials)</li>
                <li>Below: housing-linked ↓; defensives or growth can outperform</li>
              </Section>
              <Section title="Bonds">
                <li>Above: yields mildly ↑; below: yields ↓</li>
              </Section>
              <Section title="Commodities">
                <li>Lumber/metals sentiment tracks housing momentum</li>
                <li>Oil follows growth tone</li>
              </Section>
            </>
          )}
        />
      );
    }
    if (name.includes('fed chair') || name.includes('speech')) {
      return (
        <Wrapper
          title="Fed Chair Speech (policy tone)"
          sections={(
            <>
              <Section title="Summary">
                <li>Hawkish (restrictive-for-longer) vs Dovish (tilt to easing)</li>
              </Section>
              <Section title="Stocks">
                <li>Hawkish: ↓; growth/long-duration ↓</li>
                <li>Dovish: ↑; growth/tech ↑</li>
              </Section>
              <Section title="Bonds">
                <li>Hawkish: yields ↑, prices ↓</li>
                <li>Dovish: yields ↓, prices ↑</li>
              </Section>
              <Section title="Commodities">
                <li>Gold: tracks real yields (hawkish ↓ / dovish ↑)</li>
                <li>Oil: USD/risk tone matters (hawkish USD ↑ → oil mixed)</li>
              </Section>
            </>
          )}
        />
      );
    }
    return (
      <Wrapper
        title={`${e.event} (general)`}
        sections={(
          <>
            <Section title="Summary">
              <li>Surprises vs consensus drive the initial move</li>
            </Section>
            <Section title="Stocks">
              <li>React to growth/earnings path and policy repricing</li>
            </Section>
            <Section title="Bonds">
              <li>Yields move with inflation/policy expectations</li>
            </Section>
            <Section title="Commodities">
              <li>Gold ↔ real yields/USD; Oil ↔ growth/USD</li>
            </Section>
          </>
        )}
      />
    );
  };

  return (
    <div className="section">
      <div className="section-header">
        <h2>🗓️ Economic Calendar</h2>
        <span className="muted">Mock data for demo</span>
      </div>

      {/* Impact filter */}
      <div className="controls" style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        {['All','High','Medium','Low'].map(level => (
          <button
            key={level}
            type="button"
            className={`filter-btn ${impactFilter === level ? 'active' : ''}`}
            onClick={() => setImpactFilter(level)}
          >{level}</button>
        ))}
      </div>

      <div className="card glass">
        <div className="table">
          <div className="table-head six">
            <span>Date</span>
            <span>Time</span>
            <span>Event</span>
            <span>Consensus</span>
            <span>Previous</span>
            <span>Impact</span>
          </div>
          {rows.map((e, idx) => (
            <div key={idx} className={`table-row six econ-${(e.impact || 'Low').toLowerCase()}`}>
              <span className="mono">{new Date(e.date).toLocaleDateString()}</span>
              <span>{e.time}</span>
              <span className="has-tip">
                {e.event}
                <div className="tip">{guideText(e)}</div>
              </span>
              <span>{e.consensus}</span>
              <span className="muted">{e.previous}</span>
              <span><span className={`impact-badge ${String(e.impact || 'Low').toLowerCase()}`}>{e.impact || 'Low'}</span></span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

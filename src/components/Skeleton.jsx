export function SkeletonStat() {
  return (
    <div className="stat-card">
      <div className="skeleton skeleton-circle"></div>
      <div style={{ flex: 1 }}>
        <div className="skeleton skeleton-line" style={{ width: '60%', height: 24 }}></div>
        <div className="skeleton skeleton-line" style={{ width: '80%', height: 12 }}></div>
      </div>
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="section">
      <div className="skeleton skeleton-line" style={{ width: '30%' }}></div>
      <div className="skeleton skeleton-chart"></div>
    </div>
  );
}

export function SkeletonList() {
  return (
    <div className="section">
      <div className="skeleton skeleton-line" style={{ width: '40%' }}></div>
      {[1,2,3].map(i => (
        <div key={i} className="skeleton skeleton-line" style={{ width: '100%', marginTop: 8 }}></div>
      ))}
    </div>
  );
}

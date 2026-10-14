import '../styles/components/table.css';

export default function Table({ columns, data, loading, emptyText = 'Hakuna data' }) {
  if (loading) {
    return (
      <div className="table-loading">
        {[1,2,3,4].map(i => (
          <div key={i} className="table-skeleton-row">
            <div className="skeleton skeleton-line"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return <div className="table-empty">{emptyText}</div>;
  }

  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} style={{ width: c.width }}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={row.id || i}>
              {columns.map((c) => (
                <td key={c.key}>
                  {c.render ? c.render(row) : row[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

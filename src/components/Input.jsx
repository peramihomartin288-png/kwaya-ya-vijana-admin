import '../styles/components/input.css';

export default function Input({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required,
  error,
  hint,
  rows,
  options,
  ...props
}) {
  const inputProps = {
    value,
    onChange: (e) => onChange?.(e.target.value, e),
    placeholder,
    required,
    ...props,
  };

  return (
    <div className="input-group">
      {label && <label className="input-label">{label}{required && ' *'}</label>}

      {type === 'textarea' ? (
        <textarea
          className={`input-field ${error ? 'input-error' : ''}`}
          rows={rows || 4}
          {...inputProps}
        />
      ) : type === 'select' ? (
        <select className={`input-field ${error ? 'input-error' : ''}`} {...inputProps}>
          <option value="">-- Chagua --</option>
          {options?.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      ) : (
        <input
          className={`input-field ${error ? 'input-error' : ''}`}
          type={type}
          {...inputProps}
        />
      )}

      {hint && !error && <span className="input-hint">{hint}</span>}
      {error && <span className="input-error-msg">{error}</span>}
    </div>
  );
}

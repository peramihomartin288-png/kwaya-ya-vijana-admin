import '../styles/components/loader.css';

export default function Loader({ text = 'Inapakia...' }) {
  return (
    <div className="loader-wrap">
      <div className="loader-spinner"></div>
      <p>{text}</p>
    </div>
  );
}

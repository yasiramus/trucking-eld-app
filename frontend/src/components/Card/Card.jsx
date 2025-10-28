import './Card.css'

export default function Card({ icon, title, value, label }) {
  return (
    <div className="summary-card">
      <div className="card-icon">{icon}</div>
      <div className="card-content">
        <h3>{title}</h3>
        <p className="card-value">{value}</p>
        <p className="card-label">{label}</p>
      </div>
    </div>
  );
}

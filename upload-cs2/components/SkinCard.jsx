export default function SkinCard({ skin, selected, onClick }) {
  return (
    <div
      className={`skin-card ${selected ? "selected" : ""}`}
      onClick={onClick}
    >
      <img src={skin.image} alt={skin.name} />
      <div className="skin-info">
        <p>{skin.name}</p>
        <span>${skin.price.toFixed(2)}</span>
      </div>
    </div>
  );
}
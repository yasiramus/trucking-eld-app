export const Field = ({ label, value }) => (
    <div className="eld-field">
        <label>{label}:</label>
        <span>{value}</span>
    </div>
);

export const Legend = () => (
    <div className="eld-legend">
        <div className="legend-row">
            {[
                ["off-duty", "Off Duty"],
                ["sleeper", "Sleeper Berth"],
                ["driving", "Driving"],
                ["on-duty", "On Duty (Not Driving)"],
            ].map(([cls, label]) => (
                <div className="legend-item" key={cls}>
                    <span className={`legend-line ${cls}`}></span>
                    <span>Line {["off-duty", "sleeper", "driving", "on-duty"].indexOf(cls) + 1}: {label}</span>
                </div>
            ))}
        </div>
    </div>
);
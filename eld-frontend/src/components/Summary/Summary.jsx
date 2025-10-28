import Card from "../Card/Card";

import "./Summary.css";

function Summary({ tripData }) {

  if (!tripData) {
    return <div className="summary-empty">No trip data available.</div>;
  }

  const {
    current_location,
    pickup_location,
    drop_off_location,
    total_distance = 0,
    total_duration = 0,
    current_cycle_used = 0,
    rest_stops = [],
    route_data,
  } = tripData;

  const availableHours = route_data?.available_hours || {};
  const newCycleTotal = current_cycle_used + total_duration;

  return (
    <div className="trip-summary">
      {/* Cards */}
      <div className="summary-grid">
        <Card
          icon="🗺️"
          title="Route"
          value={`${total_distance.toFixed(1)} miles`}
          label={`${current_location} → ${pickup_location} → ${drop_off_location}`}
        />
        <Card
          icon="⏱️"
          title="Total Duration"
          value={`${total_duration.toFixed(1)} hours`}
          label="Includes driving, breaks, and stops"
        />
        <Card
          icon="🛑"
          title="Rest Stops"
          value={rest_stops.length}
          label="Breaks, rests, and fuel stops"
        />
        <Card
          icon="📊"
          title="Cycle Status"
          value={`${newCycleTotal.toFixed(1)} / 70 hours`}
          label={`${availableHours.cycle_hours_available?.toFixed(1) || 0} hours remaining`}
        />
      </div>

      {/* Rest Stops Table */}
      <div className="rest-stops-list">
        <h3>🛑 Rest Stops Breakdown</h3>
        {rest_stops.length === 0 ? (
          <p className="no-stops">No rest stops found for this trip.</p>
        ) : (
          <div className="stops-table">
            <table aria-label="Rest stops breakdown">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Type</th>
                  <th>Distance</th>
                  <th>Duration</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                {rest_stops.map((stop, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>
                      <span
                        className={`stop-badge type-${stop.stop_type.toLowerCase().replace(/\s+/g, "-")}`}
                      >
                        {stop.stop_type}
                      </span>
                    </td>
                    <td>{stop.distance_from_start.toFixed(1)} mi</td>
                    <td>{stop.duration} hrs</td>
                    <td className="reason-cell">{`${stop.stop_type} at mile ${stop.distance_from_start.toFixed(1)}`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Summary;

import { useEffect, useRef } from "react";

import drawELDLog from "../../utils/drawELDLog";
import { Field, Legend } from "./Index";

export function ELDLogSheet({ dayLog, dayNumber }) {

    const canvasRef = useRef(null);

    useEffect(() => {
        if (canvasRef.current) {
            drawELDLog(canvasRef.current, dayLog)
        }
    }, [dayLog]);

    return (
        <div className="eld-log-sheet">
            <div className="eld-header">
                <h3>📄 Driver's Daily Log - Day {dayNumber}</h3>
                <div className="eld-date">
                    Date: {dayLog?.date} | Total Miles: {dayLog?.totalMiles?.toFixed(1)}
                </div>
            </div>

            <div className="eld-form-fields">
                <Field label="Driver Name" value="Driver" />
                <Field label="From" value={dayLog.startLocation} />
                <Field label="To" value={dayLog.endLocation} />
                <Field
                    label="Total Driving Hours"
                    value={`${dayLog.totalDrivingHours.toFixed(1)} hrs`}
                />
                <Field
                    label="Total On-Duty Hours yasira"
                    value={`${dayLog.totalOnDutyHours.toFixed(1)} hrs`}
                />
            </div>

            {/* Canvas for drawing the log grid */}
            <canvas
                ref={canvasRef}
                width="1200"
                height="400"
                id="eld-canvas"
                style={{ border: "1px solid #2563eb" }}
            />

            {/* Legend */}
            <Legend />

            <div className="eld-events">
                <h4>Day {dayNumber} Events:</h4>
                <ul>
                    {dayLog.events.map((event, i) => (
                        <li key={i}>
                            <strong>{event.time}</strong> - {event.description}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

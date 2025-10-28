import "./ELDLogs.css";

import { generateDailyLogs } from "../../utils/generateDailyLogs";
import { ELDLogSheet } from "./ELDLogSheet";

export default function ELDLogs({ tripData }) {

    const dailyLogs = generateDailyLogs(tripData);

    return (
        <div className="eld-logs">
            <div className="eld-info-box">
                <p>📊 Generated {dailyLogs.length} daily log sheet(s) for this trip</p>
                <p className="eld-note">
                    These logs show Hours of Service (HOS) compliance including driving
                    time, rest periods, and duty status changes.
                </p>
            </div>

            {dailyLogs.map((dayLog, index) => (
                <ELDLogSheet
                    key={index}
                    dayLog={dayLog}
                    dayNumber={index + 1}
                />
            ))}
        </div>
    );
}
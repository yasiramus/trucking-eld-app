import { addEvent, createBaseLog, formatHour } from "./helpers";

export function createSingleDayLog(tripData) {
    const dayLog = createBaseLog(
        tripData.current_location,
        tripData.drop_off_location,
        tripData.total_distance
    );

    addEvent(dayLog, "00:00", `Pickup at ${tripData.pickup_location}`, "on-duty", 1);

    const drivingHours = Math.min(tripData.total_duration - 2, 11);
    dayLog.segments.push({ type: "driving", startHour: 1, duration: drivingHours });
    dayLog.totalDrivingHours = drivingHours;
    dayLog.totalOnDutyHours = drivingHours + 2;

    addEvent(
        dayLog,
        formatHour(1 + drivingHours),
        `Drop off at ${tripData.drop_off_location}`,
        "on-duty",
        1
    );

    return [dayLog];
}
import { createSingleDayLog } from "./createSingleDayLog";
import { addEvent, createBaseLog, formatHour, simulateDriving } from "./helpers";

export function generateDailyLogs(tripData) {

    const restStops = tripData.rest_stops || [];
    const avgSpeed = tripData.total_distance / Math.max(tripData.total_duration - 2, 1);

    const dailyRestStops = restStops.filter((s) =>
        ["10-hour rest", "34-hour reset"].includes(s.stop_type)
    );

    if (dailyRestStops.length === 0)
        // No daily rests - single day trip
        return createSingleDayLog(tripData, avgSpeed);

    const logs = [];
    let previousRestDistance = 0;

    // Create logs for each day
    dailyRestStops.forEach((restStop, i) => {
        const miles = restStop.distance_from_start - previousRestDistance;
        const dayLog = createBaseLog(
            i === 0 ? tripData.current_location : "Continuing route",
            "Rest area",
            miles
        );

        if (i === 0) {
            addEvent(dayLog, "00:00", `Pickup at ${tripData.pickup_location}`, "on-duty", 1);
        }

        const { segments, totalDrivingHours, totalOnDutyHours, currentHour } =
            simulateDriving({
                startHour: i === 0 ? 1 : 0,
                remainingMiles: miles,
                avgSpeed,
                restStops,
                previousRestDistance,
                restStop,
            });

        dayLog.segments.push(...segments);
        dayLog.totalDrivingHours += totalDrivingHours;
        dayLog.totalOnDutyHours += totalOnDutyHours;

        // rest period
        dayLog.segments.push({
            type: "sleeper",
            startHour: currentHour,
            duration: restStop.duration,
        });

        addEvent(
            dayLog,
            formatHour(currentHour),
            `${restStop.stop_type} at mile ${restStop.duration}`,
            restStop.stop_type
        );

        logs.push(dayLog);
        previousRestDistance = restStop.distance_from_start;
    });

    // a final day if distance remains
    if (previousRestDistance < tripData.total_distance) {
        const miles = tripData.total_distance - previousRestDistance;
        const finalLog = createBaseLog(
            "Continuing route",
            tripData.drop_off_location,
            miles
        );

        const { segments, totalDrivingHours, totalOnDutyHours, currentHour } =
            simulateDriving({
                startHour: 0,
                remainingMiles: miles,
                avgSpeed,
            });

        finalLog.segments.push(...segments);
        finalLog.totalDrivingHours += totalDrivingHours;
        finalLog.totalOnDutyHours += totalOnDutyHours;

        addEvent(
            finalLog,
            formatHour(currentHour),
            `Drop off at ${tripData.drop_off_location}`,
            "on-duty",
            1
        );

        logs.push(finalLog);
    }

    return logs;
}
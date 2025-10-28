// formatHour
export function formatHour(hour) {
    const h = Math.floor(hour);
    const m = Math.floor((hour - h) * 60);
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

// createBaseLog
export function createBaseLog(start, end, miles = 0) {
    return {
        date: new Date().toLocaleDateString(),
        startLocation: start,
        endLocation: end,
        totalMiles: miles,
        totalDrivingHours: 0,
        totalOnDutyHours: 0,
        events: [],
        segments: [],
    };
}

// addEvent
export function addEvent(log, time, description, type, onDutyDuration = 0) {
    log.events.push({ time, description, type });
    if (onDutyDuration > 0) {
        log.segments.push({
            type: "on-duty",
            startHour: parseFloat(time.split(":")[0]),
            duration: onDutyDuration,
        });
        log.totalOnDutyHours += onDutyDuration;
    }
}

export function simulateDriving({
    startHour,
    remainingMiles,
    avgSpeed,
    restStops = [],
    previousRestDistance = 0,
    restStop = null,
}) {
    const segments = [];
    let currentHour = startHour;
    let remainingDriving = remainingMiles / avgSpeed;
    let totalDrivingHours = 0;
    let totalOnDutyHours = 0;
    let hoursSinceBreak = 0;

    while (remainingDriving > 0) {
        if (hoursSinceBreak >= 8) {
            segments.push({ type: "on-duty", startHour: currentHour, duration: 0.5 });
            totalOnDutyHours += 0.5;
            currentHour += 0.5;
            hoursSinceBreak = 0;
        }

        const currentDistance =
            previousRestDistance +
            ((remainingMiles / avgSpeed - remainingDriving) / (remainingMiles / avgSpeed)) *
            (restStop?.distance_from_start - previousRestDistance || 0);

        const fuelStop = restStops.find(
            (s) =>
                s.stop_type === "fuel" &&
                s.distance_from_start > previousRestDistance &&
                s.distance_from_start <= (restStop?.distance_from_start || Infinity) &&
                Math.abs(s.distance_from_start - currentDistance) < 100
        );

        if (fuelStop) {
            segments.push({ type: "on-duty", startHour: currentHour, duration: 0.5 });
            totalOnDutyHours += 0.5;
            currentHour += 0.5;
        }

        const driveTime = Math.min(1, remainingDriving, 11 - totalDrivingHours);
        if (driveTime <= 0) break;

        segments.push({ type: "driving", startHour: currentHour, duration: driveTime });
        totalDrivingHours += driveTime;
        totalOnDutyHours += driveTime;
        currentHour += driveTime;
        remainingDriving -= driveTime;
        hoursSinceBreak += driveTime;
    }

    return { segments, totalDrivingHours, totalOnDutyHours, currentHour };
}

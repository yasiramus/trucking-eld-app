class HOSCalculator:
    """Calculate Hours of Service (HOS) compliance for truck drivers."""

    # ---HOS Regulatory constants (property-carrying drivers, 70-hour/8-day rule) ---
    MAX_DRIVING_HOURS = 11
    MAX_ON_DUTY_HOURS = 14
    REQUIRED_REST_HOURS = 10
    MAX_CYCLE_HOURS = 70
    MAX_CONTINUOUS_DRIVING = 8
    REQUIRED_SHORT_BREAK = 0.5  # 30 minutes

    PICKUP_DROP_OFF_TIME = 1.0
    FUEL_STOP_TIME = 0.5
    FUEL_INTERVAL_MILES = 1000

    DRIVE_INCREMENT_HOURS = 1.0
    MAX_SIMULATION_HOURS = 200  # failsafe guardrail

    # -------------------------------------------------------------------------
    #                         Core Utility Methods
    # -------------------------------------------------------------------------

    @staticmethod
    def calculate_available_hours(current_cycle_used: float) -> dict[str, float]:
        """Compute remaining available hours in the current cycle."""
        return {
            "cycle_hours_available": max(0, HOSCalculator.MAX_CYCLE_HOURS - current_cycle_used),
            "daily_driving_available": HOSCalculator.MAX_DRIVING_HOURS,
            "daily_duty_available": HOSCalculator.MAX_ON_DUTY_HOURS,
        }

    # --- Utility creators -----------------------------------------------------
    @staticmethod
    def _create_rest_stop(stop_type: str, duration: float, distance: float, reason: str) -> dict:
        """Create a standardized rest stop object."""
        return {
            "type": stop_type,
            "duration": duration,
            "distance_from_start": distance,
            "reason": reason,
        }

    @staticmethod
    def _safe_add_stop(rest_stops: list[dict], new_stop: dict):
        """Prevent duplicate stops at the same location; merge logically."""
        if (
            rest_stops
            and abs(rest_stops[-1]["distance_from_start"] - new_stop["distance_from_start"]) < 1
        ):
            rest_stops[-1]["type"] += f" + {new_stop['type']}"
            rest_stops[-1]["duration"] += new_stop["duration"]
            rest_stops[-1]["reason"] += f"; {new_stop['reason']}"
        else:
            rest_stops.append(new_stop)

    @staticmethod
    def _calculate_avg_speed(total_distance: float, total_duration: float) -> float:
        """Compute average driving speed (excluding pickup/drop-off time)."""
        driving_duration = total_duration - (2 * HOSCalculator.PICKUP_DROP_OFF_TIME)
        if driving_duration <= 0:
            raise ValueError("Trip duration too short to compute average speed.")
        return total_distance / driving_duration

    @staticmethod
    def _calculate_max_drive_hours(current_driving: float, current_duty: float,
                                   hours_since_break: float, remaining_distance: float,
                                   avg_speed: float) -> float:
        """Calculate the next possible drive segment before hitting any limit."""
        hours_until_limits = [
            HOSCalculator.DRIVE_INCREMENT_HOURS,
            HOSCalculator.MAX_DRIVING_HOURS - current_driving,
            HOSCalculator.MAX_ON_DUTY_HOURS - current_duty,
            HOSCalculator.MAX_CONTINUOUS_DRIVING - hours_since_break,
            remaining_distance / avg_speed if avg_speed > 0 else 0,
        ]
        return max(0, min(hours_until_limits))

    # -------------------------------------------------------------------------
    #                         Rest Stop Simulation
    # -------------------------------------------------------------------------

    @staticmethod
    def _add_daily_rest(rest_stops: list[dict], distance: float,
                        reason: str, cycle_hours: float) -> float:
        """Add 10-hour rest and possibly a 34-hour reset if cycle exhausted."""
        HOSCalculator._safe_add_stop(
            rest_stops,
            HOSCalculator._create_rest_stop("10-hour rest", 10.0, distance, reason)
        )

        if cycle_hours >= HOSCalculator.MAX_CYCLE_HOURS:
            HOSCalculator._safe_add_stop(
                rest_stops,
                HOSCalculator._create_rest_stop(
                    "34-hour reset",
                    34.0,
                    distance,
                    "Cycle limit reached (70 hours) - performing reset"
                )
            )
            return 0  # reset the cycle
        return cycle_hours

    # -------------------------------------------------------------------------
    #                         Main Calculation Logic
    # -------------------------------------------------------------------------

    @staticmethod
    def calculate_rest_stops(total_distance: float, total_duration: float,
                             current_cycle_used: float) -> list[dict]:
        """
        Compute required rest stops per FMCSA HOS rules.
        Simulates trip hour-by-hour and inserts logical rest events.
        """
        rest_stops = []

        # --- Initialization ---
        current_driving_hours = 0.0
        current_duty_hours = HOSCalculator.PICKUP_DROP_OFF_TIME  # pickup time
        hours_since_break = 0.0
        cycle_hours_used = current_cycle_used + HOSCalculator.PICKUP_DROP_OFF_TIME

        distance_traveled = 0.0
        last_fuel_distance = 0.0
        avg_speed = HOSCalculator._calculate_avg_speed(total_distance, total_duration)
        total_simulation_hours = 0.0

        # --- Simulation Loop ---
        while distance_traveled < total_distance:
            total_simulation_hours += HOSCalculator.DRIVE_INCREMENT_HOURS
            if total_simulation_hours > HOSCalculator.MAX_SIMULATION_HOURS:
                break  # safety stop

            remaining_distance = total_distance - distance_traveled

            # Priority 1: Check for daily/on-duty reset
            if current_driving_hours >= HOSCalculator.MAX_DRIVING_HOURS or \
               current_duty_hours >= HOSCalculator.MAX_ON_DUTY_HOURS:
                cycle_hours_used = HOSCalculator._add_daily_rest(
                    rest_stops, distance_traveled,
                    "Reached daily HOS driving/on-duty limit",
                    cycle_hours_used
                )
                current_driving_hours = current_duty_hours = hours_since_break = 0
                continue

            # Priority 2: 30-min mandatory short break
            if hours_since_break >= HOSCalculator.MAX_CONTINUOUS_DRIVING:
                HOSCalculator._safe_add_stop(
                    rest_stops,
                    HOSCalculator._create_rest_stop(
                        "30-min break",
                        HOSCalculator.REQUIRED_SHORT_BREAK,
                        distance_traveled,
                        "8-hour continuous driving limit"
                    )
                )
                hours_since_break = 0
                current_duty_hours += HOSCalculator.REQUIRED_SHORT_BREAK
                cycle_hours_used += HOSCalculator.REQUIRED_SHORT_BREAK
                continue

            # Priority 3: Fuel stop every 1000 miles
            if (distance_traveled - last_fuel_distance) >= HOSCalculator.FUEL_INTERVAL_MILES:
                HOSCalculator._safe_add_stop(
                    rest_stops,
                    HOSCalculator._create_rest_stop(
                        "fuel",
                        HOSCalculator.FUEL_STOP_TIME,
                        distance_traveled,
                        "Scheduled fuel stop (every 1000 miles)"
                    )
                )
                last_fuel_distance = distance_traveled
                current_duty_hours += HOSCalculator.FUEL_STOP_TIME
                cycle_hours_used += HOSCalculator.FUEL_STOP_TIME
                continue

            # Otherwise: drive a segment
            hours_to_drive = HOSCalculator._calculate_max_drive_hours(
                current_driving_hours, current_duty_hours,
                hours_since_break, remaining_distance, avg_speed
            )

            if hours_to_drive <= 0:
                break  # can't drive further

            segment_distance = hours_to_drive * avg_speed
            distance_traveled += segment_distance
            current_driving_hours += hours_to_drive
            current_duty_hours += hours_to_drive
            hours_since_break += hours_to_drive
            cycle_hours_used += hours_to_drive

        return rest_stops

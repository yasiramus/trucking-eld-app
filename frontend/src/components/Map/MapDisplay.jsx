import { useEffect, useRef, useCallback } from "react";

import mapboxgl from "mapbox-gl";

import "./MapDisplay.css";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

function MapDisplay({ tripData }) {
    const mapContainer = useRef(null);
    const map = useRef(null);

    /** -------------------------------
     *  Helper Functions (memoized)
     *  ------------------------------- */
    const getStopColor = useCallback((type) => {
        const colors = {
            "30-min break": "var(--primary)",
            "10-hour rest": "var(--success)",
            "34-hour reset": "var(--warning)",
            fuel: "var(--danger)",
        };
        return colors[type] || "var(--secondary)";
    }, []);

    const getStopIcon = useCallback((type) => {
        const icons = {
            "30-min break": "☕",
            "10-hour rest": "🛏️",
            "34-hour reset": "🔄",
            fuel: "⛽",
        };
        return icons[type] || "🛑";
    }, []);

    const createPopup = useCallback((contentObj) => {
        const popup = new mapboxgl.Popup();
        const div = document.createElement("div");
        Object.entries(contentObj).forEach(([key, value]) => {
            const line = document.createElement("div");
            line.innerHTML = `<strong>${key}:</strong> ${value}`;
            div.appendChild(line);
        });
        popup.setDOMContent(div);
        return popup;
    }, []);

    const createMarker = useCallback((map, coord, color, popupContent) => {
        const marker = new mapboxgl.Marker({ color, scale: 0.9 })
            .setLngLat(coord)
            .setPopup(createPopup(popupContent))
            .addTo(map);
        return marker;
    }, [createPopup]);

    /** -------------------------------
     *  Add Markers for Trip Data
     *  ------------------------------- */
    const addMarkers = useCallback(
        (mapInstance, tripData) => {
            const waypoints = tripData.route_data?.waypoints || [];
            const restStops = tripData.rest_stops || [];

            // Parse waypoint coordinates
            const waypointCoords = waypoints.map((wp) => {
                const [lng, lat] = wp.split(",").map(Number);
                return { lng, lat };
            });

            // Start marker
            if (waypointCoords[0]) {
                createMarker(
                    mapInstance,
                    [waypointCoords[0].lng, waypointCoords[0].lat],
                    "var(--success)",
                    { "🚚 Start": tripData.current_location }
                );
            }

            // Pickup marker
            if (waypointCoords[1]) {
                createMarker(
                    mapInstance,
                    [waypointCoords[1].lng, waypointCoords[1].lat],
                    "var(--warning)",
                    { "📦 Pickup": tripData.pickup_location }
                );
            }

            // Drop off marker
            if (waypointCoords[2]) {
                createMarker(
                    mapInstance,
                    [waypointCoords[2].lng, waypointCoords[2].lat],
                    "var(--danger)",
                    { "🏁 Drop off": tripData.drop_off_location }
                );
            }

            // Rest stop markers
            const routeCoords = tripData.route_data?.geometry?.coordinates || [];
            restStops.forEach((stop) => {
                const progress = stop.distance_from_start / tripData.total_distance;
                const coordIndex = Math.floor(progress * (routeCoords.length - 1));
                const coord = routeCoords[coordIndex];

                if (coord) {
                    const color = getStopColor(stop.stop_type);
                    const icon = getStopIcon(stop.stop_type);
                    const popupData = {
                        [`${icon} ${stop.stop_type}`]: "",
                        "Distance": `${stop.distance_from_start.toFixed(1)} mi`,
                        "Duration": `${stop.duration} hrs`,
                        ...(stop.reason ? { "Note": stop.reason } : {}),
                    };
                    createMarker(mapInstance, coord, color, popupData);
                }
            });
        },
        [getStopColor, getStopIcon, createMarker]
    );

    /** -------------------------------
     *  Initialize or Update Map
     *  ------------------------------- */
    useEffect(() => {
        if (!MAPBOX_TOKEN) {
            console.error("❌ Mapbox token not found!");
            return;
        }

        mapboxgl.accessToken = MAPBOX_TOKEN;

        const routeGeometry = tripData.route_data?.geometry;
        if (!routeGeometry?.coordinates?.length) {
            console.error("No route geometry found");
            return;
        }

        // If map exists, just update route data
        if (map.current) {
            const source = map.current.getSource("route");
            if (source) {
                source.setData({
                    type: "Feature",
                    geometry: routeGeometry,
                });
            }
            return;
        }

        // Calculate route bounds
        const coordinates = routeGeometry.coordinates;
        const bounds = coordinates.reduce(
            (b, coord) => b.extend(coord),
            new mapboxgl.LngLatBounds(coordinates[0], coordinates[0])
        );

        // Initialize map once
        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: "mapbox://styles/mapbox/streets-v12",
            bounds,
            padding: { top: 50, bottom: 50, left: 50, right: 50 },
        });

        map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

        map.current.on("load", () => {
            map.current.addSource("route", {
                type: "geojson",
                data: {
                    type: "Feature",
                    geometry: routeGeometry,
                },
            });

            map.current.addLayer({
                id: "route",
                type: "line",
                source: "route",
                layout: { "line-join": "round", "line-cap": "round" },
                paint: {
                    "line-color": "#2563eb",
                    "line-width": 4,
                    "line-opacity": 0.8,
                },
            });

            addMarkers(map.current, tripData);
        });

        return () => {
            if (map.current) {
                map.current.remove();
                map.current = null;
            }
        };
    }, [tripData, addMarkers]);

    /** -------------------------------
     *  Render
     *  ------------------------------- */
    if (!MAPBOX_TOKEN) {
        return (
            <div className="map-display">
                <div className="map-error">
                    ❌ Mapbox token not configured. Add <code>VITE_MAPBOX_TOKEN</code> to
                    your <code>.env.local</code>.
                </div>
            </div>
        );
    }

    const legendItems = [
        { color: "var(--success)", label: "Start" },
        { color: "var(--warning)", label: "Pickup" },
        { color: "var(--danger)", label: "Drop off" },
        { color: "var(--primary)", label: "Break" },
        { color: "var(--success)", label: "Rest" },
        { color: "var(--danger)", label: "Fuel" },
    ];

    return (
        <div className="map-display">
            <div ref={mapContainer} className="map-container" />
            <div className="map-legend">
                {legendItems.map(({ color, label }) => (
                    <div key={label} className="legend-item">
                        <span className="legend-marker" style={{ background: color }} />
                        {label}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default MapDisplay;

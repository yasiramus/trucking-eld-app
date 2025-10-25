import requests
from django.conf import settings
from typing import List, Dict, Any, Optional


class MapboxService:
    """Service to interact with Mapbox APIs"""

    BASE_URL = "https://api.mapbox.com"

    @staticmethod
    def geocode(location: str) -> Dict[str, Any]:
        """
        Convert location name to coordinates (latitude, longitude)

        Args:
            location: Location name (e.g., "Los Angeles, CA")

        Returns:
            Dictionary with longitude, latitude, and place_name

        Raises:
            ValueError: If location not found
            requests.HTTPError: If API request fails
        """
        url = f"{MapboxService.BASE_URL}/geocoding/v5/mapbox.places/{location}.json"
        params = {
            'access_token': settings.MAPBOX_ACCESS_TOKEN,
            'limit': 1
        }

        response = requests.get(url, params=params)
        response.raise_for_status()

        data = response.json()

        if not data.get('features'):
            raise ValueError(f"Location not found: {location}")

        coordinates = data['features'][0]['geometry']['coordinates']
        return {
            'longitude': coordinates[0],
            'latitude': coordinates[1],
            'place_name': data['features'][0]['place_name']
        }

    @staticmethod
    def get_route(waypoints: List[str]) -> Dict[str, Any]:
        """
        Get driving route between multiple points

        Args:
            waypoints: List of coordinate strings ["lon,lat", "lon,lat", ...]

        Returns:
            Dictionary with distance (miles), duration (hours), geometry, and legs

        Raises:
            ValueError: If no route found
            requests.HTTPError: If API request fails
        """
        coordinates = ";".join(waypoints)

        url = f"{MapboxService.BASE_URL}/directions/v5/mapbox/driving/{coordinates}"
        params = {
            'access_token': settings.MAPBOX_ACCESS_TOKEN,
            'geometries': 'geojson',
            'overview': 'full',
            'steps': 'true',
        }

        response = requests.get(url, params=params)
        response.raise_for_status()

        data = response.json()

        if not data.get('routes'):
            raise ValueError("No route found between locations")

        route = data['routes'][0]

        return {
            'distance': route['distance'] * 0.000621371,  # meters to miles
            'duration': route['duration'] / 3600,         # seconds to hours
            'geometry': route['geometry'],
            'legs': route['legs']
        }
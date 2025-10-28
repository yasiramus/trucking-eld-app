from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Trip, RestStop

from .serializers import TripSerializer, TripInputSerializer
from .services.mapbox_service import MapboxService
from .services.hos_calculator import HOSCalculator

@api_view(['POST'])
def calculate_trip(request):
    """
    Calculate trip route with rest stops and ELD logs

    POST /api/trips/calculate/
    Body: {
        "current_location": "Los Angeles, CA",
        "pickup_location": "Phoenix, AZ",
        "drop_off_location": "Dallas, TX",
        "current_cycle_used": 25.5
    }
    """
    # Validate input
    serializer = TripInputSerializer(data=request.data)

    if not serializer.is_valid():
        return Response(
            {'error': serializer.errors},
            status=status.HTTP_400_BAD_REQUEST
        )

    data = serializer.validated_data

    try:
        #Geocode locations (convert names to coordinates)
        print("Geocoding locations...")
        current_coords = MapboxService.geocode(data['current_location'])
        pickup_coords = MapboxService.geocode(data['pickup_location'])
        drop_off_coords = MapboxService.geocode(data['drop_off_location'])

        #Get route from Mapbox
        print("Getting route from Mapbox...")
        waypoints = [
            f"{current_coords['longitude']},{current_coords['latitude']}",
            f"{pickup_coords['longitude']},{pickup_coords['latitude']}",
            f"{drop_off_coords['longitude']},{drop_off_coords['latitude']}"
        ]

        route = MapboxService.get_route(waypoints)

        #Calculate HOS compliance and rest stops
        print("Calculating HOS compliance...")
        available_hours = HOSCalculator.calculate_available_hours(
            data['current_cycle_used']
        )

        rest_stops = HOSCalculator.calculate_rest_stops(
            total_distance=route['distance'],
            total_duration=route['duration'],
            current_cycle_used=data['current_cycle_used']
        )

        #Create trip record
        trip = Trip.objects.create(
            current_location=data['current_location'],
            pickup_location=data['pickup_location'],
            drop_off_location=data['drop_off_location'],
            current_cycle_used=data['current_cycle_used'],
            total_distance=route['distance'],
            total_duration=route['duration'],
            route_data={
                'geometry': route['geometry'],
                'waypoints': waypoints,
                'available_hours': available_hours
            }
        )

        #Create rest stop records
        for stop in rest_stops:
            RestStop.objects.create(
                trip=trip,
                location=f"Rest stop at mile {stop['distance_from_start']:.1f}",
                stop_type=stop['type'],
                duration=stop['duration'],
                distance_from_start=stop['distance_from_start']
            )

        #Return response
        response_serializer = TripSerializer(trip)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

    except ValueError as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        print(f"Error: {str(e)}")
        return Response(
            {'error': f"Server error: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
def get_trip(request, trip_id):
    """Get a specific trip with all details"""
    try:
        trip = Trip.objects.get(id=trip_id)
        serializer = TripSerializer(trip)
        return Response(serializer.data)
    except Trip.DoesNotExist:
        return Response(
            {'error': 'Trip not found'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['GET'])
def list_trips(request):
    """Get all trips"""
    trips = Trip.objects.all()
    serializer = TripSerializer(trips, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def health_check(request):
    """A Simple health check"""
    return Response({
    'status': 'ok',
    'message': 'Server is running',
    'mapbox_configured': bool(MapboxService.BASE_URL)
})
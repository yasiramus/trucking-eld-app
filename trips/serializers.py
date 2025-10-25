from rest_framework import serializers
from .models import Trip, RestStop

class RestStopSerializer(serializers.ModelSerializer):
    class Meta:
        model = RestStop
        fields = ['id', 'location', 'stop_type', 'duration',
                  'distance_from_start', 'latitude', 'longitude']


class TripSerializer(serializers.ModelSerializer):
    rest_stops = RestStopSerializer(many=True, read_only=True)

    class Meta:
        model = Trip
        fields = ['id', 'current_location', 'pickup_location',
                  'drop_off_location', 'current_cycle_used', 'total_distance',
                  'total_duration', 'route_data', 'rest_stops',
                  'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_current_cycle_used(self, value):
        if value < 0 or value > 70:
            raise serializers.ValidationError(
                "Current cycle used must be between 0 and 70 hours"
            )
        return value


class TripInputSerializer(serializers.Serializer):
    current_location = serializers.CharField(max_length=255)
    pickup_location = serializers.CharField(max_length=255)
    drop_off_location = serializers.CharField(max_length=255)
    current_cycle_used = serializers.FloatField(min_value=0, max_value=70)
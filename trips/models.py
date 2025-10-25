from django.db import models

class Trip(models.Model):
    # Input fields
    current_location = models.CharField(max_length=100)
    pickup_location = models.CharField(max_length=100)
    drop_off_location = models.CharField(max_length=100)
    current_cycle_used = models.FloatField()

    # Calculated fields
    total_distance = models.FloatField(null=True, blank=True)
    total_duration = models.FloatField(null=True, blank=True)
    route_data = models.JSONField(null=True, blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Trip from {self.current_location} to {self.drop_off_location}"

    class Meta:
        ordering = ['-created_at']


class RestStop(models.Model):
    trip = models.ForeignKey(Trip, related_name='rest_stops', on_delete=models.CASCADE)
    location = models.CharField(max_length=255)
    stop_type = models.CharField(max_length=50)
    duration = models.FloatField()
    distance_from_start = models.FloatField()
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)

    def __str__(self):
        return f"{self.stop_type} at {self.location}"

    class Meta:
        ordering = ['distance_from_start']
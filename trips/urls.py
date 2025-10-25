from django.urls import path
from . import views

urlpatterns = [
    path('health/', views.health_check, name='health-check'),
    path('calculate/', views.calculate_trip, name='calculate-trip'),
    path('list/', views.list_trips, name='list-trips'),
    path('<int:trip_id>/', views.get_trip, name='get-trip'),
]
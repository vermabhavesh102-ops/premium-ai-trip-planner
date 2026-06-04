from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TripViewSet, activity_history, generate_trip, track_click, workspace_detail, workspace_itinerary_detail
from .views import FileUploadViewSet

router = DefaultRouter()
router.register('', TripViewSet, basename='trips')

urlpatterns = [
    path('generate', generate_trip, name='trips-generate'),
    path('workspace', workspace_detail, name='workspace-detail'),
    path('workspace/itinerary/<str:itinerary_id>', workspace_itinerary_detail, name='workspace-itinerary-detail'),
    path('activity', activity_history, name='activity-history'),
    path('activity/click', track_click, name='activity-click'),
    path('upload', FileUploadViewSet.as_view({'post': 'create'}), name='trips-upload'),
    path('', include(router.urls)),
]

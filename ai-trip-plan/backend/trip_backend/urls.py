from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework.schemas import get_schema_view
from django.views.generic import TemplateView
from trips.views import workspace_itinerary_detail

schema_view = get_schema_view(title='Trip Planner API')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/', include('users.urls')),
    path('api/trips/', include('trips.urls')),
    path('workspace/itinerary/<str:itinerary_id>', workspace_itinerary_detail, name='workspace-itinerary-page'),
    path('api/schema/', schema_view, name='api-schema'),
    path('api/docs/', TemplateView.as_view(template_name='api-docs.html', extra_context={'schema_url':'api-schema'}), name='api-docs'),
]

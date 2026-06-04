import os

from django.conf import settings
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response

from .activity import log_activity
from .models import ActivityLog, Trip, Workspace, utcnow
from .serializers import ActivityLogSerializer, TripSerializer, WorkspaceSerializer


def is_admin(user):
    return bool(getattr(user, 'role', '') == 'admin' or getattr(user, 'is_staff', False))


def can_access_itinerary(user, trip):
    if not user or not getattr(user, 'is_authenticated', False):
        return False
    if is_admin(user):
        return True
    user_id = str(getattr(user, 'id', ''))
    return trip.owner_id == user_id or user_id in (trip.permissions or [])


def get_owned_or_permitted_trip(request, itinerary_id):
    trip = Trip.objects(itinerary_id=itinerary_id, is_deleted=False).first()
    if not trip:
        return None, Response({'detail': 'Itinerary not found'}, status=status.HTTP_404_NOT_FOUND)
    if not can_access_itinerary(request.user, trip):
        return None, Response({'detail': 'You do not have permission to access this itinerary'}, status=status.HTTP_403_FORBIDDEN)
    return trip, None


def get_or_create_workspace(user):
    workspace = Workspace.objects(owner_id=str(user.id)).first()
    if workspace:
        return workspace
    return Workspace(owner_id=str(user.id), owner_email=getattr(user, 'email', None)).save()


def attach_to_workspace(user, itinerary_id):
    workspace = get_or_create_workspace(user)
    if itinerary_id not in workspace.itinerary_ids:
        workspace.itinerary_ids.append(itinerary_id)
        workspace.save()
    return workspace


def remove_from_workspace(user, itinerary_id):
    workspace = Workspace.objects(owner_id=str(user.id)).first()
    if workspace and itinerary_id in workspace.itinerary_ids:
        workspace.itinerary_ids = [item for item in workspace.itinerary_ids if item != itinerary_id]
        workspace.save()
    return workspace


class FileUploadViewSet(viewsets.ViewSet):
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request):
        f = request.FILES.get('file')
        if not f:
            return Response({'detail': 'file required'}, status=status.HTTP_400_BAD_REQUEST)
        os.makedirs(settings.MEDIA_ROOT, exist_ok=True)
        dest = os.path.join(settings.MEDIA_ROOT, f.name)
        with open(dest, 'wb') as fh:
            for chunk in f.chunks():
                fh.write(chunk)
        url = settings.MEDIA_URL + f.name
        return Response({'url': url})


class TripViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        queryset = Trip.objects(is_deleted=False).order_by('-saved_at')
        if not is_admin(request.user):
            user_id = str(request.user.id)
            queryset = queryset.filter(owner_id=user_id)

        search = request.query_params.get('search')
        if search:
            queryset = queryset.filter(destination__icontains=search)

        serializer = TripSerializer(list(queryset), many=True)
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        trip, error = get_owned_or_permitted_trip(request, pk)
        if error:
            return error

        log_activity(request, 'itinerary_viewed', itinerary_id=trip.itinerary_id, status_code=200)
        return Response(TripSerializer(trip).data)

    def create(self, request):
        serializer = TripSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        trip = serializer.save(
            owner_id=str(request.user.id),
            owner_email=getattr(request.user, 'email', None),
            saved_at=utcnow(),
        )
        attach_to_workspace(request.user, trip.itinerary_id)
        log_activity(request, 'itinerary_created', itinerary_id=trip.itinerary_id, status_code=201)
        return Response(TripSerializer(trip).data, status=status.HTTP_201_CREATED)

    def update(self, request, pk=None):
        trip, error = get_owned_or_permitted_trip(request, pk)
        if error:
            return error
        if not is_admin(request.user) and trip.owner_id != str(request.user.id):
            return Response({'detail': 'Only the owner can update this itinerary'}, status=status.HTTP_403_FORBIDDEN)

        serializer = TripSerializer(trip, data=request.data)
        serializer.is_valid(raise_exception=True)
        updated = serializer.save()
        log_activity(request, 'itinerary_updated', itinerary_id=updated.itinerary_id, status_code=200)
        return Response(TripSerializer(updated).data)

    def partial_update(self, request, pk=None):
        trip, error = get_owned_or_permitted_trip(request, pk)
        if error:
            return error
        if not is_admin(request.user) and trip.owner_id != str(request.user.id):
            return Response({'detail': 'Only the owner can update this itinerary'}, status=status.HTTP_403_FORBIDDEN)

        serializer = TripSerializer(trip, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        updated = serializer.save()
        log_activity(request, 'itinerary_updated', itinerary_id=updated.itinerary_id, status_code=200)
        return Response(TripSerializer(updated).data)

    def destroy(self, request, pk=None):
        trip, error = get_owned_or_permitted_trip(request, pk)
        if error:
            return error
        if not is_admin(request.user) and trip.owner_id != str(request.user.id):
            return Response({'detail': 'Only the owner can delete this itinerary'}, status=status.HTTP_403_FORBIDDEN)

        trip.is_deleted = True
        trip.save()
        remove_from_workspace(request.user, trip.itinerary_id)
        log_activity(request, 'itinerary_deleted', itinerary_id=trip.itinerary_id, status_code=204)
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def workspace_detail(request):
    workspace = get_or_create_workspace(request.user)
    return Response(WorkspaceSerializer(workspace).data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def workspace_itinerary_detail(request, itinerary_id):
    trip, error = get_owned_or_permitted_trip(request, itinerary_id)
    if error:
        return error

    log_activity(
        request,
        'itinerary_viewed',
        itinerary_id=trip.itinerary_id,
        page_visited=f'/workspace/itinerary/{trip.itinerary_id}',
        status_code=200,
    )
    return Response(TripSerializer(trip).data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def activity_history(request):
    queryset = ActivityLog.objects.order_by('-created_at')
    if not is_admin(request.user):
        queryset = queryset.filter(user_id=str(request.user.id))

    itinerary_id = request.query_params.get('itinerary_id')
    if itinerary_id:
        queryset = queryset.filter(itinerary_id=itinerary_id)

    limit = min(int(request.query_params.get('limit', 100)), 500)
    serializer = ActivityLogSerializer(list(queryset[:limit]), many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def track_click(request):
    itinerary_id = request.data.get('itinerary_id')
    click_event = request.data.get('click_event') or request.data.get('event') or 'click'
    page_visited = request.data.get('page_visited') or request.data.get('page')
    log_activity(
        request,
        'click',
        itinerary_id=itinerary_id,
        click_event=click_event,
        page_visited=page_visited,
        status_code=201,
        metadata={'payload': request.data},
    )
    return Response({'detail': 'Activity recorded'}, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def generate_trip(request):
    data = request.data
    destination = data.get('destination', 'Unknown')
    duration = int(data.get('duration_days', 4))
    travelers = int(data.get('travelers', 2))

    if duration < 1 or duration > 60:
        return Response({'detail': 'duration_days must be between 1 and 60'}, status=status.HTTP_400_BAD_REQUEST)
    if travelers < 1 or travelers > 100:
        return Response({'detail': 'travelers must be between 1 and 100'}, status=status.HTTP_400_BAD_REQUEST)

    itinerary = []
    for i in range(duration):
        itinerary.append({
            'day': i + 1,
            'title': f'{destination} day {i + 1}',
            'estimated_cost': 'Flexible',
            'tips': ['Keep the pace relaxed.'],
            'items': [
                {'time': '09:00', 'title': 'Morning discovery', 'details': 'Local exploration'},
            ],
        })

    hotels = [
        {
            'name': f'{destination} Hotel {i + 1}',
            'area': 'Center',
            'price_note': 'Good value',
            'image': '',
        }
        for i in range(2)
    ]

    return Response({
        'destination': destination,
        'duration_days': duration,
        'travelers': travelers,
        'maps_embed_url': f'https://www.google.com/maps?q={destination}&output=embed',
        'itinerary': itinerary,
        'hotels': hotels,
        'nearby_places': [{'name': f'{destination} Old Quarter', 'category': 'Culture'}],
        'restaurants': [{'name': f'{destination} Local Eatery', 'category': 'Local', 'address': ''}],
        'transport': [{'title': 'Arrival transfer', 'detail': 'Use a cab or local transit.'}],
    })

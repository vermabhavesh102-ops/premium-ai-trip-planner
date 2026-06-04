from django.contrib import admin
from django.http import HttpResponse
from django.urls import path
from django.utils.html import escape

from .models import ActivityLog, Booking, Trip, Workspace


def render_document_table(title, documents, fields):
    rows = []
    for document in documents:
        cells = ''.join(f'<td>{escape(str(getattr(document, field, "")))}</td>' for field in fields)
        rows.append(f'<tr>{cells}</tr>')
    headers = ''.join(f'<th>{escape(field)}</th>' for field in fields)
    return HttpResponse(
        f"""
        <html>
          <head>
            <title>{escape(title)}</title>
            <style>
              body {{ font-family: system-ui, sans-serif; padding: 24px; }}
              table {{ border-collapse: collapse; width: 100%; }}
              th, td {{ border: 1px solid #ddd; padding: 8px; text-align: left; vertical-align: top; }}
              th {{ background: #f5f5f5; }}
              a {{ color: #3164a8; }}
            </style>
          </head>
          <body>
            <p><a href="/admin/">Back to admin</a></p>
            <h1>{escape(title)}</h1>
            <table><thead><tr>{headers}</tr></thead><tbody>{''.join(rows)}</tbody></table>
          </body>
        </html>
        """
    )


def mongo_itineraries(request):
    return render_document_table(
        'MongoDB Itineraries',
        Trip.objects(is_deleted=False).order_by('-saved_at')[:200],
        ['itinerary_id', 'owner_id', 'owner_email', 'destination', 'duration_days', 'travelers', 'saved_at', 'updated_at'],
    )


def mongo_activity_logs(request):
    return render_document_table(
        'MongoDB Activity Logs',
        ActivityLog.objects.order_by('-created_at')[:500],
        ['user_id', 'user_email', 'itinerary_id', 'action', 'page_visited', 'click_event', 'ip_address', 'created_at'],
    )


def mongo_workspaces(request):
    return render_document_table(
        'MongoDB Workspaces',
        Workspace.objects.order_by('-updated_at')[:200],
        ['owner_id', 'owner_email', 'name', 'itinerary_ids', 'created_at', 'updated_at'],
    )


def mongo_bookings(request):
    return render_document_table(
        'MongoDB Bookings',
        Booking.objects.order_by('-created_at')[:200],
        ['booking_id', 'owner_id', 'itinerary_id', 'provider', 'status', 'created_at', 'updated_at'],
    )


original_get_urls = admin.site.get_urls


def get_mongo_urls():
    urls = [
        path('mongo/itineraries/', admin.site.admin_view(mongo_itineraries), name='mongo-itineraries'),
        path('mongo/activity-logs/', admin.site.admin_view(mongo_activity_logs), name='mongo-activity-logs'),
        path('mongo/workspaces/', admin.site.admin_view(mongo_workspaces), name='mongo-workspaces'),
        path('mongo/bookings/', admin.site.admin_view(mongo_bookings), name='mongo-bookings'),
    ]
    return urls + original_get_urls()


admin.site.get_urls = get_mongo_urls

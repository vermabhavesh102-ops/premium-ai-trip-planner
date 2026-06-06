from django.contrib import admin
from django.http import HttpResponse
from django.urls import path
from django.utils.html import escape

from .models import User


def mongo_users(request):
    users = User.objects.order_by('-date_joined')[:500]
    rows = []
    for user in users:
        rows.append(
            '<tr>'
            f'<td>{escape(str(user.id))}</td>'
            f'<td>{escape(user.email)}</td>'
            f'<td>{escape(user.role)}</td>'
            f'<td>{escape(str(user.is_active))}</td>'
            f'<td>{escape(str(user.last_login or ""))}</td>'
            f'<td>{escape(str(user.last_active or ""))}</td>'
            '</tr>'
        )
    return HttpResponse(
        f"""
        <html>
          <head>
            <title>MongoDB Users</title>
            <style>
              body {{ font-family: system-ui, sans-serif; padding: 24px; }}
              table {{ border-collapse: collapse; width: 100%; }}
              th, td {{ border: 1px solid #ddd; padding: 8px; text-align: left; }}
              th {{ background: #f5f5f5; }}
            </style>
          </head>
          <body>
            <p><a href="/admin/">Back to admin</a></p>
            <h1>MongoDB Users</h1>
            <table>
              <thead><tr><th>ID</th><th>Email</th><th>Role</th><th>Active</th><th>Last Login</th><th>Last Active</th></tr></thead>
              <tbody>{''.join(rows)}</tbody>
            </table>
          </body>
        </html>
        """
    )


original_get_urls = admin.site.get_urls


def get_user_mongo_urls():
    return [path('mongo/users/', admin.site.admin_view(mongo_users), name='mongo-users')] + original_get_urls()


admin.site.get_urls = get_user_mongo_urls

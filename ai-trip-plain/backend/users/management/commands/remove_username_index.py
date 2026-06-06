from django.core.management.base import BaseCommand

from mongoengine.connection import get_db


class Command(BaseCommand):
    help = "Remove MongoDB indexes related to name fields from the users collection."

    def handle(self, *args, **options):
        db = get_db()
        users = db['users']

        dropped = []
        for idx in users.list_indexes():
            keys = idx.get('key', {})
            if 'username' in keys or 'full_name' in keys:
                users.drop_index(idx['name'])
                dropped.append(idx['name'])

        self.stdout.write(self.style.SUCCESS(f'Dropped name-related indexes: {dropped}'))


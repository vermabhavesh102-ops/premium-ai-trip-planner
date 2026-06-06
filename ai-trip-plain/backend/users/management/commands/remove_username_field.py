from django.core.management.base import BaseCommand

from mongoengine.connection import get_db


class Command(BaseCommand):
    help = "Remove name-related fields from all user documents in MongoDB."

    def handle(self, *args, **options):
        db = get_db()
        users_collection = db.get_collection('users')
        result = users_collection.update_many({}, {'$unset': {'username': '', 'full_name': ''}})
        self.stdout.write(self.style.SUCCESS(
            f"Unset name fields for {result.modified_count} users (matched {result.matched_count})."
        ))


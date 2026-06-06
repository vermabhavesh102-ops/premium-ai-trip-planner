from django.core.management.base import BaseCommand, CommandError

from users.email_utils import send_otp_email, smtp_config_summary, smtp_health_check


class Command(BaseCommand):
    help = 'Check SMTP configuration and optionally send a TripZen AI OTP test email.'

    def add_arguments(self, parser):
        parser.add_argument('--to', required=True, help='Recipient email address to test.')
        parser.add_argument('--send-test', action='store_true', help='Send a test OTP email after checking SMTP.')

    def handle(self, *args, **options):
        recipient = options['to']
        self.stdout.write(f'SMTP config: {smtp_config_summary()}')

        ok, message = smtp_health_check(recipient)
        if not ok:
            raise CommandError(f'SMTP check failed: {message}')
        self.stdout.write(self.style.SUCCESS(message))

        if options['send_test']:
            message_id = send_otp_email(recipient=recipient, otp='123456', user_id='smtp-check', expires_minutes=10)
            self.stdout.write(self.style.SUCCESS(f'Test OTP email accepted by SMTP. Message-ID: {message_id}'))

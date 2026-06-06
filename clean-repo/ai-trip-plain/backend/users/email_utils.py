import logging
import os
import secrets
from email.utils import formataddr

from django.conf import settings
from django.core.mail import EmailMultiAlternatives, get_connection

logger = logging.getLogger(__name__)


def sender_address() -> str:
    sender = getattr(settings, 'EMAIL_FROM_DEFAULT', '') or getattr(settings, 'DEFAULT_FROM_EMAIL', '') or getattr(settings, 'EMAIL_HOST_USER', '')
    return formataddr(('TripZen AI', sender or 'noreply@example.com'))


def message_id_domain() -> str:
    configured = os.getenv('EMAIL_MESSAGE_ID_DOMAIN', '').strip()
    if configured:
        return configured

    sender = getattr(settings, 'EMAIL_FROM_DEFAULT', '') or getattr(settings, 'EMAIL_HOST_USER', '')
    if '@' in sender:
        return sender.split('@', 1)[1]
    return 'tripzen.local'


def smtp_config_summary() -> dict[str, object]:
    return {
        'backend': getattr(settings, 'EMAIL_BACKEND', ''),
        'host': getattr(settings, 'EMAIL_HOST', ''),
        'port': getattr(settings, 'EMAIL_PORT', ''),
        'sender': getattr(settings, 'EMAIL_FROM_DEFAULT', '') or getattr(settings, 'EMAIL_HOST_USER', ''),
        'use_tls': getattr(settings, 'EMAIL_USE_TLS', False),
        'use_ssl': getattr(settings, 'EMAIL_USE_SSL', False),
        'has_password': bool(getattr(settings, 'EMAIL_HOST_PASSWORD', '')),
    }


def validate_smtp_configuration() -> list[str]:
    config = smtp_config_summary()
    errors: list[str] = []
    if 'smtp.EmailBackend' not in str(config['backend']):
        errors.append('EMAIL_BACKEND is not SMTP.')
    if not config['host']:
        errors.append('EMAIL_HOST is missing.')
    if not config['port']:
        errors.append('EMAIL_PORT is missing.')
    if not config['sender']:
        errors.append('EMAIL_HOST_USER or EMAIL_FROM_DEFAULT is missing.')
    if not config['has_password']:
        errors.append('EMAIL_HOST_PASSWORD/App Password is missing.')
    if config['host'] == 'smtp.gmail.com' and int(config['port'] or 0) == 587 and not config['use_tls']:
        errors.append('Gmail SMTP on port 587 requires EMAIL_USE_TLS=1.')
    if config['use_tls'] and config['use_ssl']:
        errors.append('EMAIL_USE_TLS and EMAIL_USE_SSL cannot both be enabled.')
    return errors


def send_otp_email(*, recipient: str, otp: str, user_id: str, expires_minutes: int) -> str:
    errors = validate_smtp_configuration()
    if errors:
        logger.error('OTP email configuration invalid user_id=%s email=%s errors=%s', user_id, recipient, errors)
        raise RuntimeError('Email service is not configured correctly. Please contact support.')

    message_id = f'<{secrets.token_hex(16)}@{message_id_domain()}>'
    subject = 'Your TripZen AI password change OTP'
    text_body = (
        f'Your TripZen AI password change OTP is {otp}.\n\n'
        f'This code expires in {expires_minutes} minutes. If you did not request this, you can ignore this email.\n\n'
        'TripZen AI'
    )
    html_body = f"""
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#111827">
      <h2 style="margin:0 0 12px">TripZen AI password change OTP</h2>
      <p>Your verification code is:</p>
      <p style="font-size:28px;font-weight:700;letter-spacing:6px;margin:16px 0">{otp}</p>
      <p>This code expires in {expires_minutes} minutes.</p>
      <p style="color:#6b7280;font-size:13px">If you did not request this, you can ignore this email.</p>
    </div>
    """

    email = EmailMultiAlternatives(
        subject=subject,
        body=text_body,
        from_email=sender_address(),
        to=[recipient],
        headers={
            'Reply-To': getattr(settings, 'EMAIL_FROM_DEFAULT', '') or getattr(settings, 'EMAIL_HOST_USER', ''),
            'Message-ID': message_id,
            'X-TripZen-Email-Type': 'password-otp',
            'Auto-Submitted': 'auto-generated',
        },
    )
    email.attach_alternative(html_body, 'text/html')

    logger.info(
        'OTP email send attempt user_id=%s email=%s message_id=%s smtp=%s',
        user_id,
        recipient,
        message_id,
        smtp_config_summary(),
    )
    sent_count = email.send(fail_silently=False)
    logger.info(
        'OTP email SMTP accepted user_id=%s email=%s message_id=%s sent_count=%s',
        user_id,
        recipient,
        message_id,
        sent_count,
    )
    return message_id


def smtp_health_check(recipient: str) -> tuple[bool, str]:
    errors = validate_smtp_configuration()
    if errors:
        return False, '; '.join(errors)

    try:
        connection = get_connection(fail_silently=False, timeout=getattr(settings, 'EMAIL_TIMEOUT', 20))
        connection.open()
        connection.close()
    except Exception as exc:
        logger.exception('SMTP connection check failed recipient=%s error=%s', recipient, exc)
        return False, str(exc)

    return True, 'SMTP connection succeeded.'

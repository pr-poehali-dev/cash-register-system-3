"""Отправка уведомления о вызове сотрудника на email через SMTP."""
import json
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime


def handler(event: dict, context) -> dict:
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    }

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': headers, 'body': ''}

    body = json.loads(event.get('body') or '{}')
    message = body.get('message', 'Требуется помощь на кассе')
    cashier = body.get('cashier', 'Кассир')
    location = body.get('location', 'Касса №1')

    smtp_host = os.environ['SMTP_HOST']
    smtp_port = int(os.environ['SMTP_PORT'])
    smtp_user = os.environ['SMTP_USER']
    smtp_password = os.environ['SMTP_PASSWORD']
    notify_email = os.environ['NOTIFY_EMAIL']

    now = datetime.now().strftime('%d.%m.%Y %H:%M')

    msg = MIMEMultipart('alternative')
    msg['Subject'] = f'🔔 ВЫЗОВ СОТРУДНИКА — {location}'
    msg['From'] = smtp_user
    msg['To'] = notify_email

    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; background: #f9f9f9; border-radius: 12px; overflow: hidden;">
      <div style="background: #ef4444; padding: 24px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">🔔 ВЫЗОВ СОТРУДНИКА</h1>
      </div>
      <div style="padding: 24px; background: white; margin: 16px; border-radius: 8px; border-left: 4px solid #ef4444;">
        <p style="margin: 0 0 12px 0; font-size: 16px; color: #111;"><strong>Место:</strong> {location}</p>
        <p style="margin: 0 0 12px 0; font-size: 16px; color: #111;"><strong>Кассир:</strong> {cashier}</p>
        <p style="margin: 0 0 12px 0; font-size: 16px; color: #111;"><strong>Сообщение:</strong> {message}</p>
        <p style="margin: 0; font-size: 14px; color: #888;"><strong>Время:</strong> {now}</p>
      </div>
      <p style="text-align: center; color: #aaa; font-size: 12px; padding: 16px;">POS-система · Касса</p>
    </div>
    """

    msg.attach(MIMEText(html, 'html', 'utf-8'))

    use_ssl = smtp_port == 465
    if use_ssl:
        server = smtplib.SMTP_SSL(smtp_host, smtp_port)
    else:
        server = smtplib.SMTP(smtp_host, smtp_port)
        server.starttls()

    server.login(smtp_user, smtp_password)
    server.sendmail(smtp_user, notify_email, msg.as_string())
    server.quit()

    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({'ok': True}),
    }

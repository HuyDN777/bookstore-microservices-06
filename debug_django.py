import os
import sys
import django

# Patch MySQLdb with PyMySQL
import pymysql
pymysql.install_as_MySQLdb()

# Add service path to sys.path
sys.path.insert(0, os.path.abspath('customer-service'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'customer_service.settings')

from django.conf import settings; settings.DATABASES['default']['HOST'] = '127.0.0.1'; django.setup()

from django.core.management import call_command
try:
    call_command('check')
    call_command('migrate')
    print("Check and migrate successful")
except Exception as e:
    print("Error:", str(e))

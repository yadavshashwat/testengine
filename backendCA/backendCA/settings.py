"""
Django settings for backendCA project.

For more information on this file, see
https://docs.djangoproject.com/en/1.6/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/1.6/ref/settings/
"""

PRODUCTION = False

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
import os
BASE_DIR = os.path.dirname(os.path.dirname(__file__))




# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/1.6/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'kx+lu08prfiknhbqjwpiuv03m9tz3y&-5yk)oe3so=%s2ahyb_'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

TEMPLATE_DEBUG = True

ALLOWED_HOSTS = []


# Application definition

INSTALLED_APPS = (
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # 'django_extensions',
    'testmgmt',
    'questionmgmt',
    'coursemgmt',
    'usermgmt',
    'overall',
    'mailing',
    'dataupload',
    'testactivity'

)

MIDDLEWARE_CLASSES = (
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'overall.middleware.corsMiddleware',
    'overall.disable.DisableCSRF',

)

AUTH_USER_MODEL = 'usermgmt.CAUsers'

ROOT_URLCONF = 'backendCA.urls'

WSGI_APPLICATION = 'backendCA.wsgi.application'

SESSION_SERIALIZER = 'django.contrib.sessions.serializers.JSONSerializer'

if PRODUCTION:
    DATABASES = {
    'default' : {
        'ENGINE' : 'django_mongodb_engine',
        'NAME' : 'ca_backend',
        'USER': 'causer',
        'PASSWORD': 'Ar%^7UR4%^7uGfR$s'
        }
    }
else:
    DATABASES = {
    'default' : {
        'ENGINE' : 'django_mongodb_engine',
        'NAME' : 'ca_backend'
        }
    }

# Internationalization
# https://docs.djangoproject.com/en/1.6/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'Asia/Kolkata'

USE_I18N = True

USE_L10N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/1.6/howto/static-files/

STATIC_URL = '/static/'

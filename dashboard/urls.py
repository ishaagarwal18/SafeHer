from django.urls import path
from .views import *

urlpatterns = [

    path(
        '',
        dashboard_page,
        name='dashboard'
    ),

    path(
        'sos/',
        sos_page,
        name='sos'
    ),

    path(
        'contacts/',
        contacts_page,
        name='contacts'
    ),
]
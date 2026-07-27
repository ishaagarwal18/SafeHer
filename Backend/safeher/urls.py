from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    # session-based template views + auth API endpoints
    path('', include('authentication.urls')),
    # dashboard template views + dashboard API endpoints
    path('dashboard/', include('dashboard.urls')),
]
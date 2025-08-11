from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from .media_views import MediaServeView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/perfumes/', include('perfumes.urls')),
    path('api/users/', include('users.urls')),
    path('api/orders/', include('orders.urls')),
]

# Serve media files with CORS headers in development
if settings.DEBUG:
    # Use custom media serving view with CORS headers
    urlpatterns += [
        re_path(r'^media/(?P<path>.*)$', MediaServeView.as_view(), name='media'),
    ]
    # Serve static files normally
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
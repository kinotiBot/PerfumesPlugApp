from django.http import HttpResponse, Http404
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.utils.decorators import method_decorator
from django.views import View
import os
import mimetypes

@method_decorator(csrf_exempt, name='dispatch')
class MediaServeView(View):
    """Custom media serving view with CORS headers"""
    
    def get(self, request, path):
        """Serve media files with CORS headers"""
        # Construct the full file path
        file_path = os.path.join(settings.MEDIA_ROOT, path)
        
        # Check if file exists
        if not os.path.exists(file_path) or not os.path.isfile(file_path):
            raise Http404("Media file not found")
        
        # Get the file's MIME type
        content_type, _ = mimetypes.guess_type(file_path)
        if content_type is None:
            content_type = 'application/octet-stream'
        
        # Read and serve the file
        try:
            with open(file_path, 'rb') as f:
                response = HttpResponse(f.read(), content_type=content_type)
                
                # Add CORS headers
                response['Access-Control-Allow-Origin'] = '*'
                response['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
                response['Access-Control-Allow-Headers'] = 'Origin, Content-Type, Accept, Authorization'
                response['Access-Control-Max-Age'] = '86400'
                
                return response
        except IOError:
            raise Http404("Error reading media file")
    
    def options(self, request, path):
        """Handle CORS preflight requests"""
        response = HttpResponse()
        response['Access-Control-Allow-Origin'] = '*'
        response['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
        response['Access-Control-Allow-Headers'] = 'Origin, Content-Type, Accept, Authorization'
        response['Access-Control-Max-Age'] = '86400'
        return response
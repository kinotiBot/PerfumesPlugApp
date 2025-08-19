from rest_framework import viewsets, generics, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model, authenticate
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from .models import Address
from .serializers import (
    UserSerializer, UserRegisterSerializer, UserLoginSerializer,
    AddressSerializer, PasswordChangeSerializer
)

User = get_user_model()

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Regular users can only see their own profile
        if not self.request.user.is_staff:
            return User.objects.filter(id=self.request.user.id)
        return self.queryset
    
    def get_permissions(self):
        if self.action in ['create', 'create_test_user']:
            return [permissions.AllowAny()]
        elif self.action in ['update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated()]
        elif self.action in ['list']:
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticated()]
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def change_password(self, request):
        user = request.user
        serializer = PasswordChangeSerializer(data=request.data)
        
        if serializer.is_valid():
            # Check old password
            if not user.check_password(serializer.validated_data['old_password']):
                return Response({"old_password": ["Wrong password."]}, 
                                status=status.HTTP_400_BAD_REQUEST)
            
            # Set new password
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            return Response({"message": "Password updated successfully"}, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def create_test_user(self, request):
        """Temporary endpoint to create test users for debugging"""
        email = request.data.get('email', 'testuser@perfumesplug.com')
        password = request.data.get('password', 'testpass123')
        is_staff = request.data.get('is_staff', False)
        is_admin = request.data.get('is_admin', False)
        
        try:
            # Create or get user
            user, created = User.objects.get_or_create(
                email=email,
                defaults={'is_active': True}
            )
            
            # Set password and admin privileges
            user.set_password(password)
            user.is_staff = is_staff
            user.is_admin = is_admin
            if is_staff or is_admin:
                user.is_superuser = True
            user.save()
            
            # Verify password
            password_check = user.check_password(password)
            
            return Response({
                'success': True,
                'message': f'User {"created" if created else "updated"}',
                'user_id': user.id,
                'email': user.email,
                'is_active': user.is_active,
                'is_staff': user.is_staff,
                'is_admin': user.is_admin,
                'is_superuser': user.is_superuser,
                'password_verified': password_check,
                'total_users': User.objects.count()
            })
            
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = UserRegisterSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        refresh = RefreshToken.for_user(user)
        
        return Response({
            "user": UserSerializer(user, context=self.get_serializer_context()).data,
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)

@method_decorator(csrf_exempt, name='dispatch')
class LoginView(generics.GenericAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = UserLoginSerializer
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        
        refresh = RefreshToken.for_user(user)
        
        return Response({
            "user": UserSerializer(user, context=self.get_serializer_context()).data,
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        })

class AddressViewSet(viewsets.ModelViewSet):
    serializer_class = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        # If this is set as default, unset any existing default of the same type
        if serializer.validated_data.get('is_default', False):
            address_type = serializer.validated_data.get('address_type')
            Address.objects.filter(
                user=self.request.user,
                address_type=address_type,
                is_default=True
            ).update(is_default=False)
        
        serializer.save(user=self.request.user)
    
    def perform_update(self, serializer):
        # If this is set as default, unset any existing default of the same type
        if serializer.validated_data.get('is_default', False):
            address_type = serializer.validated_data.get('address_type')
            Address.objects.filter(
                user=self.request.user,
                address_type=address_type,
                is_default=True
            ).exclude(id=serializer.instance.id).update(is_default=False)
        
        serializer.save()
from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from django.utils.translation import gettext_lazy as _
from .models import Address

User = get_user_model()

class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = ['id', 'address_type', 'street_address', 'apartment_address',
                  'city', 'state', 'country', 'zip_code', 'is_default']

class UserSerializer(serializers.ModelSerializer):
    addresses = AddressSerializer(many=True, read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'phone_number',
                  'profile_picture', 'is_staff', 'is_admin', 'addresses']
        read_only_fields = ['is_staff', 'is_admin']

class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    password2 = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    
    class Meta:
        model = User
        fields = ['email', 'first_name', 'last_name', 'password', 'password2', 'phone_number']
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user

class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, write_only=True, style={'input_type': 'password'})
    
    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        
        print(f"DEBUG: Login attempt for email: {email}")
        
        if email and password:
            # Authenticate without binding to request to avoid backend-specific request requirements
            user = authenticate(username=email, password=password)
            print(f"DEBUG: authenticate() result: {user}")

            # Fallback: explicitly verify password if authenticate() returns None
            if not user:
                try:
                    user_obj = User.objects.get(email=email)
                    print(f"DEBUG: Found user: {user_obj.email}, active: {user_obj.is_active}")
                    password_check = user_obj.check_password(password)
                    print(f"DEBUG: Password check result: {password_check}")
                    if password_check:
                        user = user_obj
                        print(f"DEBUG: Using fallback authentication for {email}")
                except User.DoesNotExist:
                    print(f"DEBUG: User with email {email} does not exist")
                    user = None
            
            if not user:
                print(f"DEBUG: Authentication failed for {email}")
                msg = _('Unable to log in with provided credentials.')
                raise serializers.ValidationError(msg, code='authorization')
        else:
            msg = _('Must include "email" and "password".')
            raise serializers.ValidationError(msg, code='authorization')
        
        attrs['user'] = user
        return attrs

class PasswordChangeSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True, write_only=True, style={'input_type': 'password'})
    new_password = serializers.CharField(required=True, write_only=True, style={'input_type': 'password'})
    new_password2 = serializers.CharField(required=True, write_only=True, style={'input_type': 'password'})
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password2']:
            raise serializers.ValidationError({"new_password": "Password fields didn't match."})
        return attrs
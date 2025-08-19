from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Create a test user for authentication testing'

    def handle(self, *args, **options):
        email = 'testuser@perfumesplug.com'
        password = 'testpass123'
        
        try:
            # Check if user already exists
            if User.objects.filter(email=email).exists():
                user = User.objects.get(email=email)
                self.stdout.write(f'User {email} already exists')
            else:
                # Create new user
                user = User.objects.create_user(
                    email=email,
                    password=password,
                    is_active=True
                )
                self.stdout.write(f'Created user: {email}')
            
            # Update password to ensure it's set correctly
            user.set_password(password)
            user.save()
            
            # Verify user details
            self.stdout.write(f'User ID: {user.id}')
            self.stdout.write(f'Email: {user.email}')
            self.stdout.write(f'Is active: {user.is_active}')
            self.stdout.write(f'Is staff: {user.is_staff}')
            
            # Test password
            password_check = user.check_password(password)
            self.stdout.write(f'Password verification: {password_check}')
            
            # Count total users
            total_users = User.objects.count()
            self.stdout.write(f'Total users in database: {total_users}')
            
            self.stdout.write(
                self.style.SUCCESS(f'Successfully configured test user: {email}')
            )
            
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error creating user: {str(e)}')
            )
            import traceback
            traceback.print_exc()
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction

User = get_user_model()

class Command(BaseCommand):
    help = 'Create admin user for production deployment'

    def handle(self, *args, **options):
        email = 'admin@example.com'
        password = 'admin123'
        
        self.stdout.write('Creating production admin user...')
        
        try:
            with transaction.atomic():
                # Check if admin user already exists
                if User.objects.filter(email=email).exists():
                    user = User.objects.get(email=email)
                    self.stdout.write(f'Admin user already exists: {email}')
                    
                    # Update password and ensure admin privileges
                    user.set_password(password)
                    user.is_staff = True
                    user.is_superuser = True
                    user.is_active = True
                    user.save()
                    
                    self.stdout.write(
                        self.style.SUCCESS(f'✅ Updated admin user: {email}')
                    )
                else:
                    # Create new admin user
                    user = User.objects.create_superuser(
                        email=email,
                        password=password,
                        first_name='Admin',
                        last_name='User'
                    )
                    
                    self.stdout.write(
                        self.style.SUCCESS(f'✅ Created admin user: {email}')
                    )
                
                # Verify user properties
                self.stdout.write(f'   - Is active: {user.is_active}')
                self.stdout.write(f'   - Is staff: {user.is_staff}')
                self.stdout.write(f'   - Is superuser: {user.is_superuser}')
                
                # Test password
                if user.check_password(password):
                    self.stdout.write('   - Password: ✅ Valid')
                else:
                    self.stdout.write('   - Password: ❌ Invalid')
                
                self.stdout.write('')
                self.stdout.write('Admin user ready for production!')
                self.stdout.write(f'Email: {email}')
                self.stdout.write(f'Password: {password}')
                
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'❌ Error creating admin user: {str(e)}')
            )
            raise
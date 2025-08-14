from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Check and create admin user if needed'

    def handle(self, *args, **options):
        self.stdout.write('Checking admin user...')
        
        try:
            admin_user = User.objects.get(email='admin@example.com')
            self.stdout.write(f'✅ Admin user exists: {admin_user.email}')
            self.stdout.write(f'   - Is active: {admin_user.is_active}')
            self.stdout.write(f'   - Is staff: {admin_user.is_staff}')
            self.stdout.write(f'   - Is superuser: {admin_user.is_superuser}')
            
            # Test password
            if admin_user.check_password('admin123'):
                self.stdout.write('   - Password check: ✅ Valid')
            else:
                self.stdout.write('   - Password check: ❌ Invalid - updating password')
                admin_user.set_password('admin123')
                admin_user.save()
                self.stdout.write('   - Password updated')
                
        except User.DoesNotExist:
            self.stdout.write('❌ Admin user not found. Creating...')
            admin_user = User.objects.create_superuser(
                email='admin@example.com',
                password='admin123',
                first_name='Admin',
                last_name='User'
            )
            self.stdout.write('✅ Admin user created successfully')
            self.stdout.write(f'   - Email: {admin_user.email}')
            self.stdout.write(f'   - Is staff: {admin_user.is_staff}')
            self.stdout.write(f'   - Is superuser: {admin_user.is_superuser}')
        
        self.stdout.write('\nDone! You can now try logging in with:')
        self.stdout.write('Email: admin@example.com')
        self.stdout.write('Password: admin123')
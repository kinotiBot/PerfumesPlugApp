from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction

User = get_user_model()

class Command(BaseCommand):
    help = 'Create a superuser account for admin access'

    def add_arguments(self, parser):
        parser.add_argument(
            '--email',
            type=str,
            default='admin@perfumesplug.com',
            help='Email for the superuser account'
        )
        parser.add_argument(
            '--password',
            type=str,
            default='admin123456',
            help='Password for the superuser account'
        )
        parser.add_argument(
            '--first-name',
            type=str,
            default='Admin',
            help='First name for the superuser'
        )
        parser.add_argument(
            '--last-name',
            type=str,
            default='User',
            help='Last name for the superuser'
        )

    def handle(self, *args, **options):
        email = options['email']
        password = options['password']
        first_name = options['first_name']
        last_name = options['last_name']

        try:
            with transaction.atomic():
                # Check if user already exists
                if User.objects.filter(email=email).exists():
                    user = User.objects.get(email=email)
                    # Update existing user to be superuser
                    user.is_staff = True
                    user.is_admin = True
                    user.is_superuser = True
                    user.set_password(password)
                    user.first_name = first_name
                    user.last_name = last_name
                    user.save()
                    self.stdout.write(
                        self.style.SUCCESS(
                            f'Successfully updated existing user {email} to superuser status'
                        )
                    )
                else:
                    # Create new superuser
                    user = User.objects.create_user(
                        email=email,
                        password=password,
                        first_name=first_name,
                        last_name=last_name,
                        is_staff=True,
                        is_admin=True
                    )
                    user.is_superuser = True
                    user.save()
                    self.stdout.write(
                        self.style.SUCCESS(
                            f'Successfully created superuser {email}'
                        )
                    )

                # Verify the user was created/updated correctly
                user.refresh_from_db()
                self.stdout.write(
                    self.style.SUCCESS(
                        f'Superuser details:\n'
                        f'  Email: {user.email}\n'
                        f'  Name: {user.first_name} {user.last_name}\n'
                        f'  Is Staff: {user.is_staff}\n'
                        f'  Is Admin: {user.is_admin}\n'
                        f'  Is Superuser: {user.is_superuser}\n'
                        f'  Password Set: {user.has_usable_password()}'
                    )
                )

        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error creating superuser: {str(e)}')
            )
            raise e
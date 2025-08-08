from django.core.management.base import BaseCommand
from perfumes.models import Perfume
from decimal import Decimal

class Command(BaseCommand):
    help = 'Create test perfumes with out-of-stock status for testing the out-of-stock display functionality'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Setting some perfumes to out-of-stock for testing...'))
        
        # Get some existing perfumes and set them to out of stock
        perfumes = Perfume.objects.all()[:3]  # Get first 3 perfumes
        
        if not perfumes.exists():
            self.stdout.write(self.style.WARNING('No perfumes found in database. Please add some perfumes first.'))
            return
        
        updated_count = 0
        for perfume in perfumes:
            # Set stock to 0 to make it out of stock
            perfume.stock = 0
            perfume.save()
            
            updated_count += 1
            self.stdout.write(
                self.style.SUCCESS(f'Set "{perfume.name}" by {perfume.brand.name} to out-of-stock')
            )
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully set {updated_count} perfumes to out-of-stock status!')
        )
        
        # Display instructions
        self.stdout.write('\n' + self.style.WARNING('Testing Instructions:'))
        self.stdout.write('1. Visit the perfume listing page')
        self.stdout.write('2. Look for "Out of Stock" badges on the updated perfumes')
        self.stdout.write('3. Verify that the "Add to Cart" button is disabled and shows "Out of Stock"')
        self.stdout.write('4. Check that the button styling is different (outlined instead of contained)')
        
        # Show how to restore stock
        self.stdout.write('\n' + self.style.WARNING('To restore stock, run:'))
        self.stdout.write('python manage.py restore_stock_test')
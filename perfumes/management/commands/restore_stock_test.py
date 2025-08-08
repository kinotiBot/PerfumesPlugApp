from django.core.management.base import BaseCommand
from perfumes.models import Perfume
from decimal import Decimal

class Command(BaseCommand):
    help = 'Restore stock for perfumes that were set to out-of-stock for testing'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Restoring stock for out-of-stock perfumes...'))
        
        # Get all out-of-stock perfumes
        out_of_stock_perfumes = Perfume.objects.filter(stock=0)
        
        if not out_of_stock_perfumes.exists():
            self.stdout.write(self.style.WARNING('No out-of-stock perfumes found.'))
            return
        
        updated_count = 0
        for perfume in out_of_stock_perfumes:
            # Restore stock to a reasonable amount
            perfume.stock = 15  # Default stock amount
            perfume.save()
            
            updated_count += 1
            self.stdout.write(
                self.style.SUCCESS(f'Restored stock for "{perfume.name}" by {perfume.brand.name} (stock: {perfume.stock})')
            )
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully restored stock for {updated_count} perfumes!')
        )
        
        # Display instructions
        self.stdout.write('\n' + self.style.WARNING('Verification:'))
        self.stdout.write('1. Visit the perfume listing page')
        self.stdout.write('2. Verify that "Out of Stock" badges are no longer visible')
        self.stdout.write('3. Confirm that "Add to Cart" buttons are enabled and functional')
        self.stdout.write('4. Check that button styling is back to normal (contained variant)')
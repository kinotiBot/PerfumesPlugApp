import time
import requests
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select
from selenium.webdriver.chrome.options import Options

def test_frontend_payment_status():
    """Test payment status updates in the frontend interface"""
    
    # Setup Chrome options
    chrome_options = Options()
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--window-size=1920,1080")
    
    try:
        driver = webdriver.Chrome(options=chrome_options)
        wait = WebDriverWait(driver, 10)
        
        print("🌐 Opening frontend application...")
        driver.get("http://localhost:3000")
        
        # Wait for the page to load
        time.sleep(2)
        
        # Navigate to admin login
        print("🔐 Navigating to admin login...")
        driver.get("http://localhost:3000/admin/login")
        
        # Wait for login form
        email_input = wait.until(EC.presence_of_element_located((By.NAME, "email")))
        password_input = driver.find_element(By.NAME, "password")
        
        # Login as admin
        print("📝 Logging in as admin...")
        email_input.send_keys("admin@example.com")
        password_input.send_keys("admin123")
        
        # Click login button
        login_button = driver.find_element(By.XPATH, "//button[contains(text(), 'Login')]") 
        login_button.click()
        
        # Wait for redirect to admin dashboard
        wait.until(EC.url_contains("/admin"))
        print("✓ Successfully logged in")
        
        # Navigate to orders page
        print("📋 Navigating to orders page...")
        driver.get("http://localhost:3000/admin/orders")
        
        # Wait for orders table to load
        wait.until(EC.presence_of_element_located((By.xpath, "//table")))
        print("✓ Orders page loaded")
        
        # Find and click the first "Manage" button
        print("🔍 Opening first order for management...")
        manage_buttons = driver.find_elements(By.XPATH, "//button[contains(text(), 'Manage')]")
        if not manage_buttons:
            print("❌ No manage buttons found")
            return
        
        manage_buttons[0].click()
        
        # Wait for dialog to open
        dialog = wait.until(EC.presence_of_element_located((By.xpath, "//div[@role='dialog']")))
        print("✓ Order management dialog opened")
        
        # Find payment status select
        print("💳 Testing payment status update...")
        payment_select = wait.until(EC.element_to_be_clickable((By.xpath, "//label[contains(text(), 'Payment Status')]/following-sibling::div//div[@role='button']")))
        
        # Get current payment status
        current_status = payment_select.text
        print(f"  Current payment status: {current_status}")
        
        # Click to open dropdown
        payment_select.click()
        
        # Wait for dropdown options
        time.sleep(1)
        
        # Select the opposite status
        if current_status == "Paid":
            option = driver.find_element(By.xpath, "//li[contains(text(), 'Unpaid')]")
            new_status = "Unpaid"
        else:
            option = driver.find_element(By.xpath, "//li[contains(text(), 'Paid')]")
            new_status = "Paid"
        
        print(f"  Changing payment status to: {new_status}")
        option.click()
        
        # Wait for the change to be processed
        time.sleep(2)
        
        # Check if dialog closed (indicating successful update)
        try:
            dialog_still_present = driver.find_element(By.xpath, "//div[@role='dialog']")
            if dialog_still_present.is_displayed():
                print("⚠️  Dialog still open - update may have failed")
            else:
                print("✓ Dialog closed - update appears successful")
        except:
            print("✓ Dialog closed - update appears successful")
        
        # Wait a moment for the orders list to refresh
        time.sleep(3)
        
        # Check if the payment status updated in the table
        print("🔍 Verifying payment status in orders table...")
        try:
            # Look for the updated status in the first row
            first_row = driver.find_element(By.xpath, "//tbody/tr[1]")
            payment_status_cell = first_row.find_elements(By.tag_name, "td")[4]  # Payment status column
            updated_status = payment_status_cell.text
            
            print(f"  Payment status in table: {updated_status}")
            
            if new_status.lower() in updated_status.lower():
                print("✅ Payment status update successful!")
            else:
                print("❌ Payment status did not update in the table")
                
        except Exception as e:
            print(f"❌ Error checking payment status in table: {str(e)}")
        
        print("\n🎉 Frontend payment status test completed!")
        
    except Exception as e:
        print(f"❌ Test failed with error: {str(e)}")
        
    finally:
        if 'driver' in locals():
            driver.quit()

if __name__ == "__main__":
    test_frontend_payment_status()
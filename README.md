# PerfumesPlugApp 🌟

A premium e-commerce platform for luxury perfumes built with React and Django. Features a modern dark theme, comprehensive product catalog, shopping cart functionality, and admin management system.

## 🚀 Live Demo

- **Frontend**: Deploy to Vercel
- **Backend**: Deploy to Railway/Heroku

## ✨ Features

### Customer Features
- 🛍️ **Product Catalog**: Browse luxury perfumes with detailed descriptions
- 🔍 **Search & Filter**: Find perfumes by brand, category, price range
- 🛒 **Shopping Cart**: Add/remove items with real-time updates
- 💳 **Secure Checkout**: Multiple payment options
- 📱 **Responsive Design**: Optimized for all devices
- 🌙 **Dark Theme**: Premium aesthetic with gold accents
- 👤 **User Accounts**: Registration, login, profile management
- 📦 **Order Tracking**: View order history and status

### Admin Features
- 📊 **Dashboard**: Sales analytics and key metrics
- 📦 **Product Management**: Add, edit, delete products
- 👥 **User Management**: Customer and admin account control
- 🏷️ **Category Management**: Organize product categories
- 📋 **Order Management**: Process and track orders
- 🔧 **System Settings**: Configure application settings

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI library
- **Redux Toolkit** - State management
- **Material-UI (MUI)** - Component library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Formik & Yup** - Form handling and validation

### Backend
- **Django 4.2** - Web framework
- **Django REST Framework** - API development
- **PostgreSQL** - Database
- **Django CORS Headers** - Cross-origin requests
- **Pillow** - Image processing

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- Python 3.8+
- PostgreSQL (or SQLite for development)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/PerfumesPlugApp.git
   cd PerfumesPlugApp
   ```

2. **Backend Setup**
   ```bash
   # Create virtual environment
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   
   # Install dependencies
   pip install -r requirements.txt
   
   # Run migrations
   python manage.py migrate
   
   # Create superuser
   python manage.py createsuperuser
   
   # Start backend server
   python manage.py runserver
   ```

3. **Frontend Setup**
   ```bash
   # Navigate to client directory
   cd client
   
   # Install dependencies
   npm install
   
   # Start development server
   npm start
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - Admin Panel: http://localhost:8000/admin

## 🌐 Deployment

### Vercel (Frontend)

1. **Prepare for deployment**
   ```bash
   # Run deployment preparation script
   chmod +x deploy.sh
   ./deploy.sh
   ```

2. **Deploy to Vercel**
   - Connect your GitHub repository to Vercel
   - Set root directory to `client`
   - Configure environment variables:
     - `REACT_APP_API_URL`: Your backend URL
   - Deploy automatically on push

3. **Configuration files included**
   - `client/vercel.json` - Vercel deployment configuration
   - `client/.env.example` - Environment variables template

### Backend Deployment Options

#### Railway (Recommended)
```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

#### Heroku
```bash
heroku create your-app-name
heroku config:set DEBUG=False
git push heroku main
```

### 📖 Detailed Deployment Guide
See [DEPLOYMENT.md](./DEPLOYMENT.md) for comprehensive deployment instructions.

## 🔧 Environment Variables

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:8000
```

### Backend
```env
DEBUG=True
SECRET_KEY=your-secret-key
DATABASE_URL=your-database-url
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

## 📁 Project Structure

```
PerfumesPlugApp/
├── client/                 # React frontend
│   ├── public/            # Static files
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── features/      # Redux slices
│   │   ├── pages/         # Page components
│   │   └── utils/         # Utility functions
│   ├── vercel.json        # Vercel configuration
│   └── package.json
├── perfumes/              # Django perfumes app
├── orders/                # Django orders app
├── users/                 # Django users app
├── perfumes_project/      # Django project settings
├── requirements.txt       # Python dependencies
├── manage.py             # Django management script
├── DEPLOYMENT.md         # Deployment guide
└── deploy.sh            # Deployment preparation script
```

## 🧪 Testing

### Frontend Tests
```bash
cd client
npm test
```

### Backend Tests
```bash
python manage.py test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Material-UI for the component library
- Django REST Framework for the robust API
- Vercel for seamless frontend deployment
- Railway for backend hosting

## 📞 Support

For support, email support@perfumesplug.com or create an issue in this repository.

---

**Built with ❤️ for perfume enthusiasts**
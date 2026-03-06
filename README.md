# 🚛 Trucking ELD Route Planner

A full-stack web application for trucking route planning using Hours of Service (HOS) compliance.
Built with Django REST Framework and React.

**Live Demo:** https://trucking-eld-app.vercel.app

---

## 📋 Features

### ✅ Route Planning

- Multi-stop route calculation (Current → Pickup → Drop off)
- Real-time distance and duration calculations
- Interactive map visualization with Mapbox

### ✅ HOS Compliance

- Automatic calculation of required rest stops
- 70-hour/8-day cycle tracking
- 11-hour daily driving limit enforcement
- 14-hour on-duty window tracking
- 30-minute break requirements
- 34-hour reset when cycle limit reached

### ✅ ELD Log Generation

- Official DOT-style Electronic Logging Device sheets
- Multi-day trip support
- Visual duty status timeline (Off Duty, Sleeper, Driving, On Duty)
- Automatic event logging

### ✅ Additional Features

- Fuel stop calculations (every 1,000 miles)
- Rest stop markers on map
- Responsive design
- Professional UI/UX

---

## 🛠️ Tech Stack

### Backend

- **Django 5.x** - Web framework
- **Django REST Framework** - REST API
- **Python 3.13** - Programming language
- **SQLite** - Database
- **Mapbox Directions API** - Route calculation
- **Gunicorn** - WSGI server
- **Django-cors-headers**
- **Python-dotenv requests**

### Frontend

- **React 19** - UI framework
- **Vite** - Build tool
- **Mapbox GL JS** - Interactive maps
- **Axios** - HTTP client
- **HTML5 Canvas** - ELD log rendering

### Deployment

- **Backend:** Render (https://trucking-eld-app.onrender.com)
- **Frontend:** Vercel (https://trucking-eld-app.vercel.app)

---

## 🚀 Getting Started

### Prerequisites

- Python 3.13+
- Node.js 18+
- Mapbox API token (free at https://mapbox.com)

### Backend Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/YOUR_USERNAME/trucking-eld-app.git
   cd trucking-eld-app
   ```

2. **Create virtual environment**

   ```bash
   python -m venv venv
   source venv/Scripts/activate  # Windows Git Bash
   # OR
   source venv/bin/activate       # Mac/Linux
   ```

3. **Install dependencies**

   ```bash
   pip install -r requirements.txt
   ```

4. **Create `.env` file in project root**

   ```
   MAPBOX_ACCESS_TOKEN=your_mapbox_token_here
   DEBUG=True
   ALLOWED_HOSTS=localhost,127.0.0.1
   ```

5. **Run migrations**

   ```bash
   python manage.py migrate
   ```

6. **Start development server**
   ```bash
   python manage.py runserver
   ```

Backend will run at: http://localhost:8000

### Frontend Setup

1. **Navigate to frontend directory**

   ```bash
   cd frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Create `.env.local` file in frontend directory**

   ```
   VITE_API_BASE_URL=http://localhost:8000
   VITE_MAPBOX_TOKEN=your_mapbox_token_here
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

Frontend will run at: http://localhost:5173

---

## 📖 API Documentation

### Base URL

- **Development:** http://localhost:8000
- **Production:** https://trucking-eld-app.onrender.com

### Endpoints

#### Health Check

```
GET /api/trips/health/
```

Response:

```json
{
  "status": "ok",
  "message": "Server is running"
}
```

#### Calculate Trip

```
POST /api/trips/calculate/
```

Request Body:

```json
{
  "current_location": "Los Angeles, CA",
  "pickup_location": "Phoenix, AZ",
  "drop_off_location": "Dallas, TX",
  "current_cycle_used": 25.5
}
```

Response:

```json
{
  "id": 1,
  "current_location": "Los Angeles, CA",
  "pickup_location": "Phoenix, AZ",
  "drop_off_location": "Dallas, TX",
  "current_cycle_used": 25.5,
  "total_distance": 1438.85,
  "total_duration": 21.92,
  "route_data": {
    "geometry": {...},
    "waypoints": [...],
    "available_hours": {...}
  },
  "rest_stops": [...]
}
```

---

## 🎯 HOS Rules Implementation

The application enforces FMCSA Hours of Service regulations:

- **11-Hour Driving Limit:** Maximum 11 hours of driving after 10 consecutive hours off duty
- **14-Hour Limit:** May not drive beyond 14th consecutive hour after coming on duty
- **30-Minute Break:** Required after 8 cumulative hours of driving
- **10-Hour Rest:** Required before starting a new duty period
- **70-Hour/8-Day Limit:** May not drive after 70 hours on duty in 8 consecutive days
- **34-Hour Restart:** Can reset 70-hour clock with 34 consecutive hours off duty

---

## 📦 Project Structure

```
trucking-eld-app/
├── backend/              # Django settings
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── trips/                # Main Django app
│   ├── models.py         # Database models
│   ├── serializers.py    # API serializers
│   ├── views.py          # API endpoints
│   ├── urls.py           # URL routing
│   └── services.py       # Business logic (HOS, Mapbox)
├── frontend/             # React application
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/
│   │   │   ├── Form
│   │   │   ├── Map
│   │   │   ├── Summary
│   │   │   ├── Button
│   │   │   ├── Card
│   │   │   └── ELDLogs.jsx
│   │   ├── utils/
│   │   │   ├── createSingleDayLog
│   │   │   ├── drawELDLog
│   │   │   ├── generateDailyLog
│   │   │   └── helpers
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── manage.py
├── requirements.txt
├── Procfile
└── README.md
```

---

## 🧪 Testing

### Backend Tests

```bash
python manage.py test
```

### Test Scenarios

**Scenario 1: Standard Trip**

- Current: Los Angeles, CA
- Pickup: Phoenix, AZ
- Drop_off: Dallas, TX
- Cycle Used: 25.5 hours
- Expected: 2-day trip with one 10-hour rest

**Scenario 2: Cycle Limit**

- Current: Los Angeles, CA
- Pickup: Phoenix, AZ
- Drop_off: Dallas, TX
- Cycle Used: 66 hours
- Expected: 34-hour reset required

**Scenario 3: Long Haul**

- Current: Los Angeles, CA
- Pick_up: Denver, CO
- Drop_off: New York, NY
- Cycle Used: 0 hours
- Expected: 3-4 day trip with multiple rests

---

## 🚀 Deployment

### Backend (Render)

1. Push code to GitHub
2. Create new Web Service on Render
3. Connect GitHub repository
4. Set environment variables
5. Deploy

### Frontend (Vercel)

1. Push code to GitHub
2. Import project on Vercel
3. Set environment variables
4. Deploy

---

## 🤝 Contributing

This project was built as an assessment for Spotter.ai.

---

## 📝 License

This project is for educational and assessment purposes.

---

## 👤 Author

**Yasira**

- GitHub: [@yasiramus](https://github.com/yasiramus)
- Project: Spotter.ai Full Stack Developer Assessment

---

###### 🙏 Acknowledgments

- Mapbox for mapping services
- FMCSA for HOS regulations documentation
- Spotter.ai for the assessment opportunity

---

## 📞 Support

For questions or issues, please open an issue on GitHub.

---

**Built with ❤️ for the Spotter.ai Assessment**

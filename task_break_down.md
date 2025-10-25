# What Yasira needs to learn (Express.js equivalents):

- Models (like Mongoose schemas)
- Serializers (like body parsing/validation)
- Views/ViewSets (like Express routes/controllers)
- URLs (like Express routing)

```

**Frontend - React** (She already knows this! ✅)

**Mapping - Free APIs**:
- **Mapbox** (generous free tier) - RECOMMENDED
- Google Maps (limited free tier)

**Deployment**:
- Backend: Railway.app or Render (free tier)
- Frontend: Vercel

---

## Day-by-Day Battle Plan

### **Day 1 (Today - Friday, Oct 24)** - Backend Foundation
**Goals**: Django setup + Core logic

**Morning (4 hours)**:
1. Django project setup (1 hour)
2. Understand ELD rules thoroughly (1 hour)
3. Create models for Trip/Route (1 hour)
4. Basic route calculation logic (1 hour)

**Afternoon (4 hours)**:
1. Integrate routing API (Mapbox Directions API)
2. Implement HOS calculation algorithm
3. Calculate required rest stops

### **Day 2 (Saturday, Oct 25)** - ELD Log Generation
**Goals**: Generate proper ELD logs

**Tasks (6-8 hours)**:
1. Research ELD log sheet format (official DOT format)
2. Implement log drawing logic (Canvas or PDF generation)
3. Calculate duty status changes
4. Create API endpoints
5. Test calculations thoroughly

### **Day 3 (Sunday, Oct 26)** - Frontend + Integration
**Goals**: React UI + Connect everything

**Tasks (6-8 hours)**:
1. React form for inputs (2 hours)
2. Map display with route (2 hours)
3. Display ELD logs (2 hours)
4. Styling and UX polish (2 hours)

### **Day 4 (Monday, Oct 27)** - Deploy + Video
**Goals**: Ship it!

**Tasks (4-6 hours)**:
1. Deployment (2 hours)
2. Bug fixes (1-2 hours)
3. Loom video recording (1 hour)
4. Submit!

---

## Technical Architecture I Recommend
```

Frontend (React + Vite)
├── Input Form (location inputs, current cycle hours)
├── Map Display (Mapbox GL JS)
└── ELD Log Display (Canvas/PDF viewer)

Backend (Django REST)
├── Route Calculation Service
│ ├── Call Mapbox Directions API
│ ├── Calculate total distance/time
│ └── Determine fuel stops
├── HOS Compliance Service
│ ├── Calculate available hours
│ ├── Determine required breaks
│ └── Insert rest stops into route
└── ELD Log Generator
├── Generate log sheets
└── Draw duty status lines

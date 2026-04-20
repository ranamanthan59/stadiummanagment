# StadiumPro: Smart Stadium Management System 🏟️

Welcome to **StadiumPro**, an advanced cloud-based solution designed to transform the attendee experience at large-scale sporting and entertainment venues. This project was built for a high-stakes hackathon to solve real-world challenges like crowd congestion, long waiting times, and safety risks.

## 🚀 Live Features

### 1. Smart Crowd Management
- **Real-time Density Tracking:** Monitors attendance across various stadium zones (North Stand, VIP Lounge, etc.).
- **Visual Analytics:** Heatmaps and bar charts in the Admin Dashboard show which areas are reaching peak capacity.
- **Dynamic Status:** Automatically flags zones as 'Normal', 'Crowded', or 'Overcrowded' based on live data.

### 2. Queue Optimization
- **Live Wait Times:** Calculates waiting times for food stalls, washrooms, and gates using the formula: `waiting_time = people_in_queue × average_service_time`.
- **Intelligent Recommendations:** Suggests the "Least Busy" facilities to users to balance load across the stadium.
- **Service Point Analytics:** Admins can monitor which stalls are underperforming or overwhelmed.

### 3. Safety & Emergency System
- **Congestion Alerts:** Triggers automatic notifications when a zone exceeds 90% capacity.
- **Emergency Communication:** Push-style notifications in the attendee app for immediate broadcast of safety instructions.

### 4. Admin Control Center
- **Simulation Engine:** A built-in data simulator that mimics real-time crowd movement and queue fluctuations.
- **Centralized Monitoring:** Single pane of glass for all stadium operations.

---

## 🛠️ Technical Stack

- **Frontend:** Next.js 14, React, Tailwind CSS, Recharts, Framer Motion, Lucide Icons.
- **Backend:** Next.js API Routes (Serverless), Node.js.
- **Database:** MongoDB (with Mongoose ODM).
- **Data Fetching:** SWR (for efficient real-time polling).

---

## 📂 Project Structure

```text
src/
├── app/
│   ├── admin/          # Admin Dashboard view
│   ├── api/            # Backend REST API endpoints
│   │   ├── facilities/ # Facility management
│   │   ├── notifications/# Alerts and announcements
│   │   ├── simulate/   # Data simulation engine
│   │   └── zones/      # Crowd density data
│   ├── layout.tsx      # Global layout
│   └── page.tsx        # Attendee Mobile App view
├── components/         # Reusable UI components
├── lib/                # Database connection utilities
└── models/             # Mongoose schemas (Zone, Facility, Notification)
```

---

## 📡 API Documentation

### Zones
- `GET /api/zones`: Fetch all stadium zones and their current crowd status.
- `POST /api/zones`: Create or update a zone.

### Facilities
- `GET /api/facilities`: Get list of stalls, washrooms, and gates with queue data.
- `POST /api/facilities`: Register a new facility.

### Notifications
- `GET /api/notifications`: Get active alerts and announcements.
- `POST /api/notifications`: Broadcast a new message.

### Simulation
- `POST /api/simulate`: Trigger a random data update to simulate a live event.

---

## 🌍 Real-World Impact

1. **Safety:** Prevents stampedes and dangerous overcrowding by actively monitoring density and alerting staff/fans before critical levels are reached.
2. **Efficiency:** Reduces "dead time" for fans in queues, leading to higher customer satisfaction and increased revenue for vendors.
3. **Operational Excellence:** Provides stadium managers with data-driven insights to better allocate staff and security resources.

---

## 🚀 Deployment Steps

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd smartcrwoudmenagementsystem
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment:**
   Create a `.env.local` file and add your MongoDB URI:
   ```env
   MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/stadium
   ```

4. **Run locally:**
   ```bash
   npm run dev
   ```

5. **Deploy to Vercel:**
   Push to GitHub and connect your repository to Vercel. Don't forget to add the `MONGODB_URI` in Vercel's Environment Variables.

---

**Built with ❤️ for the Hackathon.**
"# stadiummanagment" 

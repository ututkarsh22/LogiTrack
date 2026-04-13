LogiTrack

A backend system for managing shipment tracking and delivery updates.

📌 Features
User and admin authentication (JWT-based)
Order creation and shipment tracking
Role-based access control (Admin/User)
OTP verification for secure pickup and delivery
RESTful APIs for managing orders and tracking
Basic structure for scalable backend design

🛠️ Tech Stack
Node.js
Express.js
MongoDB
JWT Authentication

🔐 Authentication
Users can register and login
JWT is used to protect routes
Admin and user roles are handled separately

📦 OTP Verification
OTP is generated for pickup and delivery confirmation
Stored temporarily in database with expiry
Ensures secure order handling

📡 API Overview

Some main APIs:

Create Order
Track Order
Update Order Status
User Login / Register
OTP Verification

🚀 Future Improvements
Redis caching for faster tracking requests
Real-time updates using events or sockets
Better scalability for handling high traffic

▶️ Run Locally
git clone https://github.com/ututkarsh22/LogiTrack.git
cd logitrack
npm install
npm start

📌 Note
This project is currently in progress and focused on improving backend scalability and performance.

👨‍💻 Author
Utkarsh Trivedi(Backend), Aditya Verma(Frontend)

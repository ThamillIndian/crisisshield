# **AI-Powered Crisis Coordination System**

## **Problem Statement**

In hospitality venues (such as hotels), emergencies like **fire, medical, and security threats** often lead to chaos due to fragmented communication between guests, staff, and responders. During critical incidents, the **lack of real-time coordination** results in **delays** and **increased risks**. Guests are unsure where to go, and staff members are often overwhelmed with manual coordination. This causes the situation to escalate unnecessarily.

**Core Problem:**  
> "Crisis situations in hospitality environments are mishandled due to poor communication, delayed actions, and lack of coordinated response, leading to higher risk for guests and staff."

---

## **Optimized Solution**

### **Solution Overview**

We propose an **AI-powered multi-agent crisis coordination system** that detects incidents, classifies them in real-time, assigns roles to staff, and guides guests and responders with **dynamic, real-time updates**. The system uses AI-powered agents for decision-making, ensuring an **automated, fast, and coordinated response** to emergencies.

### **Key Features of the System:**

1. **Real-Time Crisis Detection and Classification:**
   - Guests can report emergencies using **panic buttons**, **voice input**, or **text reports**.
   - The system automatically **classifies** the crisis (e.g., fire, medical, security threat) using **Gemini AI**.
   
2. **Dynamic Evacuation Routing:**
   - The system generates **dynamic evacuation routes** based on real-time incident data, rerouting guests if exits become blocked or unsafe due to the emergency.

3. **Task Assignment and Role-Based Communication:**
   - The system assigns tasks to **staff members** based on their roles (e.g., security, floor managers, medical staff).
   - Different messages are sent to **guests** and **staff** to ensure clear, role-specific instructions.

4. **Live Incident Dashboard:**
   - The **command center** dashboard shows real-time updates of the crisis status, progress of evacuations, and task completion.

5. **Post-Incident Review and Reporting:**
   - After the incident, the system generates a **detailed report** on the response actions, timeline, and areas for improvement.

---

## **Hackathon Strategy**

### **SDG Mapping**

We align this solution with the **UN Sustainable Development Goals (SDG)** as follows:

- **Primary SDG:** **SDG 11 – Sustainable Cities and Communities**  
  This SDG focuses on creating **resilient infrastructure** and promoting **safe and sustainable cities**. Our system provides **emergency response optimization** for hospitality venues, reducing risks in urban areas.
  
- **Secondary SDG:** **SDG 3 – Good Health and Well-Being**  
  This SDG promotes ensuring **good health** for all, at all ages. The system is designed to handle medical emergencies efficiently, ensuring **faster response times** and saving lives.

---

### **Google Tech Stack Usage**

For this project, we’ve utilized the following **Google technologies** to meet the hackathon’s criteria and ensure scalability:

1. **Gemini 3 API / Vertex AI**:  
   Used for **incident classification** (Fire, Medical, Security threats). Gemini provides the machine learning backbone for classifying crisis situations based on real-time input from guests or sensors.
   
2. **Firebase**:  
   - **Firebase Authentication** is used to handle **role-based logins** (admin, staff, guest).
   - **Firebase Firestore** is used for **real-time data syncing** (incident state, task assignments, logs, and status updates).
   - **Firebase Cloud Messaging (FCM)** sends **notifications** to guests and staff based on roles and incidents.

3. **Google Cloud Run**:  
   Deployed the **FastAPI backend** for **incident handling** and **agent orchestration**. Google Cloud Run provides a scalable solution to run the backend without needing to manage infrastructure manually.

4. **Google Maps Platform** (Optional):  
   Only if required for advanced **floor map visualization** or **evacuation routing**. We can use custom graphs for floors and exits, or Google Maps if routing becomes complex.

---

### **App Workflow and Architecture**

#### **1. Incident Reporting**

- **Guest Interface**:  
   - Guests can report an incident using a **panic button**, **text input**, or **voice input**. 
   - All incidents are sent to the backend where **AI agents** handle them.

#### **2. AI Crisis Classification and Severity**

- **Classification Agent**:  
   - AI classifies the incident (e.g., Fire, Medical, Security) and determines the **severity** (Critical, High, Medium, Low).
   - The AI uses **Gemini AI** or **custom-trained models** to interpret user input and classify the incident.

#### **3. Resource Allocation and Task Assignment**

- **Resource Allocation Agent**:  
   - The system assigns tasks to relevant **staff members** based on their roles (Security, Medical, Managers).
   - For instance, **Security Agents** are alerted to secure entrances, and **Medical Personnel** are directed to the injured guests.

#### **4. Dynamic Evacuation Routing**

- **Routing Agent**:  
   - Once a **fire** or **medical emergency** is confirmed, the system calculates the safest evacuation routes for guests.
   - If exits become blocked or compromised, the system dynamically updates routes in real-time using floor data.

#### **5. Role-Based Communication**

- **Communication Agent**:  
   - **Guests**: Receive clear **instructions** on where to go or what to do based on their location (e.g., “Exit A is blocked. Please head towards Exit C”).
   - **Staff**: Receive detailed instructions about tasks (e.g., “Escort Rooms 101–110 to Exit C”).
   - **Admin**: The command center dashboard displays the status of ongoing incidents, staff assignments, and progress.

#### **6. Real-Time Incident Dashboard**

- **Command Center**:  
   - Admin users can see all active incidents, assignments, and real-time status updates, ensuring complete situational awareness.
   - **Metrics** such as response time, evacuation progress, and task completion are displayed in the dashboard.

#### **7. Post-Incident Review**

- **Review and Reporting**:  
   - The system generates a **report** after the incident detailing the response timeline, what worked well, and areas for improvement.
   - This can be used for **training** and improving the future emergency protocols.

---

### **Submission Materials and Demo**

**1. GitHub Repository:**

The GitHub repo will include:
- **README** with setup instructions, tech stack, and architecture diagram
- Clear folder structure
- Code with proper comments
- Demo video (unlisted YouTube link)

**2. Demo Video (120 Seconds):**

The demo video should:
- Show the **incident reporting flow** (guest report via panic button, text, or voice)
- Show **AI classifying** the incident and assigning staff
- Show **real-time updates** and **role-specific notifications**
- Display **dynamic evacuation routing** and dashboard updates
- Demonstrate the **before and after** impact of using the system

**3. Evaluation Criteria to Focus On:**

- **Impact**: Demonstrating how the app reduces response time, increases safety, and improves communication in emergencies.
- **Technology**: Clearly showing how **Google tech** (Gemini, Firebase, Cloud Run) powers the backend and real-time operations.
- **User Feedback**: Integrate feedback into the app to improve clarity and usability for **guests** and **staff**.
- **Scalability**: Demonstrating that the system can be applied to other industries (e.g., malls, campuses, airports).
  
---

### **Final Project Strategy for Success**

1. **Clear Problem & SDG Alignment**:  
   Focus on **SDG 11** (Sustainable Cities and Communities) and **SDG 3** (Good Health and Well-Being) with a direct, impactful solution.

2. **Working Product**:  
   Don’t just aim for features. Focus on delivering a **working system** that solves **real-time crisis coordination**.

3. **Demonstration**:  
   Your demo video should show **before vs after AI** and demonstrate **real-time decision-making** in a crisis, where **time-sensitive decisions** are critical.

4. **Google Tech**:  
   Leverage **Gemini AI** for crisis classification, **Firebase** for notifications, and **Google Cloud Run** for deployment. Show the **Google platform synergy**.

5. **User Feedback**:  
   Incorporate feedback from hotel staff, security, and guests. Show that the app evolves based on **user needs**.

---

## **Tech Stack**

### **Frontend:**
- **Next.js** + **TailwindCSS**: For building a modern and responsive interface for both the **admin dashboard** and **guest/staff notifications**.
- **Leaflet** (or simple floor map): For showing **evacuation routes** and dynamically updating blocked exits.
- **React**: To handle dynamic state changes, e.g., live updates from Firebase or your backend.

### **Backend:**
- **FastAPI**: Lightweight, quick-to-develop backend for handling **AI agent orchestration** and real-time communication.
- **Google Cloud Run**: To deploy and run your backend without managing servers.
- **Firebase**:  
  - **Firebase Authentication** for role-based login (guest, staff, admin)
  - **Firestore** for real-time syncing (incident state, task assignments, logs, etc.)
  - **Firebase Cloud Messaging** for emergency notifications

### **AI/ML:**
- **Gemini API / Vertex AI** for **incident understanding** and **agent reasoning**.
- **Google AI Studio**: For fine-tuning and managing your AI models for more accurate incident classification.

### **Real-Time Sync:**
- **Firebase Realtime Database** or **Firestore** to sync incident states in real-time across all devices (staff, guests, admins).

### **Voice Input (Optional):**
- **Web Speech API** (or Whisper-style integration) for voice-to-text conversion, enabling users to report emergencies hands-free.

### **Deployment & Hosting:**
- **Google Cloud Run** for backend deployment.
- **Vercel/Netlify** for frontend deployment (for a fast, serverless deployment).

---

### **Architecture Diagram**

```plaintext
 +-----------------+       +------------------+       +-------------------+
 |    Guest UI     | <---> |  Firebase Cloud  | <---> |   AI Classification |
 | (Panic Button,  |       |      Functions    |       |    & Orchestration  |
 |  Voice/Text)    |       | (Reports, Tasks)  |       |      Agent         |
 +-----------------+       +------------------+       +-------------------+
                                 ^                                ^
                                 |                                |
                                v                                 v
                       +-------------------+           +---------------------+
                       |   Admin Dashboard |           |   Staff Task Panel  |
                       |  (Incident Status,|           |   (Live Task Update,|
                       |   Task Assignment)|           |     Role-based Msg) |
                       +-------------------+           +---------------------+
                                 ^                                 ^
                                 |                                 |
                                v                                  v
                       +-------------------+              +------------------+
                       |   Firebase Firestore  | <---->  |   Firebase Cloud Messaging  |
                       | (Real-time Data Sync) |         | (Notifications to Staff/Guest) |
                       +-------------------+              +------------------+
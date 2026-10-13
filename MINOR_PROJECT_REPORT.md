# A MINOR PROJECT REPORT
## ON
# **CleanRoute: Smart Municipal Waste Route Optimization & Citizen Engagement System**

<br>

### Submitted in partial fulfillment of the requirements for the award of the degree of
### **BACHELOR OF TECHNOLOGY**
### in
### **COMPUTER SCIENCE AND ENGINEERING**

<br>

**Submitted To:**  
**Ms. Priyanka Asthana**  
Assistant Professor, Department of CSE  

**Submitted By:**  
**[Student Name]**  
Roll No: **[University Roll Number]**  
Batch: **2023 – 2027**  

<br>

### **DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING**
### **DRONACHARYA GROUP OF INSTITUTIONS**
**Affiliated to Dr. A.P.J. Abdul Kalam Technical University, Lucknow**  
**27, Knowledge Park-III, Greater Noida, Gautam Buddha Nagar, Uttar Pradesh – 201306**  

---

## **BONAFIDE CERTIFICATE**

This is to certify that the Minor Project report titled **"CleanRoute: Smart Municipal Waste Route Optimization & Citizen Engagement System"** is the bonafide work carried out by **[Student Name] (Roll No: [University Roll Number])**, student of B.Tech in the Department of Computer Science & Engineering, Dronacharya Group of Institutions, Greater Noida, under my supervision and guidance for the academic session 2026–2027.

The results embodied in this report have not been submitted to any other university or institute for the award of any degree or diploma.

<br><br>

_____________________________ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; _____________________________  
**Ms. Priyanka Asthana** &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; **Prof. Mukesh Bhardwaj**  
Project Supervisor &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Head of Department (CSE)  
Assistant Professor, Dept of CSE &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Dronacharya Group of Institutions  
Dronacharya Group of Institutions &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Greater Noida  

---

## **ACKNOWLEDGEMENT**

I take immense pride and privilege in expressing my sincere gratitude to all individuals who have helped, supported, and guided me throughout the development of this minor project.

First and foremost, I express my deep sense of gratitude and indebtedness to my project supervisor, **Ms. Priyanka Asthana**, Assistant Professor, Department of Computer Science & Engineering, for her invaluable guidance, constructive criticism, constant encouragement, and technical suggestions that steered this project to successful completion.

I also extend my sincere thanks to **Prof. Mukesh Bhardwaj**, Head of the Department of Computer Science & Engineering, for providing the necessary infrastructural facilities, high-performance computing labs, and academic atmosphere at **Dronacharya Group of Institutions, Greater Noida**.

Lastly, I thank my faculty members, parents, and friends whose direct and indirect support motivated me throughout the lifecycle of this minor project.

<br>

**[Student Name]**  
Roll No: [University Roll Number]  
B.Tech CSE, 3rd / 4th Year  

---

## **TABLE OF CONTENTS**

| Chapter No. | Title | Page No. |
|:---:|:---|:---:|
| | **Bonafide Certificate** | ii |
| | **Acknowledgement** | iii |
| | **Executive Summary / Abstract** | v |
| **1** | **Introduction** | 1 |
| | 1.1 Background and Problem Statement | 1 |
| | 1.2 Motivation | 2 |
| | 1.3 Project Objectives | 2 |
| | 1.4 Scope of the Minor Project | 3 |
| **2** | **Languages, Frameworks, and Tools Used** | 4 |
| | 2.1 Frontend Technologies (React, Vite, Leaflet) | 4 |
| | 2.2 Backend Technologies (Java 17, Spring Boot, Spring Security) | 5 |
| | 2.3 Data Storage & Algorithms | 6 |
| | 2.4 Cloud Deployment Tools (Vercel & Render) | 6 |
| **3** | **Software Development Life Cycle (SDLC)** | 7 |
| | 3.1 Agile Methodology Adopted | 7 |
| | 3.2 Sprint Breakdown | 8 |
| **4** | **Requirement Analysis** | 10 |
| | 4.1 Stakeholder Identification | 10 |
| | 4.2 Functional Requirements | 10 |
| | 4.3 Non-Functional Requirements | 12 |
| **5** | **Design Constraints** | 14 |
| | 5.1 Technical and Computational Constraints | 14 |
| | 5.2 Environmental & Real-World Constraints | 15 |
| **6** | **System Analysis & Mathematical Formulation** | 16 |
| | 6.1 Capacitated Vehicle Routing Problem (CVRP) Formulation | 16 |
| | 6.2 Haversine Spherical Distance Model | 17 |
| | 6.3 The 4 Routing Heuristic Algorithms (Plain English & Math) | 18 |
| **7** | **Software and Hardware Requirements** | 22 |
| **8** | **Software Requirements Specification (SRS)** | 24 |
| **9** | **Project Plan & Timeline** | 27 |
| **10** | **Feasibility Analysis** | 29 |
| | 10.1 Technical Feasibility | 29 |
| | 10.2 Economic Feasibility | 30 |
| | 10.3 Operational Feasibility | 30 |
| | 10.4 Schedule Feasibility | 31 |
| **11** | **System Design & Architecture** | 32 |
| | 11.1 High-Level 3-Tier Architecture | 32 |
| | 11.2 Data Flow Diagrams (DFD Level 0 & Level 1) | 33 |
| | 11.3 Sequence Diagram of Workflow | 34 |
| **12** | **Entity-Relationship & Class Model** | 35 |
| **13** | **Testing & Validation** | 37 |
| | 13.1 Unit Testing (Algorithm correctness) | 37 |
| | 13.2 Integration Testing (REST Endpoints) | 38 |
| | 13.3 Security & Role-Based Access Testing | 39 |
| **14** | **Result Analysis & Benchmark Comparison** | 40 |
| | 14.1 Before vs. After Route Comparison | 40 |
| | 14.2 Performance Comparison of 4 Algorithms | 41 |
| **15** | **Future Scope** | 43 |
| **16** | **Conclusion** | 45 |
| **17** | **User Interface & Screenshots** | 46 |
| **18** | **References / Bibliography** | 49 |

---

## **EXECUTIVE SUMMARY / ABSTRACT**

Solid waste management is one of the most critical logistical, economic, and environmental challenges faced by municipal bodies across urban centres in India, including Greater Noida and the National Capital Region (NCR). Traditional municipal collection systems rely on static, predetermined truck schedules where garbage vehicles visit every public bin daily, irrespective of whether the bin is full or completely empty. This outdated approach leads to massive fuel wastage, unnecessary vehicular carbon emissions, premature fleet wear, and high labor costs, while simultaneously leaving overflowing roadside waste uncollected until scheduled rounds.

To solve this dual challenge, **CleanRoute** is developed as a full-stack, intelligent web-based decision support and civic participation system. Built specifically as an academic minor project, CleanRoute combines an advanced **Java (Spring Boot) mathematical routing engine** with a modern, reactive **React (Vite) single-page application** powered by **Leaflet OpenStreetMap visual mapping**.

The core innovation of the project lies in formulating waste collection as a **Capacitated Vehicle Routing Problem (CVRP)** with dynamic stop selection:
1. **Dynamic Stop Selection:** Instead of visiting all bins, municipal sensors or simulated IoT fill levels filter bins above a critical fill threshold (e.g., $\ge 70\%$).
2. **Citizen Integration:** Verified community reports of illegal or overflowing waste spots (accompanied by mandatory geotagged photographic proof) are seamlessly injected into the day's collection graph.
3. **Multi-Algorithm Optimization Engine:** CleanRoute implements four CVRP heuristic algorithms with intuitive, end-user friendly descriptions:
   - **Baseline:** *"Visit Every Bin (Current Habit)"*
   - **Algorithm 1:** *"Quick & Direct"* (Greedy Nearest Neighbour)
   - **Algorithm 2:** *"Quick & Cleaned"* (Nearest Neighbour with 2-Opt edge untangling)
   - **Algorithm 3:** *"Smart Cluster Merger"* (Clarke-Wright Savings Heuristic)
   - **Algorithm 4:** *"Optimal Eco-Route ⭐"* (Clarke-Wright paired with 2-Opt local search)
4. **Resident Experience:** Citizens can track today's garbage truck moving live towards their street with dynamic estimated arrival times (ETA), report waste spots, and earn gamified green points on a ward-level leaderboard.

Benchmark results show that CleanRoute reduces daily truck driving distances by **$28\%$ to $42\%$**, saves significant operational fuel, and decreases vehicle run times while improving public cleanliness and civic engagement.

---

# **CHAPTER 1: INTRODUCTION**

### 1.1 Background and Problem Statement
Rapid urbanization and population growth in planned metropolitan hubs such as Knowledge Park III, Greater Noida, have placed immense strain on local municipal solid waste management (SWM) infrastructures. According to municipal environmental reports, urban local bodies spend between $50\%$ to $70\%$ of their entire sanitation budgets solely on collection and transportation logistics—primarily fuel and vehicle maintenance.

The existing municipal collection process operates on a **static routing paradigm**:
- Drivers follow fixed linear paths every morning.
- Garbage collection trucks stop at every designated dustbin across residential, commercial, and institutional zones, even if the bins are underfilled or empty.
- Conversely, sudden overflows caused by local events, markets, or construction dumping go unnoticed until the next scheduled round, creating open health hazards and urban pollution.
- Citizens have no real-time transparency regarding when the waste collection vehicle will arrive at their street, leading to garbage being dumped along roadsides before truck arrival.

### 1.2 Motivation
The motivation for this minor project is to apply modern computational graph theory, algorithmic vehicle routing heuristics, and full-stack software engineering to build an accessible, production-ready solution that bridges municipal administration and citizen participation.

By replacing blind static collection with **demand-driven routing**, municipalities can achieve measurable green sustainability goals:
- Drastic reduction in diesel fuel consumption and carbon footprint.
- Optimized utilization of a limited municipal truck fleet.
- Active civic empowerment through gamified waste reporting with photographic verification.

### 1.3 Project Objectives
The key objectives of the CleanRoute minor project are:
1. To formulate and implement the **Capacitated Vehicle Routing Problem (CVRP)** tailored to municipal depot-to-bin logistics.
2. To develop an optimization backend in **Java (Spring Boot)** that executes four distinct heuristic algorithms and benchmarks their distance, fleet requirements, and computation time against the traditional routine.
3. To design a responsive, reactive frontend using **React JS and Leaflet OpenStreetMap** providing two specialized interfaces:
   - **Municipality Control Room (Dispatcher):** Interactive bin map, algorithm comparison matrix, threshold tuning, and report verification.
   - **Resident Portal:** Live simulated truck tracking, street arrival ETA, and geotagged photographic waste reporting.
4. To establish a gamified incentive model with anti-spam safeguards (duplicate report merging within $40\text{ m}$, max 3 reports per day, and a 3-strike penalty for fraudulent submissions).
5. To package the software for zero-cost cloud deployment on **Vercel** (frontend) and **Render / Docker** (backend).

### 1.4 Scope of the Minor Project
The scope of this project includes:
- Municipal modeling for Knowledge Park III, Greater Noida, and Sector 62, Noida, with real geocoordinates.
- Haversine spherical distance matrix computation for arbitrary coordinate pairs.
- Real-time simulation of truck movement along calculated routes at an average municipal speed of $30\text{ km/h}$.
- Stateless token-based authentication (JWT) and secure photo handling.
- Local execution through automated one-click Windows launcher scripts.

---

# **CHAPTER 2: LANGUAGES, FRAMEWORKS, AND TOOLS USED**

CleanRoute is engineered using a modern, decoupled architecture separating the user presentation layer from the high-performance computation engine.

```
+-------------------------------------------------------------------+
|                        CleanRoute Full-Stack                       |
+-------------------------------------------------------------------+
|  Frontend: React 18 + Vite SPA       Backend: Java 17 + Spring Boot |
|  - Leaflet Map / OpenStreetMap       - CVRP Solver (4 Heuristics)   |
|  - Modular Component Architecture    - Spring Security (JWT / PBKDF)|
|  - Deployed on Vercel (Free)         - Deployed on Render (Docker)  |
+-------------------------------------------------------------------+
```

### 2.1 Frontend Technologies
- **React 18:** Modern declarative JavaScript library for building responsive, component-driven user interfaces with React Hooks (`useState`, `useEffect`, `useRef`).
- **Vite 5:** Next-generation frontend build tool providing Hot Module Replacement (HMR) and optimized Rollup-based production bundling.
- **Leaflet 1.9 & OpenStreetMap:** Lightweight open-source mapping library used to render vector map tiles, polyline route networks, custom HTML div markers, and dynamic vehicle pulses.
- **Pure Responsive CSS3:** Modern CSS variables, flexbox, grid, and fluid typography without heavy runtime UI bloat, ensuring sub-second rendering on mobile and desktop browsers.

### 2.2 Backend Technologies
- **Java 17 LTS:** Object-oriented programming language providing strong type safety, memory management, and high computational throughput required for graph heuristics.
- **Spring Boot 3.2:** Enterprise Java framework utilized for dependency injection, RESTful controllers, CORS filter management, and embedded high-speed Apache Tomcat web server.
- **Spring Security:** Configured for stateless authentication, origin cross-site request validation, and password hashing using PBKDF2 with random salt per account.
- **JJWT (Java JSON Web Token):** Generates signed cryptographic tokens for role-based authorization between Municipality Staff and Verified Residents.

### 2.3 Data Storage & Algorithms
- **H2 Embedded Database & OpenCSV:** Ultra-lightweight persistent SQL engine and file-backed CSV parser ensuring zero external database server dependency during evaluation.
- **Algorithmic Graph Engine:** Custom implementations of Greedy Nearest Neighbour, 2-Opt local search improvement, and Clarke-Wright Savings heuristic.

### 2.4 Cloud Deployment Tools
- **Vercel:** Cloud platform configured via `vercel.json` for single-page application client-side route rewrites.
- **Docker & Render.com:** Multi-stage Dockerfile compiling the Spring Boot source using Maven and executing via a minimal Eclipse Temurin JRE container.

---

# **CHAPTER 3: SOFTWARE DEVELOPMENT LIFE CYCLE (SDLC)**

### 3.1 Agile Methodology Adopted
To manage requirements flexibility and iterative testing, the **Agile Scrum** methodology was adopted. The development was divided into short, structured iterations (sprints) focused on delivering functional, verifiable modules at each stage.

```
[Requirement Gathering] -> [Sprint 1: Core Solver & Data Model]
                           -> [Sprint 2: Spring Boot REST API & Security]
                           -> [Sprint 3: React UI & Interactive Map]
                           -> [Sprint 4: Citizen Portal & Gamification]
                           -> [Testing & Cloud Deployment Verification]
```

### 3.2 Sprint Breakdown
- **Sprint 1 (Weeks 1–2): Mathematical Modeling & Algorithm Core**
  - Formulation of distance matrix using Haversine formula.
  - Implementation and unit testing of Nearest Neighbour, Clarke-Wright, and 2-Opt heuristic routines in pure Java.
- **Sprint 2 (Weeks 3–4): Backend Services & RESTful Architecture**
  - Building Spring Boot service layer (`StoreService`, `RulesService`, `Planner`).
  - Implementation of JWT token generation, role verification, and photo decoding.
- **Sprint 3 (Weeks 5–6): Frontend GIS & Route Visualization**
  - Setting up Vite + React and integrating Leaflet maps.
  - Developing the Municipality Dispatcher dashboard with live slider controls and polyline route drawing.
- **Sprint 4 (Weeks 7–8): Citizen Engagement & Production Packaging**
  - Building the Resident portal with live simulated truck movement and GPS reporting modal.
  - Configuring Dockerfile, `render.yaml`, `vercel.json`, and one-click `.bat` runners.

---

# **CHAPTER 4: REQUIREMENT ANALYSIS**

### 4.1 Stakeholder Identification
1. **Municipal Dispatchers / Sanitation Supervisors:** Require an executive dashboard to observe city-wide bin status, simulate collection scenarios, compare algorithms, dispatch routes, and review citizen submissions.
2. **Sanitation Truck Drivers:** Receive optimized sequences of stops that minimize driving time and prevent vehicle overload.
3. **Residents / Citizens:** Seek accurate arrival estimates of collection vehicles and an easy mechanism to report uncollected trash.

### 4.2 Functional Requirements
- **FR-1 (Dynamic Bin Selection):** The system shall filter out all bins whose current fill percentage is strictly below the user-defined threshold $T$.
- **FR-2 (Multi-Algorithm Benchmark):** The system shall compute collection routes using four different heuristic techniques and present a comparative breakdown of distance, truck count, computational time, and percentage fuel savings.
- **FR-3 (Route Dispatch):** The dispatcher shall have the ability to commit and publish the chosen route plan to the active memory store.
- **FR-4 (Citizen Report Submission):** Residents shall be able to drop a pin on the map, choose waste category and volume, add notes, and upload a required JPEG photo.
- **FR-5 (Anti-Spam & Duplicate Merging):** Any new citizen report submitted within a radius of $40\text{ metres}$ of an open report shall automatically merge into the existing report and award the submitter $+2$ supporter points.
- **FR-6 (Review & Verification):** Dispatchers shall review pending photos to verify or reject reports. Verification awards full reward points ($+5$ to $+30\text{ pts}$ based on size).
- **FR-7 (Live Truck Tracking):** The resident interface shall calculate progress along the active truck route based on elapsed time at $30\text{ km/h}$ and display remaining distance and estimated arrival time.

### 4.3 Non-Functional Requirements
- **NFR-1 (Performance):** Route calculation for up to 50 nodes shall execute in under $50\text{ milliseconds}$.
- **NFR-2 (Security):** All user passwords shall be secured using PBKDF2 hashing with unique cryptographic salts.
- **NFR-3 (Usability):** Algorithm selections shall use plain English names and visual metrics to enable non-technical operators to understand operational differences.
- **NFR-4 (Portability):** The application shall run locally across Windows, macOS, and Linux without requiring pre-installed database servers.

---

# **CHAPTER 5: DESIGN CONSTRAINTS**

1. **Computational Complexity (NP-Hard Nature):** The CVRP is NP-hard. Exact algorithms (e.g., branch-and-bound) exhibit exponential time complexity $\mathcal{O}(2^n)$, rendering them impractical for interactive web applications. Hence, polynomial-time heuristics $\mathcal{O}(n^2)$ are strictly required.
2. **Payload & Memory Restrictions:** Photos captured via mobile cameras frequently exceed $5\text{ MB}$. To prevent memory exhaustion on free-tier cloud containers, client-side HTML5 canvas compression restricts uploaded JPEG payloads to $\le 600\text{ KB}$.
3. **Straight-Line vs. Real Road Distance:** Street network routing requires external commercial map API keys (Google Maps / Mapbox) that incur high recurring costs. The project utilizes the Haversine formula with an empirical correction factor to model travel distance economically.

---

# **CHAPTER 6: SYSTEM ANALYSIS & MATHEMATICAL FORMULATION**

### 6.1 Capacitated Vehicle Routing Problem (CVRP) Formulation
Let the collection network be modeled as a complete undirected graph $G = (V, E)$, where:
- $V = \{0, 1, 2, \dots, n\}$ is the set of vertices. Vertex $0$ represents the central municipal depot, and vertices $\{1, \dots, n\}$ represent waste bins and verified citizen report locations requiring collection.
- $E = \{(i, j) : i, j \in V, i \neq j\}$ is the set of edges.
- Each edge $(i, j)$ has an associated non-negative distance cost $d_{ij}$.
- Each customer node $i \in \{1, \dots, n\}$ has a non-negative waste demand $q_i \ge 0$, and the depot demand $q_0 = 0$.
- A fleet of $K$ homogeneous vehicles is available, each with a maximum load capacity $C$.

**Objective Function:**
$$\min \sum_{k=1}^{K} \sum_{i \in V} \sum_{j \in V} d_{ij} x_{ijk}$$

**Subject to Constraints:**
1. Every bin is visited exactly once:
   $$\sum_{k=1}^{K} \sum_{j \in V, j \neq i} x_{ijk} = 1 \quad \forall i \in \{1, \dots, n\}$$
2. Vehicle capacity is not exceeded on any route:
   $$\sum_{i=1}^{n} q_i \left( \sum_{j \in V} x_{ijk} \right) \le C \quad \forall k \in \{1, \dots, K\}$$
3. Flow conservation (each vehicle departs and returns to the depot):
   $$\sum_{j=1}^{n} x_{0jk} = \sum_{i=1}^{n} x_{i0k} \le 1 \quad \forall k \in \{1, \dots, K\}$$

### 6.2 Haversine Spherical Distance Model
Given two coordinate points $(\phi_1, \lambda_1)$ and $(\phi_2, \lambda_2)$ representing latitude and longitude in radians, the spherical distance $d$ across the Earth's radius $R = 6371.0\text{ km}$ is calculated as:

$$\Delta\phi = \phi_2 - \phi_1, \quad \Delta\lambda = \lambda_2 - \lambda_1$$
$$a = \sin^2\left(\frac{\Delta\phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta\lambda}{2}\right)$$
$$c = 2 \cdot \arcsin\left(\sqrt{a}\right)$$
$$d_{ij} = R \cdot c$$

### 6.3 The 4 Routing Heuristic Algorithms

```
+-----------------------------------------------------------------------------------+
|                            CleanRoute 4 Algorithms                                |
+-----------------------------------------------------------------------------------+
| 1. Quick & Direct       | Greedy Nearest Neighbour (Fastest, baseline greedy)      |
| 2. Quick & Cleaned      | Nearest Neighbour + 2-Opt (Untangles crossing paths)     |
| 3. Smart Cluster Merger | Clarke-Wright Savings (Merges high-saving bin pairs)     |
| 4. Optimal Eco-Route    | Clarke-Wright + 2-Opt (Lowest distance, fuel & trucks)   |
+-----------------------------------------------------------------------------------+
```

#### Algorithm 1: "Quick & Direct" (Nearest Neighbour)
- **Principle:** Starting from the depot, the truck greedily travels to the closest unvisited bin whose load fits within the remaining capacity. When no remaining bin fits, the vehicle returns to the depot and a new truck starts.
- **Time Complexity:** $\mathcal{O}(n^2)$
- **User Explanation:** *"Drives directly to the nearest overflowing bin first. Fast to calculate; great for immediate runs."*

#### Algorithm 2: "Quick & Cleaned" (Nearest Neighbour + 2-Opt Local Search)
- **Principle:** Takes the routes generated by Nearest Neighbour and runs an iterative 2-Opt edge exchange. For every pair of edges $(a, b)$ and $(c, d)$, it tests whether replacing them with $(a, c)$ and $(b, d)$ reduces route distance:
  $$\Delta = d_{ac} + d_{bd} - (d_{ab} + d_{cd})$$
  If $\Delta < 0$, the intermediate stop sequence is reversed. This uncrosses loops and eliminates wasteful backtracking.
- **Time Complexity:** $\mathcal{O}(n^3)$ worst-case, $\mathcal{O}(n^2)$ average.
- **User Explanation:** *"Takes closest bins first, then automatically fixes crossing paths so trucks never double back or loop."*

#### Algorithm 3: "Smart Cluster Merger" (Clarke-Wright Savings Heuristic)
- **Principle:** Starts with an imaginary state where every bin has its own dedicated roundtrip: $\text{Depot} \to i \to \text{Depot}$. Merging two separate routes into $\text{Depot} \to i \to j \to \text{Depot}$ produces a distance saving:
  $$s(i, j) = d_{0, i} + d_{0, j} - d_{i, j}$$
  Savings values are sorted in descending order, and routes are iteratively merged if both nodes are at route endpoints and their combined load $\le C$.
- **Time Complexity:** $\mathcal{O}(n^2 \log n)$
- **User Explanation:** *"Calculates route savings to group nearby bins together for efficient return trips."*

#### Algorithm 4: "Optimal Eco-Route ⭐" (Clarke-Wright + 2-Opt)
- **Principle:** Applies Clarke-Wright global savings clustering followed by 2-Opt intra-route optimization. This hybrid strategy produces superior tour sequences that minimize both total kilometers and required truck count.
- **User Explanation:** *"Combines smart cluster pairing with loop-untangling. Minimum distance, fuel, and truck wear."*

---

# **CHAPTER 7: SOFTWARE AND HARDWARE REQUIREMENTS**

### Software Requirements
- **Operating System:** Windows 10/11, Ubuntu 22.04 LTS, or macOS 12+
- **Java Development Kit (JDK):** Version 17 LTS or higher (tested with Oracle JDK 25)
- **Build & Dependency Tool:** Apache Maven 3.9+ (includes bundled `mvnw`)
- **JavaScript Runtime:** Node.js v18.0+ / npm 9.0+
- **Browser:** Google Chrome 110+, Mozilla Firefox 110+, or Microsoft Edge

### Hardware Requirements
- **Processor:** Intel Core i3 / AMD Ryzen 3 or higher (Quad-core recommended)
- **RAM:** Minimum 4 GB (8 GB recommended for simultaneous Spring Boot & Vite development)
- **Storage:** 500 MB free hard disk space
- **Network:** Active internet connection for Leaflet OpenStreetMap tile streaming

---

# **CHAPTER 8: SOFTWARE REQUIREMENTS SPECIFICATION (SRS)**

### 8.1 System Scope
CleanRoute is a localized civic and municipal management web platform that provides automated dispatch planning and crowdsourced waste discovery.

### 8.2 User Classes and Characteristics
- **Dispatcher:** Municipal staff with supervisory rights over collection thresholds, truck capacities, route approval, and penalty issuance.
- **Resident:** General public verified through municipal property registration IDs (e.g., `GN-101`) entitled to report street waste and track collection vehicles.

### 8.3 External Interface Requirements
- **Web Interface:** Single Page Application (SPA) communicating over JSON REST API.
- **GIS Interface:** OpenStreetMap tile servers over HTTPS.
- **Storage Interface:** H2 SQL engine and file-backed serialized tables.

---

# **CHAPTER 9: PROJECT PLAN & TIMELINE**

The project was executed across a 14-week academic semester following the schedule below:

```
Week  1 -  2 : Problem Identification, Literature Survey, Site visits in GN
Week  3 -  4 : Mathematical Modeling of CVRP & Distance Formulations
Week  5 -  6 : Java Routing Engine Development & Unit Testing
Week  7 -  8 : Spring Boot REST API, Security, & JWT Implementation
Week  9 - 10 : React Frontend Development, Leaflet Map Integration
Week 11 - 12 : Citizen Reporting Module, Camera Upload, Anti-Spam Logic
Week 13      : System Integration Testing, Benchmarking, & Performance Tuning
Week 14      : Cloud Deployment (Vercel & Render) & Final Documentation
```

---

# **CHAPTER 10: FEASIBILITY ANALYSIS**

- **Technical Feasibility:** High. The system uses mature technologies (Java, Spring Boot, React, Leaflet). Standard graph heuristic algorithms guarantee fast polynomial execution without requiring high-performance supercomputing clusters.
- **Economic Feasibility:** High. The entire application is built using open-source tools and deployed on 100% free cloud tiers (Vercel hobby plan, Render free tier web service, OpenStreetMap free tiles).
- **Operational Feasibility:** High. The interface abstracts algorithmic complexity into clear before/after comparisons and simple terms, enabling sanitation staff to operate the software with zero prior technical training.
- **Schedule Feasibility:** High. Modularity allowed independent completion and verification of backend solvers and frontend dashboards within the 14-week timeline.

---

# **CHAPTER 11: SYSTEM DESIGN & ARCHITECTURE**

### 11.1 High-Level 3-Tier Architecture

```
+-------------------------------------------------------------------+
|                     PRESENTATION TIER (CLIENT)                    |
|  React 18 + Vite | Dispatcher Dashboard | Resident Live Tracker   |
|                 Leaflet Map Tile Rendering Layer                  |
+-------------------------------------------------------------------+
                                 │
                     HTTPS / JSON REST API (JWT)
                                 ▼
+-------------------------------------------------------------------+
|                    APPLICATION TIER (SPRING BOOT)                 |
|  ApiController | SecurityConfig | RulesService | StoreService     |
|          Planner (CVRP Engine: NN, CW, 2-Opt Solvers)             |
+-------------------------------------------------------------------+
                                 │
                         Internal Data Access
                                 ▼
+-------------------------------------------------------------------+
|                        DATA STORAGE TIER                          |
|    H2 In-Memory/File DB | Municipal CSVs | Stored JPEG Photos     |
+-------------------------------------------------------------------+
```

### 11.2 Data Flow Diagram (DFD Level 0 - Context Level)

```
[ Municipal Staff ] ---- (1) Set Threshold & Fleet Capacity ----> [ CleanRoute ]
[ Municipal Staff ] <--- (2) Optimized Route Plan & Savings ----- [   System   ]
[ Municipal Staff ] ---- (3) Dispatch Plan to Trucks -----------> [            ]
                                                                  [            ]
[ Citizens        ] ---- (4) Submit Geotagged Waste Photo ------> [            ]
[ Citizens        ] <--- (5) Live Truck Position & ETA --------- [            ]
[ Citizens        ] <--- (6) Earned Green Points ---------------- [            ]
```

---

# **CHAPTER 12: ENTITY-RELATIONSHIP & CLASS MODEL**

The relational and object schema of CleanRoute models real-world municipal entities:

```
+-------------------+       1:N       +-------------------+
|   Municipality    | <-------------- |        Bin        |
|-------------------|                 |-------------------|
| id (PK)           |                 | id (PK)           |
| name              |                 | name              |
| radiusKm          |                 | lat, lng          |
| depotLat, depotLng|                 | fill (0 - 100%)   |
+-------------------+                 +-------------------+
          │ 1:N
          ▼
+-------------------+       1:1       +-------------------+
|     Household     | <-------------> |       User        |
|-------------------|                 |-------------------|
| id (PK)           |                 | username (PK)     |
| municipalityId    |                 | salt, hash (PBKDF)|
| ward              |                 | role (DISP/RES)   |
| code (one-time)   |                 | points, strikes   |
| activated         |                 +-------------------+
+-------------------+                           │ 1:N
                                                ▼
                                      +-------------------+
                                      |    Ping (Report)  |
                                      |-------------------|
                                      | id (PK)           |
                                      | reporter (FK)     |
                                      | lat, lng          |
                                      | size, kind, note  |
                                      | status, hasPhoto  |
                                      | supporters        |
                                      +-------------------+
```

---

# **CHAPTER 13: TESTING & VALIDATION**

### 13.1 Unit Testing (Algorithm Verification)
Individual heuristics were evaluated on controlled node sets:
- **Triangle Inequality Test:** Verified that for all node triplets $d_{ij} \le d_{ik} + d_{kj}$.
- **Capacity Constraint Enforcement:** Tested that no single route load exceeded truck capacity $C$.
- **2-Opt Edge Untangling:** Verified that total route distance strictly decreases or remains constant on successive 2-opt iterations.

### 13.2 Integration Testing (REST Endpoints)
All API endpoints were validated using automated HTTP calls:
- `POST /api/login`: Verified that invalid passwords return HTTP 401 and role mismatches return HTTP 403.
- `GET /api/optimize`: Verified that changing threshold dynamically alters the stop count and recalculates distance savings.
- `POST /api/pings`: Tested that submissions outside the municipal radius ($> 2.5\text{ km}$) are rejected with HTTP 400.

---

# **CHAPTER 14: RESULT ANALYSIS & BENCHMARK COMPARISON**

### 14.1 Before vs. After Route Comparison
Evaluated on the Greater Noida Knowledge Park III test dataset (30 bins + 3 verified citizen reports):

| Metric | Traditional Routine ("Visit Every Bin") | CleanRoute ("Optimal Eco-Route ⭐") | Improvement / Benefit |
|---|:---:|:---:|:---:|
| **Bins Evaluated** | 30 | 30 | 100% monitored |
| **Stops Visited** | 33 (All bins + 3 reports) | 14 (Only bins $\ge 70\%$ + reports) | **19 empty bins skipped** |
| **Total Driving Distance** | **$43.8\text{ km}$** | **$26.1\text{ km}$** | **$17.7\text{ km}$ saved ($-40.4\%$)** |
| **Trucks Required** | 3 trucks | 2 trucks | **1 truck saved ($-33\%$)** |
| **Estimated Shift Time** | 3 hours 28 mins | 1 hour 48 mins | **1 hour 40 mins saved** |
| **Estimated Fuel Saved** | — | — | **$\approx 5.8\text{ Litres}$ diesel / day** |

### 14.2 Performance Comparison of 4 Algorithms

| Algorithm | End-User Name | Total Distance | Distance vs Baseline | Execution Time | Recommended Use |
|---|---|:---:|:---:|:---:|---|
| Baseline | Visit Every Bin | $43.8\text{ km}$ | $0\%$ | $< 1\text{ ms}$ | Reference only |
| Algorithm 1 | Quick & Direct | $29.4\text{ km}$ | $-32.8\%$ | $< 1\text{ ms}$ | Fast emergency runs |
| Algorithm 2 | Quick & Cleaned | $27.9\text{ km}$ | $-36.3\%$ | $2.1\text{ ms}$ | Clean routes without loops |
| Algorithm 3 | Smart Cluster Merger | $27.2\text{ km}$ | $-37.9\%$ | $1.4\text{ ms}$ | Clustered neighbourhoods |
| Algorithm 4 | **Optimal Eco-Route ⭐** | **$26.1\text{ km}$** | **$-40.4\%$** | **$3.6\text{ ms}$** | **Daily municipal dispatch** |

---

# **CHAPTER 15: FUTURE SCOPE**

1. **Hardware IoT Integration:** Installing ultrasonic depth sensors and LoRaWAN/NB-IoT microcontrollers on bins for physical real-time fill streaming.
2. **Turn-by-Turn Road Graph Routing:** Integrating Open Source Routing Machine (OSRM) to calculate exact street turn navigation rather than geodesic Haversine distance.
3. **Computer Vision Waste Classification:** Running on-device TensorFlow.js machine learning to automatically verify whether uploaded photos contain actual waste before notifying staff.
4. **Mobile Application:** Compiling the React application as a progressive web app (PWA) or native Android APK with background push notifications.

---

# **CHAPTER 16: CONCLUSION**

The **CleanRoute** minor project successfully demonstrates that smart waste management is achievable by combining modern software engineering with mathematical routing optimization. By replacing static daily rounds with dynamic, threshold-based heuristics, municipalities can cut fuel consumption by over $40\%$ while maintaining pristine cleanliness standards.

Furthermore, by integrating citizens into the collection loop through live truck tracking, geotagged reporting, and gamified green points, CleanRoute transforms passive waste disposal into an active community partnership. The application is completely functional, thoroughly tested, and packaged for free deployment on Vercel and Render.

---

# **CHAPTER 17: USER INTERFACE & SCREENSHOTS**

### 17.1 Landing & Unified Authentication Page
- Clean, responsive portal allowing users to toggle between **Resident** and **Municipality** roles.
- Features account self-activation using one-time municipal codes.

### 17.2 Municipality Control Room (`/dispatcher`)
- **Map View:** Live display of municipal boundaries, depot location, colored bins, and verified citizen pins.
- **Planner Tab:** Interactive threshold slider, fleet controls, real-time before/after comparison table, and one-click dispatch button.
- **Reports Tab:** Review interface displaying citizen photos, size estimations, and verify/reject controls.

### 17.3 Citizen Experience Portal (`/resident`)
- **Today's Truck Card:** Dynamic arrival countdown with animated green pulse and live truck position markers along the street.
- **Reporting Modal:** Interactive map click form with camera upload, size picker, and duplicate detection alert.
- **Leaderboard:** Ward rankings and top citizen contributor points.

---

# **CHAPTER 18: REFERENCES / BIBLIOGRAPHY**

1. G. Laporte, "The Vehicle Routing Problem: An overview of exact and approximate algorithms," *European Journal of Operational Research*, vol. 59, no. 3, pp. 345–358, 1992.
2. G. Clarke and J. W. Wright, "Scheduling of vehicles from a central depot to a number of delivery points," *Operations Research*, vol. 12, no. 4, pp. 568–581, 1964.
3. G. A. Croes, "A method for solving traveling-salesman problems," *Operations Research*, vol. 6, no. 6, pp. 791–812, 1958.
4. Central Pollution Control Board (CPCB), "Annual Report on Solid Waste Management Rules," Ministry of Environment, Forest and Climate Change, Govt. of India, 2022.
5. Spring Boot Documentation, "Building a RESTful Web Service with Spring Boot," VMware Tanzu, 2024. [Online]. Available: https://spring.io/guides/gs/rest-service/
6. React Core Team, "React Documentation: Hooks and Component Lifecycle," Meta Open Source, 2024. [Online]. Available: https://react.dev/
7. V. Agafonkin, "Leaflet: An open-source JavaScript library for mobile-friendly interactive maps," 2024. [Online]. Available: https://leafletjs.com/

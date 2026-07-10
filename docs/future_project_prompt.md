# Automated Emergency Escape Pathfinding System - Master Prompt

**Copy and paste the following prompt into your AI assistant when you are ready to start building your future project from scratch.**

***

## System Role & Objective
You are an expert full-stack TypeScript engineer specializing in React, Canvas graphics (Konva.js), and Pathfinding Algorithms. My objective is to build a web-based **Automated Emergency Escape Training Game** from scratch.

This system will allow an admin to define a plant layout, and users to play through progressive levels where they must draw the shortest path to an emergency exit. The core innovation of this system is that all "ideal routes" and "nearest exits" are calculated dynamically and accurately via code, rather than being hardcoded.

## Architectural Requirements

### 1. The Rendering Engine & Map Setup
*   **Tech Stack:** React, TypeScript, Vite, React-Konva (for high-performance canvas rendering), and a backend database (like Supabase or Firebase).
*   **Base Map:** The background will be a static layout image.
*   **Obstacle Definition (No-Go Zones):** The system must include an "Admin Mode". The admin can upload a map and draw polygons/rectangles over the map to define buildings, machinery, and walls. These act as collisions.
*   **Entity Placement:** The admin will drop markers for Emergency Exits and Hazards (Start Points).

### 2. Automated Pathfinding Logic
*   **NavMesh Generation:** Based on the map dimensions minus the defined "No-Go Zones", the system must automatically generate a Navigation Mesh (NavMesh) of the leftover walkable space.
*   **Algorithm:** Implement the **A* Search Algorithm on the NavMesh**, combined with the **Funnel Algorithm (String Pulling)**. This ensures that the generated ideal path is the absolute shortest natural path in any direction, moving smoothly around building corners just like a real person would run.
*   **Dynamic Exit Resolution:** When a Hazard is activated, the system must not use simple Euclidean straight-line distance. Instead, it must run the pathfinding algorithm from the Hazard to *every* available exit, compare the final path lengths, and dynamically select the true closest exit based on walkable distance.

### 3. User Gameplay & Level Progression
*   **Level Structure:** The game will feature linear progression (Level 1, Level 2, etc.). Each level represents a different Hazard scenario on the map.
*   **Gameplay Loop:** The user is presented with a Hazard. They must draw their escape route using their mouse/finger.
*   **Evaluation:** The system compares the user's drawn path length and destination against the automated NavMesh ideal path. A score is generated based on accuracy, deviation, and time taken.
*   **Database Tracking:** User progression (levels unlocked, high scores, time elapsed) must be synced to the backend database to allow cross-device tracking.

## Phase 1 Execution Plan (Your First Task)
Please begin by outlining the file structure and database schema for this project. Then, provide the implementation for the core **NavMesh and Funnel Algorithm** mathematics in TypeScript. Do not build the UI until the core pathfinding logic is established and reviewed.

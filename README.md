# Underground Water Pump and Water Quality Monitoring System

The **Underground Water Pump and Water Quality Monitoring System** is an IoT-enabled automated water extraction and monitoring system built around an **ESP32 microcontroller**. The system is designed to automatically detect underground water availability, control an underwater pump, monitor water quality, and provide real-time system information through a **web-based dashboard developed using React**.

A **water-level sensor** continuously monitors the availability and level of underground water. When the sensor detects that the water level is above the predefined operating threshold, the ESP32 activates the underwater pump through a **relay module**. The pump extracts water until the water level reaches the configured lower limit. Once the water falls below this limit, the ESP32 automatically switches the pump off. This automated control minimizes manual intervention and helps prevent the pump from operating when sufficient water is unavailable.

The system also incorporates a **TDS (Total Dissolved Solids) sensor** to continuously assess the quality of the extracted water. The sensor measures the concentration of dissolved substances and provides a TDS value that can be used to categorize and monitor water quality. The system can track changes in TDS values over time and identify abnormal readings.

The **ESP32 acts as the central control and communication unit**, processing sensor readings, controlling the pump, and transmitting system information to the web application. An **SMPS (Switched-Mode Power Supply)** provides the required power to the electronic components and pumping system. A **relay module** provides controlled switching and electrical isolation between the low-voltage ESP32 circuitry and the higher-power underwater pump.

## Web-Based Monitoring and Control

A major component of the project is a **React-based web dashboard** that allows users to monitor the complete system remotely. The ESP32 communicates sensor and operational data to the backend, which makes the information available to the React frontend.

The dashboard can provide the following monitoring features:

* **Real-time water-level monitoring** – Displays the current water availability/level and its status.
* **Pump status** – Shows whether the underwater pump is currently ON or OFF.
* **Automatic pump-state monitoring** – Displays why the pump was activated or stopped based on the configured water-level thresholds.
* **TDS monitoring** – Displays the current TDS value and corresponding water-quality status.
* **Historical TDS data** – Provides graphs showing changes in water quality over time.
* **Water-level history** – Displays historical water-level measurements and trends.
* **Pump activity history** – Records pump start/stop events and operating duration.
* **Threshold configuration** – Allows authorized users to configure water-level and TDS thresholds.
* **Alerts and notifications** – Generates alerts for critically low water levels, abnormal TDS values, sensor failures, or other system abnormalities.
* **System health monitoring** – Displays ESP32 connectivity, sensor availability, communication status, and other device-health information.
* **Power/system status** – Provides information about the operational state of the connected hardware.
* **Data logging** – Stores sensor readings and pump events for later analysis.
* **Dashboard analytics** – Provides charts and summaries for water consumption/extraction patterns, pump usage, water-level trends, and TDS variations.
* **Remote monitoring** – Enables users to observe the system from a computer or mobile browser without physically accessing the pumping system.

The dashboard can be designed with **React** as the frontend, providing a responsive interface with real-time readings, charts, status indicators, alerts, and historical analytics.

## Overall System Architecture

The system follows an **IoT-based architecture**:

**Water-Level Sensor + TDS Sensor → ESP32 → Backend/Communication Layer → React Web Dashboard**

At the same time:

**ESP32 → Relay → Underwater Pump**

The ESP32 continuously collects sensor data and makes local decisions regarding pump operation. The sensor data and operational events are transmitted to the backend for storage and monitoring. The React dashboard retrieves this information and presents it to the user in an intuitive interface.

This project therefore combines **embedded systems, IoT, real-time monitoring, sensor-based automation, motor control, electrical isolation, web development, data logging, and visualization** into a single integrated system. It provides both **local autonomous control through the ESP32** and **remote system visibility through the React web application**, making it suitable as a practical smart-water-management solution.

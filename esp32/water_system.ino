#include <WiFi.h>
#include <WebServer.h>

// ---------------------------------------------------------
// HARDWARE PIN DEFINITIONS
// ---------------------------------------------------------
const int WATER_LEVEL_PIN = 36;  // HW-038 water level sensor (Analog)
const int TDS_PIN = 34;          // TDS sensor (Analog)
const int CONTROL_PIN = 23;      // Water pump relay (Active LOW)
const int SOLENOID_PIN = 22;     // Solenoid valve relay (Active LOW)
const int BUTTON_PIN = 21;       // Push button for dispensing water

const int GOOD_WATER_PIN = 25;   // LED for GOOD water quality
const int MEDIUM_WATER_PIN = 26; // LED for AVERAGE water quality
const int LOW_WATER_PIN = 27;    // LED for BAD water quality

// ---------------------------------------------------------
// WIFI & WEB SERVER SETTINGS
// ---------------------------------------------------------
const char* ssid = "esp32webserver";
const char* password = "1234";

WebServer server(80);

// ---------------------------------------------------------
// GLOBAL STATE VARIABLES
// ---------------------------------------------------------
int waterLevel = 0;
bool waterDetected = false;
bool pumpStatus = false;

int tds = 0;
String waterQuality = "Unknown";

bool buttonPressed = false;
bool solenoidStatus = false;
bool dispensingStatus = false;

// ---------------------------------------------------------
// API ENDPOINT HANDLER
// ---------------------------------------------------------
void handleGetStatus() {
  // Construct JSON response
  String json = "{";
  json += "\"waterLevel\":" + String(waterLevel) + ",";
  json += "\"waterDetected\":" + String(waterDetected ? "true" : "false") + ",";
  json += "\"pumpStatus\":" + String(pumpStatus ? "true" : "false") + ",";
  json += "\"tds\":" + String(tds) + ",";
  json += "\"waterQuality\":\"" + waterQuality + "\",";
  json += "\"solenoidStatus\":" + String(solenoidStatus ? "true" : "false") + ",";
  json += "\"dispensingStatus\":" + String(dispensingStatus ? "true" : "false");
  json += "}";

  // Enable CORS
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.send(200, "application/json", json);
}

// ---------------------------------------------------------
// SETUP
// ---------------------------------------------------------
void setup() {
  Serial.begin(115200);
  Serial.println("\nInitializing Smart Water Management System...");

  // Configure Pins
  pinMode(WATER_LEVEL_PIN, INPUT);
  pinMode(TDS_PIN, INPUT);
  pinMode(BUTTON_PIN, INPUT_PULLUP); // Assuming button is active LOW (connected to GND)

  pinMode(CONTROL_PIN, OUTPUT);
  pinMode(SOLENOID_PIN, INPUT_PULLUP);
  
  pinMode(GOOD_WATER_PIN, OUTPUT);
  pinMode(MEDIUM_WATER_PIN, OUTPUT);
  pinMode(LOW_WATER_PIN, OUTPUT);

  // Initialize outputs (Active LOW logic: HIGH means OFF)
  digitalWrite(CONTROL_PIN, HIGH);

  digitalWrite(GOOD_WATER_PIN, LOW);
  digitalWrite(MEDIUM_WATER_PIN, LOW);
  digitalWrite(LOW_WATER_PIN, LOW);

  // Setup WiFi Access Point
  Serial.println("Starting Wi-Fi Access Point...");
  WiFi.softAP(ssid, password);
  
  IPAddress IP = WiFi.softAPIP();
  Serial.print("AP IP address: ");
  Serial.println(IP);

  // Setup Web Server Routes
  server.on("/api/status", HTTP_GET, handleGetStatus);
  server.begin();
  Serial.println("HTTP server started.");

  Serial.println("STEM ROBO SYSTEM INITIALIZED");
}

// ---------------------------------------------------------
// MAIN LOOP
// ---------------------------------------------------------
void loop() {
  // 1. Handle Web Server Client Requests
  server.handleClient();

  // 2. Read Sensors
  waterLevel = analogRead(WATER_LEVEL_PIN);
  tds = analogRead(TDS_PIN);

  Serial.print("Water Level Sensor Value: ");
  Serial.print(waterLevel);
  Serial.print(" | TDS Value: ");
  Serial.println(tds);

  // 3. Water Pump Logic (Active LOW)
  if (waterLevel > 0) {
    waterDetected = true;
    pumpStatus = true;
    digitalWrite(CONTROL_PIN, LOW); // ON
    Serial.println("-> Water detected! Pump ON.");
  } else {
    waterDetected = false;
    pumpStatus = false;
    digitalWrite(CONTROL_PIN, HIGH); // OFF
    Serial.println("-> No water detected. Pump OFF.");
  }

  // 4. TDS Quality Logic
  if (tds <= 600) {
    waterQuality = "Good";
    digitalWrite(GOOD_WATER_PIN, HIGH);
    digitalWrite(MEDIUM_WATER_PIN, LOW);
    digitalWrite(LOW_WATER_PIN, LOW);
  } 
  else if (tds > 600 && tds < 1450) {
    waterQuality = "Average";
    digitalWrite(GOOD_WATER_PIN, LOW);
    digitalWrite(MEDIUM_WATER_PIN, HIGH);
    digitalWrite(LOW_WATER_PIN, LOW);
  } 
  else {
    waterQuality = "Bad";
    digitalWrite(GOOD_WATER_PIN, LOW);
    digitalWrite(MEDIUM_WATER_PIN, LOW);
    digitalWrite(LOW_WATER_PIN, HIGH);
  }

  // 5. Water Dispensing Logic (Monitoring Only)
  // Check physical states (Active LOW)
  buttonPressed = (digitalRead(BUTTON_PIN) == LOW); 
  solenoidStatus = (digitalRead(SOLENOID_PIN) == LOW);
  
  if (buttonPressed) {
    dispensingStatus = true;
    Serial.println("-> Physical Dispensing Button is PRESSED.");
  } else {
    dispensingStatus = false;
  }
  
  if (solenoidStatus) {
    Serial.println("-> Physical Solenoid Valve is OPEN.");
  }


  Serial.println("---------------------------------");
  delay(500); // 500ms delay for stability and polling frequency
}

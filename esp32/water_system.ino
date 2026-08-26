#include <WiFi.h>
#include <WebServer.h>

// ---------------------------------------------------------
// HARDWARE PIN DEFINITIONS
// ---------------------------------------------------------
const int WATER_LEVEL_PIN = 36;  // HW-038 water level sensor (Analog)
const int TDS_PIN = 34;          // TDS sensor (Analog)
const int CONTROL_PIN = 23;      // Water pump relay (Active LOW)
const int EMERGENCY_BUTTON_PIN = 21; // E-Stop button (Active LOW)

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

bool emergencyShutdown = false;

// Variables for debounce
bool lastEmergencyButtonState = HIGH;
unsigned long lastDebounceTime = 0;
const unsigned long debounceDelay = 50;

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
  json += "\"emergencyShutdown\":" + String(emergencyShutdown ? "true" : "false");
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
  pinMode(EMERGENCY_BUTTON_PIN, INPUT_PULLUP); // Active LOW E-Stop

  pinMode(CONTROL_PIN, OUTPUT);
  
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

  // 3. E-Stop & Water Pump Logic (Active LOW)
  // Read and debounce emergency button
  int reading = digitalRead(EMERGENCY_BUTTON_PIN);
  if (reading != lastEmergencyButtonState) {
    lastDebounceTime = millis();
  }
  if ((millis() - lastDebounceTime) > debounceDelay) {
    if (reading == LOW) {
      emergencyShutdown = true;
    } else {
      emergencyShutdown = false;
    }
  }
  lastEmergencyButtonState = reading;

  if (emergencyShutdown) {
    pumpStatus = false;
    digitalWrite(CONTROL_PIN, HIGH); // Force OFF
    Serial.println("-> EMERGENCY SHUTDOWN ACTIVE. Pump Disabled.");
  } 
  else if (waterLevel > 300) {
    waterDetected = true;
    pumpStatus = true;
    digitalWrite(CONTROL_PIN, LOW); // ON
    Serial.println("-> Water detected via level sensor! Pump ON.");
  } 
  else {
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

  Serial.println("---------------------------------");
  delay(500); // 500ms delay for stability and polling frequency
}

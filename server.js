const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

let isActivated = false;  // Tracks ESP32 activation state
let ledState = false;     // Tracks LED state

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Route to handle incoming messages
app.post('/message', (req, res) => {
  console.log(`Otrzymano wiadomość: ${req.body.message}`);
  res.send('Wiadomość odebrana!');
});

// Route to activate ESP32 and toggle LED
app.get('/activate', (req, res) => {
  isActivated = true;  // Set activation state to true
  ledState = !ledState;  // Toggle LED state (ON/OFF)
  console.log("Aktywacja z ESP32 ustawiona!");
  res.json({ led: ledState });  // Send the current LED state to the ESP32
});

// Route for ESP32 to check the activation state and LED status
app.get('/checkActivation', (req, res) => {
  if (isActivated) {
    res.json({ activate: true, led: ledState });  // Send activation and LED state
    isActivated = false;  // Reset activation state after sending
  } else {
    res.json({ activate: false });  // No activation, just send false
  }
});

app.listen(port, () => {
  console.log(`Server is running on https://frosted-simple-pheasant.glitch.me`);
});

const express = require('express');
const path = require('path');
const app = express();
const session = require('express-session');
const bodyParser = require('body-parser');
const port = process.env.PORT || 3000;

let isActivated = false;  // Tracks ESP32 activation state
let ledState = false;     // Tracks LED state



app.use(bodyParser.urlencoded({ extended: true }));

// Dynamic secure cookie setting based on protocol (secure only for HTTPS)
app.set('trust proxy', 1);  // Needed for running behind proxies (e.g., Glitch)

// Session setup with dynamic `secure` cookie
app.use(session({
  secret: 'your_secret_key_here',  // Change to a strong random secret
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: req => req.headers['x-forwarded-proto'] === 'https',  // Secure only over HTTPS
    httpOnly: true
  }
}));

// Access credentials from environment variables
const USERNAME = process.env.USERNAME;
const PASSWORD = process.env.PASSWORD;

// Route: GET / (Home/Protected Page)
app.get('/', (req, res) => {
  if (req.session.loggedIn) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));  // Serve protected page if logged in
  } else {
    res.redirect('/login');  // Redirect to login if not authenticated
  }
});

// Route: GET /login (Login Page)
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));  // Serve login form
});

// Route: POST /login (Authentication)
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Authenticate using environment variables
  if (username === USERNAME && password === PASSWORD) {
    req.session.loggedIn = true;  // Mark user as logged in
    console.log('Login successful. Redirecting to the protected page...');
    
    res.redirect('/');  // Redirect to the protected page
  } else {
    console.log('Login failed. Invalid username or password.');
    res.send('Invalid username or password. <a href="/login">Try again</a>');  // Simple error message
  }
});

// Route: GET /logout (Logout)
app.get('/logout', (req, res) => {
  req.session.destroy();  // Destroy the session to log out
  res.redirect('/login');  // Redirect to login page
});

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

// Start the server
app.listen(port, () => {
  console.log(`Server running on https://${process.env.PROJECT_DOMAIN}.glitch.me`);
});

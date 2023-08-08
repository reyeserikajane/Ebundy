// Function to update the clock
function updateClock() {
  const clockElement = document.getElementById('clock');
  const now = new Date();
  const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
  const timeString = now.toLocaleTimeString(undefined, timeOptions);
  clockElement.innerHTML = `<span class="time">${timeString}</span>`;
}

// Function to start the clock updates
function startClock() {
  updateClock(); 
  setInterval(updateClock, 1000); 
}

// Call the startClock function to begin updating the clock
startClock();

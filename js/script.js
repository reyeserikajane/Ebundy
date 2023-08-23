const BASE_URL = "https://attendance.8boxsystems.com";

// Function to update the clock
function updateClock() {
  const clockElement = document.getElementById("clock");
  const dateElement = document.querySelector(".day"); // Select the date element
  const now = new Date();

  // Options for formatting the date
  const dateOptions = {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  };

  // Options for formatting the time
  const timeOptions = {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  };

  // Format the date and time
  const dateString = now.toLocaleDateString(undefined, dateOptions);
  const timeString = now.toLocaleTimeString(undefined, timeOptions);

  // Update the clock and date elements
  clockElement.innerHTML = `<span class="time">${timeString}</span>`;
  dateElement.textContent = dateString;
}

// Function to start the clock updates
function startClock() {
  updateClock();
  setInterval(updateClock, 1000);
}

// Call the startClock function to begin updating the clock
startClock();

const encryptLink = (link, secretKey) => {
  const encrypted = CryptoJS.AES.encrypt(link, secretKey, {
    padding: CryptoJS.pad.Pkcs7,
    mode: CryptoJS.mode.ECB,
  }).toString();

  // URL-safe Base64 encoding
  const encoded = CryptoJS.enc.Base64.stringify(
    CryptoJS.enc.Utf8.parse(encrypted)
  )
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  return encoded;
};

const decryptLink = (link, secretKey) => {
  try {
    // URL-safe Base64 decoding
    const decoded = CryptoJS.enc.Base64.parse(
      link.replace(/-/g, "+").replace(/_/g, "/")
    ).toString(CryptoJS.enc.Utf8);

    const decrypted = CryptoJS.AES.decrypt(decoded, secretKey, {
      padding: CryptoJS.pad.Pkcs7,
      mode: CryptoJS.mode.ECB,
    }).toString(CryptoJS.enc.Utf8);
    return decrypted;
  } catch (error) {
    // window.location.href="index.html"
  }
};

const getSecretKey = async () => {
  const secret = "secret";
  return secret;
};

const callApiAndViewTimeRecords = async (e) => {
  e.target.disabled = true;

  try {
    const secretKey = await getSecretKey();

    // Get the entered employee ID from the input field
    const employeeId = document.getElementById("employeeId").value;

    if (!employeeId) {
      alert("Please enter an employee ID.");
      return;
    }

    const originalLink = employeeId;
    const encryptedLink = encryptLink(originalLink, secretKey);

    // Make the API call using Fetch API
    const apiEndpoint = `${BASE_URL}/api/attendance`;
    const apiUrl = new URL(apiEndpoint);
    apiUrl.searchParams.append("emp", encryptedLink);

    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();

      console.log("API Response:", data);

      document.getElementById("myModal").style.display = "flex";

      // Close the modal when the close button is clicked
      document.querySelector(".close").addEventListener("click", function () {
        document.getElementById("myModal").style.display = "none";
        table.destroy(); // Destroy the DataTables instance
      });

      // Close the modal if user clicks outside of it
      window.addEventListener("click", function (event) {
        if (event.target === document.getElementById("myModal")) {
          document.getElementById("myModal").style.display = "none";
          table.destroy(); // Destroy the DataTables instance
        }
      });

      // Select the table element by its ID
      const tableElement = document.getElementById("myTable");

      // Initialize DataTables
      const dataTable = new DataTable(tableElement, {
        paging: true,
        searching: true,
        ordering: true,
        data: data.records,
        columns: [
          {
            title: "Attendance Type",
            render: (data, type, row) => {
              if (row.attendanceType === 1)
                return `<span class="attendance attendance--1">Clocked in</span>`;
              if (row.attendanceType === 2)
                return `<span class="attendance attendance--2">Clocked out</span>`;
            },
          },
          // { title: "Attendance Type", data: "attendanceType" },
          {
            title: "Date",
            render: (data, type, row) => {
              return formatDate(row.date);
            },
          },
          // { title: "Date", data: "date" },
          { title: "Employee", data: "employee" },
          {
            title: "Time",
            render: (data, type, row) => {
              return formatTime(row.time);
            },
          },
          // { title: "Time", data: "time" },
        ],
        bDestroy: true,
      });
    } catch (error) {
      console.error("API Error:", error);
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    e.target.disabled = false;
  }
};

// Function to make a POST request for clock in or clock out
const performClockAction = async (e) => {
  const button = e.target;
  button.disabled = true;

  try {
    const secretKey = await getSecretKey();

    const employeeId = document.getElementById("employeeId").value;

    const originalLink = employeeId;
    const encryptedLink = encryptLink(originalLink, secretKey);

    const apiEndpoint = `${BASE_URL}/api/attendance`;
    const apiUrl = new URL(apiEndpoint);
    apiUrl.searchParams.append("emp", encryptedLink);

    const requestOptions = {
      method: "POST",
    };

    const response = await fetch(apiUrl, requestOptions);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    console.log("API Response:", data);

    // Determine the last attendance type
    // const { hasRecord } = data;

    // console.log(hasRecord);

    // Get the last attendance type from the data
    // const lastRecord = data.records[data.records.length - 1];
    // const lastAttendanceType = lastRecord ? lastRecord.attendanceType : 0;

    // Update button text based on the last attendance type
    // if (hasRecord) {
    //   button.innerHTML = "CLOCK OUT"; // Change text to "Clock Out"
    //   button.classList.remove("clock-in-bg");
    //   button.classList.add("clock-out-bg");
    // } else if (!hasRecord) {
    //   button.innerHTML = "CLOCK IN"; // Change text to "Clock In"
    //   button.classList.remove("clock-out-bg");
    //   button.classList.add("clock-in-bg");
    // } else {
    //   button.innerHTML = "CLOCK IN";
    // }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    e.target.disabled = false;
  }
};

// Attach event listener to the "View Time Records" button
document
  .querySelector(".view-time-records-button")
  .addEventListener("click", callApiAndViewTimeRecords.bind(this));

// Attach event listener to the "Clock action button" button
document
  .querySelector(".clock-out-button")
  .addEventListener("click", performClockAction.bind(this));

// Modal
// document
//   .querySelector(".view-time-records-button")
//   .addEventListener("click", function () {
//     // Display the modal when the button is clicked
//     document.getElementById("myModal").style.display = "flex";

//     // Close the modal when the close button is clicked
//     document.querySelector(".close").addEventListener("click", function () {
//       document.getElementById("myModal").style.display = "none";
//       table.destroy(); // Destroy the DataTables instance
//     });

//     // Close the modal if user clicks outside of it
//     window.addEventListener("click", function (event) {
//       if (event.target === document.getElementById("myModal")) {
//         document.getElementById("myModal").style.display = "none";
//         table.destroy(); // Destroy the DataTables instance
//       }
//     });
//   });

// Function to format the date
function formatDate(dateString) {
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

function formatTime(timeString) {
  const [hours, minutes, seconds] = timeString.split(":");
  const parsedHours = parseInt(hours);
  const period = parsedHours >= 12 ? "PM" : "AM";
  const formattedHours = parsedHours % 12 === 0 ? 12 : parsedHours % 12;
  const formattedTime = `${formattedHours}:${minutes}:${seconds} ${period}`;
  return formattedTime;
}

const showLoadingSpinner = (buttonElement) => {
  buttonElement.disabled = true;
  buttonElement.innerHTML = '<span class="spinner"></span>Loading...';
};

const hideLoadingSpinner = (buttonElement, buttonText) => {
  buttonElement.disabled = false;
  buttonElement.innerHTML = buttonText;
};

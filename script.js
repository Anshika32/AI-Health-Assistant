const BACKEND_URL = "https://ai-health-assistant-backend-b4a1.onrender.com";  // Backend proxy server

const authContainer = document.getElementById("auth-container");
const mainSite = document.getElementById("main-site");
const logoutBtn = document.getElementById("logout");
const actionSelect = document.getElementById("action");
const nameField = document.getElementById("name");
const emailField = document.getElementById("email");
const passwordField = document.getElementById("password"); // New password field
const submitButton = document.getElementById("submit");
const message = document.getElementById("message");

// Toggle Name Field Visibility
actionSelect.addEventListener("change", () => {
    if (actionSelect.value === "Signup") {
        nameField.classList.remove("hidden");
        emailField.disabled = false;
    } else {
        nameField.classList.add("hidden");
        emailField.disabled = false;  // Allow email change on login
    }
});

// Check if user is logged in (based on session storage)
function checkAuth() {
    const userEmail = sessionStorage.getItem("user_email");
    
    if (userEmail) {
        authContainer.style.display = "none";
        mainSite.style.display = "block";
    } else {
        authContainer.style.display = "block";
        mainSite.style.display = "none";
    }
}

// Check authentication on page load
document.addEventListener("DOMContentLoaded", () => {
    const storedEmail = localStorage.getItem("user_email");
    const storedName = localStorage.getItem("user_name");

    if (storedEmail) {
        emailField.value = storedEmail;
    }
    if (storedName) {
        nameField.value = storedName;
    }

    checkAuth();
});

// Handle Signup
async function signupUser(name, email, password) {
    try {
        const response = await fetch(`${BACKEND_URL}/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password })
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || "Signup failed.");
        }

        localStorage.setItem("user_name", name);
        localStorage.setItem("user_email", email);

        return { success: true, message: "Signup successful! You can now log in." };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

// Handle Login
async function loginUser(email, password) {
    try {
        const response = await fetch(`${BACKEND_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || "Login failed.");
        }

        sessionStorage.setItem("user_email", email);

        // Save user's name from server response if available
        if (result.user?.name) {
            localStorage.setItem("user_name", result.user.name);
            nameField.value = result.user.name;
        }

        return { success: true, message: "Login successful!" };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

// Handle Form Submission
submitButton.addEventListener("click", async (event) => {
    event.preventDefault();
    const action = actionSelect.value;
    const name = nameField.value.trim();
    const email = emailField.value.trim();
    const password = passwordField.value.trim();

    if (!email || !password || (action === "Signup" && !name)) {
        message.textContent = "Please fill all fields.";
        return;
    }

    let result;
    if (action === "Signup") {
        result = await signupUser(name, email, password);
    } else {
        result = await loginUser(email, password);
        if (result.success) checkAuth();
    }

    message.textContent = result.message;
});

// Logout - Keep name and email but clear session
logoutBtn.addEventListener("click", () => {
    sessionStorage.clear(); // Clear only session storage
    message.textContent = "Logged out successfully!";
    checkAuth();
});


function toggleMenu() {
    const sidebar = document.querySelector(".sidebar");
    sidebar.classList.toggle("active");

    if (sidebar.classList.contains("active")) {
        // Add event listener to close sidebar when clicking outside
        document.addEventListener("click", closeSidebarOnClickOutside);
    } else {
        document.removeEventListener("click", closeSidebarOnClickOutside);
    }
}

function closeSidebarOnClickOutside(event) {
    const sidebar = document.querySelector(".sidebar");
    const menuToggle = document.querySelector(".menu-toggle");

    // If the click is outside the sidebar and not on the menu toggle button, close the sidebar
    if (!sidebar.contains(event.target) && !menuToggle.contains(event.target)) {
        sidebar.classList.remove("active");
        document.removeEventListener("click", closeSidebarOnClickOutside);
    }
}


// Function to toggle sections
function showSection(sectionId) {
    document.querySelectorAll('.content-section').forEach(section => {
        section.style.display = 'none';
    });
    document.getElementById(sectionId).style.display = 'block';

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.remove('active');
    });
    event.target.classList.add('active');
}

// Function to show video based on language selection
function showVideo(language) {
    // let videoContainer = document.getElementById('video-container');
    let videoSource = document.getElementById('video-source');
    let videoElement = document.getElementById('instructional-video');

    if (language === 'bengali') {
        videoSource.src = 'assets/videos/bse_video_bengali.mp4';
    } else {
        videoSource.src = '  assets/videos/bse_video_hindi.webm';
    }

    videoElement.load(); // Reload video with new source
}

// Load Hindi Video by Default
document.addEventListener('DOMContentLoaded', function () {
    showVideo('hindi');
});

// Slideshow Logic for Techniques Section
const images = [
    "assets/PPT_Images/Slide1.PNG",
    "assets/PPT_Images/Slide2.PNG",
    "assets/PPT_Images/Slide3.PNG",
    "assets/PPT_Images/Slide4.PNG",
    "assets/PPT_Images/Slide5.PNG",
    "assets/PPT_Images/Slide6.PNG",
    "assets/PPT_Images/Slide7.PNG"
];

let currentIndex = 0;
let intervalId = null;

const slideshowImage = document.getElementById("slideshow-image");
const caption = document.getElementById("caption");
const startBtn = document.getElementById("start-btn");
const stopBtn = document.getElementById("stop-btn");

function updateSlide() {
    slideshowImage.src = images[currentIndex];
    caption.textContent =`Technique of Palpation (${currentIndex + 1}/${images.length})`;
}

function startSlideshow() {
    if (intervalId) return; // Prevent multiple intervals
    intervalId = setInterval(() => {
        currentIndex = (currentIndex + 1) % images.length;
        updateSlide();
    }, 5000); // Change image every 5 seconds
}

function stopSlideshow() {
    clearInterval(intervalId);
    intervalId = null;
}

// Event Listeners for Slideshow Buttons
startBtn.addEventListener("click", startSlideshow);
stopBtn.addEventListener("click", stopSlideshow);

async function sendMessage() {
    const userInput = document.getElementById("user-input").value;
    if (!userInput.trim()) return;

    displayMessage(userInput, "user");

    document.getElementById("user-input").value = "";

    const apiKey = "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";  // Store this securely
    const apiUrl = "https://api.groq.com/openai/v1/chat/completions";

    const requestBody = {
        model: "llama-3.2-90b-vision-preview",
        messages: [
            {
                role: "system",
                content: "Answer only the question asked. Keep responses concise and avoid unnecessary details."
            },
            { 
                role: "user", 
                content: userInput 
            }
        ],
        temperature: 0.5,  // Lower temperature for more direct responses
        max_tokens: 300     // Reduce token limit to prevent excessive info
    };
    
    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization":`Bearer ${apiKey}`
            },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();
        const botReply = data.choices[0].message.content;
        displayMessage(botReply, "bot");
    } catch (error) {
        console.error("Error:", error);
        displayMessage("Sorry, I couldn't process your request.", "bot");
    }
}

function displayMessage(message, sender) {
    const chatBox = document.getElementById("chat-box");
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("chat-message", sender === "user" ? "user-message" : "bot-message");

    // Convert Markdown-like syntax to HTML
    message = message
        .replace(/\\(.?)\\*/g, "<strong>$1</strong>") // Bold text
        .replace(/\n/g, "<br>") // Preserve new lines
        .replace(/\d+\.\s/g, "<br>• "); // Convert numbered lists to bullets

    messageDiv.innerHTML = message; // Use innerHTML to render formatted text
    chatBox.appendChild(messageDiv);
    
    setTimeout(() => {
        chatBox.scrollTop = chatBox.scrollHeight; 
    }, 100);
}

document.getElementById("user-input").addEventListener("keypress", function (event) {
    if (event.key === "Enter") {  
        event.preventDefault();  // Prevent new line (important)
        document.getElementById("send-btn").click();  // Click the send button
    }
});

function clearChat() {
    document.getElementById("chat-box").innerHTML = ""; // Clears chat content
}


document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("contact-form");
    const successMessage = document.getElementById("success-message");

    form.addEventListener("submit", function (event) {
        event.preventDefault(); // Prevent default form submission

        const formData = new FormData(form);

        fetch("https://api.web3forms.com/submit", {
            method: "POST",
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                successMessage.style.display = "block"; // Show success message
                form.reset(); // Clear form fields
                setTimeout(() => {
                    successMessage.style.display = "none"; // Hide after 5 seconds
                }, 5000);
            } else {
                alert("Something went wrong. Please try again.");
            }
        })
        .catch(error => {
            console.error("Error:", error);
            alert("An error occurred. Please try again.");
        });
    });

    document.getElementById("contact-form").addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            event.preventDefault(); // Prevents default behavior (like new line in textarea)
            document.getElementById("send-btn").click(); // Simulate button click
        }
    });
});

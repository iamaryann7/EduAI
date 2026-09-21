const GEMINI_API_KEY = "AQ.Ab8RN6KVXMEzpM89B9b-UrkvWM_w2hhmIzKHPWOK_7GmfMCaQQ"; // ⬅️ Apni API Key yahan paste karein

let currentTab = "notes";
let selectedRating = 5;

// --- INITIALIZATION ---
document.addEventListener("DOMContentLoaded", function () {
    checkUserRegistration();
    loadReviews();
    setRating(5);
});

// --- TAB SWITCHING ---
function switchTab(tab) {
    currentTab = tab;
    document.querySelectorAll(".tab-btn").forEach(btn => btn.classList.remove("active"));
    if (event && event.target) {
        event.target.classList.add("active");
    }
}

// --- GEMINI API CALL WITH FALLBACK ---
async function callGeminiAPI(promptText) {
    const models = ["gemini-3.6-flash", "gemini-2.5-flash", "gemini-1.5-flash"];

    for (let model of models) {
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: promptText }] }]
                })
            });

            const data = await response.json();

            if (!data.error && data.candidates && data.candidates[0].content && data.candidates[0].content.parts[0].text) {
                return data.candidates[0].content.parts[0].text;
            }

            if (data.error) {
                console.warn(`Model ${model} Error:`, data.error.message);
            }
        } catch (e) {
            console.error(`Fetch failed for model ${model}:`, e);
        }
    }
    throw new Error("Server temporary busy hai. Kripya 5-10 second baad dobara try karein.");
}

// --- GENERATE CONTENT (NOTES / QUIZ / PPT / PYQ) ---
async function generateContent() {
    const topicInput = document.getElementById("topicInput");
    const outputContainer = document.getElementById("outputContainer");

    if (!topicInput) return;
    const topic = topicInput.value.trim();

    if (!topic) {
        alert("Please enter a topic!");
        return;
    }

    outputContainer.innerHTML = "⏳ Generating content using AI...";

    let prompt = "";
    if (currentTab === "notes") {
        prompt = `Create comprehensive, well-structured study notes on the topic: "${topic}". Include key concepts, bullet points, and practical examples.`;
    } else if (currentTab === "quiz") {
        prompt = `Generate a 5-question multiple choice quiz on "${topic}" with 4 options for each question and answers with explanations at the end.`;
    } else if (currentTab === "ppt") {
        prompt = `Create a slide-by-slide presentation outline (5 slides) for "${topic}". Include Slide Title, Bullet Points, and Speaker Notes for each slide.`;
    } else if (currentTab === "pyq") {
        prompt = `Provide 5 important exam-style Previous Year Questions (PYQ) with detailed step-by-step solutions for "${topic}".`;
    }

    try {
        const textOutput = await callGeminiAPI(prompt);
        outputContainer.innerText = textOutput;
    } catch (error) {
        outputContainer.innerHTML = `<p style="color:red; font-weight:bold;">${error.message}</p>`;
    }
}

// --- INSTANT DOUBT SOLVER ---
async function solveDoubt() {
    const doubtInput = document.getElementById("doubtInput");
    const doubtOutput = document.getElementById("doubtOutput");

    if (!doubtInput) return;
    const doubtText = doubtInput.value.trim();

    if (!doubtText) {
        alert("Please enter your doubt!");
        return;
    }

    doubtOutput.innerHTML = "⏳ Solving your doubt...";

    try {
        const textOutput = await callGeminiAPI(`Solve this doubt clearly and concisely: ${doubtText}`);
        doubtOutput.innerText = textOutput;
    } catch (error) {
        doubtOutput.innerHTML = `<p style="color:red; font-weight:bold;">${error.message}</p>`;
    }
}

// --- PDF / PRINT FUNCTION ---
function downloadPDF() {
    const outputContainer = document.getElementById("outputContainer");
    if (!outputContainer) return;

    const content = outputContainer.innerText;
    if (!content || content.startsWith("⏳") || content.startsWith("Content will")) {
        alert("Please generate content first!");
        return;
    }
    window.print();
}

// --- 1. USER REGISTRATION SYSTEM ---
function checkUserRegistration() {
    const user = localStorage.getItem("eduai_user");
    const modal = document.getElementById("registerModal");

    if (!user && modal) {
        modal.classList.remove("hidden");
    } else if (modal) {
        modal.classList.add("hidden");
    }
}

function handleRegistration(e) {
    if (e) e.preventDefault();
    const name = document.getElementById("regName").value.trim();
    const email = document.getElementById("regEmail").value.trim();
    const phone = document.getElementById("regPhone").value.trim();

    if (name && email && phone) {
        const userData = { name, email, phone, registeredAt: new Date().toISOString() };
        localStorage.setItem("eduai_user", JSON.stringify(userData));

        const modal = document.getElementById("registerModal");
        if (modal) modal.classList.add("hidden");

        alert(`Welcome, ${name}! Your registration was successful.`);
    }
}

// --- 2. SUBSCRIBE SYSTEM ---
function handleSubscribe(e) {
    if (e) e.preventDefault();
    const emailInput = document.getElementById("subEmail");
    const statusMsg = document.getElementById("subStatus");

    if (!emailInput) return;
    const email = emailInput.value.trim();

    if (email) {
        let subscribers = JSON.parse(localStorage.getItem("eduai_subscribers")) || [];
        if (!subscribers.includes(email)) {
            subscribers.push(email);
            localStorage.setItem("eduai_subscribers", JSON.stringify(subscribers));
        }

        if (statusMsg) {
            statusMsg.innerText = "🎉 Thank you for subscribing! You will receive new updates.";
            statusMsg.style.color = "#a7f3d0";
        }
        emailInput.value = "";
    }
}

// --- 3. REVIEW & FEEDBACK SYSTEM ---
function setRating(rating) {
    selectedRating = rating;
    const stars = document.querySelectorAll(".rating-stars span");
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.add("selected");
        } else {
            star.classList.remove("selected");
        }
    });
}

function submitFeedback(e) {
    if (e) e.preventDefault();
    const feedbackInput = document.getElementById("feedbackText");
    if (!feedbackInput) return;

    const comment = feedbackInput.value.trim();
    if (!comment) return;

    const user = JSON.parse(localStorage.getItem("eduai_user"));
    const userName = user ? user.name : "Anonymous User";

    const newReview = {
        name: userName,
        rating: selectedRating,
        comment: comment,
        date: new Date().toLocaleDateString()
    };

    let reviews = JSON.parse(localStorage.getItem("eduai_reviews")) || [];
    reviews.unshift(newReview);
    localStorage.setItem("eduai_reviews", JSON.stringify(reviews));

    feedbackInput.value = "";
    loadReviews();
    alert("Thank you for your feedback!");
}

function loadReviews() {
    const reviewsList = document.getElementById("reviewsList");
    if (!reviewsList) return;

    let reviews = JSON.parse(localStorage.getItem("eduai_reviews")) || [];

    if (reviews.length === 0) {
        reviews = [
            { name: "Abhiraj Kumar", rating: 5, comment: "Awesome AI tools! Very helpful for study notes & PYQs.", date: "10/08/2026" }
        ];
    }

    reviewsList.innerHTML = reviews.map(rev => `
        <div class="review-item" style="border-bottom: 1px solid #e5e7eb; padding: 8px 0;">
            <div class="user-name" style="font-weight: bold;">${rev.name} <span class="stars" style="color: #f59e0b;">${"★".repeat(rev.rating)}</span></div>
            <div class="comment" style="color: #4b5563;">${rev.comment}</div>
        </div>
    `).join("");
}

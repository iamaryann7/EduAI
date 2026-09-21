/* =========================================================
   EDUAI HUB
   AI STUDY COMPANION
   ========================================================= */


/* =========================================================
   1. GEMINI CONFIGURATION
   ========================================================= */

/*
   IMPORTANT:
   Paste your own Gemini API key below.

   Example:
   const GEMINI_API_KEY = "AIza....";

   DO NOT share your API key publicly.
*/

const GEMINI_API_KEY = AQ.Ab8RN6I9x2j8_NbiO8561hTik5zIeIi1SgjYov5IWLELE-i6Pg;


/*
   Current Gemini model.

   If your API key/project does not have access to this model,
   the code will show the actual API error instead of hiding it.
*/

const GEMINI_MODEL = "gemini-3.8-flash";


let currentTab = "notes";
let selectedRating = 5;


/* =========================================================
   2. PAGE INITIALIZATION
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    setupTabs();
    setupButtons();
    setupRegistration();
    setupFeedback();
    setupSubscribe();

    loadReviews();
    setRating(5);

});


/* =========================================================
   3. TAB SYSTEM
   ========================================================= */

function setupTabs() {

    const buttons = document.querySelectorAll(".tab-btn");

    buttons.forEach(button => {

        button.addEventListener("click", () => {

            buttons.forEach(btn => {
                btn.classList.remove("active");
            });

            button.classList.add("active");

            currentTab = button.dataset.tab;

            updateOutputTitle();

        });

    });

}


function updateOutputTitle() {

    const title = document.getElementById("outputTitle");

    const titles = {
        notes: "AI Study Notes",
        quiz: "AI Quiz",
        ppt: "AI PPT Outline",
        pyq: "AI PYQ Paper"
    };

    title.textContent = titles[currentTab] || "Generated Content";

}


/* =========================================================
   4. BUTTON EVENTS
   ========================================================= */

function setupButtons() {

    document
        .getElementById("generateBtn")
        .addEventListener("click", generateContent);


    document
        .getElementById("solveBtn")
        .addEventListener("click", solveDoubt);


    document
        .getElementById("clearDoubtBtn")
        .addEventListener("click", () => {

            document.getElementById("doubtInput").value = "";
            document.getElementById("doubtOutput").innerHTML = "";

        });


    document
        .getElementById("copyBtn")
        .addEventListener("click", copyOutput);


    document
        .getElementById("topicInput")
        .addEventListener("keydown", event => {

            if (event.key === "Enter") {
                generateContent();
            }

        });

}


/* =========================================================
   5. GEMINI API
   ========================================================= */

async function callGeminiAPI(promptText) {

    if (
        !GEMINI_API_KEY ||
        GEMINI_API_KEY === "PASTE_YOUR_API_KEY_HERE"
    ) {

        throw new Error(
            "Gemini API key missing. Open app.js and paste your API key."
        );

    }


    const url =
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;


    const response = await fetch(url, {

        method: "POST",

        headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": GEMINI_API_KEY
        },

        body: JSON.stringify({

            contents: [

                {
                    role: "user",

                    parts: [
                        {
                            text: promptText
                        }
                    ]

                }

            ],

            generationConfig: {

                temperature: 0.7,

                maxOutputTokens: 2048

            }

        })

    });


    let data;

    try {

        data = await response.json();

    } catch {

        throw new Error(
            `Gemini API returned an invalid response. HTTP ${response.status}`
        );

    }


    console.log("Gemini API Response:", data);


    /* API ERROR */

    if (!response.ok) {

        const message =
            data?.error?.message ||
            `Gemini API Error. HTTP ${response.status}`;

        throw new Error(message);

    }


    /* RESPONSE */

    const text =
        data?.candidates?.[0]?.content?.parts
            ?.map(part => part.text || "")
            .join("")
            .trim();


    if (!text) {

        throw new Error(
            "Gemini API returned no text response."
        );

    }


    return text;

}


/* =========================================================
   6. GENERATE NOTES / QUIZ / PPT / PYQ
   ========================================================= */

async function generateContent() {

    const topicInput =
        document.getElementById("topicInput");

    const output =
        document.getElementById("outputContainer");

    const status =
        document.getElementById("statusText");

    const button =
        document.getElementById("generateBtn");


    const topic =
        topicInput.value.trim();


    if (!topic) {

        topicInput.focus();

        output.innerHTML =
            `<div class="api-error">
                Please enter a topic first.
            </div>`;

        return;

    }


    let prompt = "";


    /* NOTES */

    if (currentTab === "notes") {

        prompt = `
You are an expert college teacher.

Create clear and exam-friendly study notes on:

"${topic}"

Include:

1. Definition
2. Important concepts
3. Key points
4. Examples
5. Advantages and disadvantages where applicable
6. Important exam questions
7. Short revision summary

Use simple language suitable for BCA students.
Format the answer with headings and bullet points.
`;

    }


    /* QUIZ */

    else if (currentTab === "quiz") {

        prompt = `
Create a BCA-level MCQ quiz on:

"${topic}"

Create exactly 10 questions.

For every question provide:

Question
A
B
C
D
Correct Answer
Short Explanation

Make the questions useful for exam preparation.
`;

    }


    /* PPT */

    else if (currentTab === "ppt") {

        prompt = `
Create a professional 8-slide presentation outline about:

"${topic}"

For every slide provide:

Slide Number
Slide Title
3-5 important bullet points
Speaker Notes

Keep it suitable for a BCA college presentation.
`;

    }


    /* PYQ */

    else if (currentTab === "pyq") {

        prompt = `
Create a practice PYQ-style paper for:

"${topic}"

Create:

5 short-answer questions
5 long-answer questions
5 MCQs

Also provide answers/solutions after the questions.

Important:
These are practice questions, not claims about an actual university previous-year paper.
`;

    }


    button.disabled = true;

    button.textContent = "Generating...";

    status.textContent = "AI is working...";


    output.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            Generating your content...
        </div>
    `;


    try {

        const result =
            await callGeminiAPI(prompt);


        output.textContent = result;

        status.textContent = "Generated successfully ✓";


    } catch (error) {

        showAPIError(output, error);

        status.textContent = "Generation failed";

    }


    button.disabled = false;

    button.textContent = "Generate ✨";

}


/* =========================================================
   7. DOUBT SOLVER
   ========================================================= */

async function solveDoubt() {

    const input =
        document.getElementById("doubtInput");

    const output =
        document.getElementById("doubtOutput");

    const button =
        document.getElementById("solveBtn");


    const question =
        input.value.trim();


    if (!question) {

        input.focus();

        output.innerHTML = `
            <div class="api-error">
                Please enter your doubt first.
            </div>
        `;

        return;

    }


    button.disabled = true;

    button.textContent = "Solving...";


    output.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            AI is solving your doubt...
        </div>
    `;


    const prompt = `
You are a helpful BCA college tutor.

Solve the student's doubt below.

Student Question:
${question}

Instructions:

- Explain in simple language.
- Give step-by-step explanation when needed.
- Give an example if useful.
- Keep the answer accurate and educational.
`;


    try {

        const result =
            await callGeminiAPI(prompt);


        output.textContent = result;

    } catch (error) {

        showAPIError(output, error);

    }


    button.disabled = false;

    button.textContent = "🚀 Solve My Doubt";

}


/* =========================================================
   8. API ERROR DISPLAY
   ========================================================= */

function showAPIError(element, error) {

    console.error("EduAI Error:", error);


    element.innerHTML = `
        <div class="api-error">
            <strong>⚠️ AI Request Failed</strong>

            <br><br>

            ${escapeHTML(error.message)}

            <br><br>

            <strong>What to check:</strong>

            <br>
            • API key is correct
            <br>
            • Gemini API is enabled
            <br>
            • Your API key has access to the selected model
            <br>
            • Browser internet connection is working
            <br>
            • Check browser Console (F12) for technical details
        </div>
    `;

}


/* =========================================================
   9. COPY OUTPUT
   ========================================================= */

async function copyOutput() {

    const output =
        document.getElementById("outputContainer");

    const text =
        output.innerText.trim();


    if (!text || text.includes("Your AI content will appear here")) {

        alert("Generate some content first.");

        return;

    }


    try {

        await navigator.clipboard.writeText(text);

        const button =
            document.getElementById("copyBtn");

        button.textContent = "✓ Copied";

        setTimeout(() => {
            button.textContent = "📋 Copy";
        }, 1500);

    } catch {

        alert("Copy failed. Please select and copy the text manually.");

    }

}


/* =========================================================
   10. REGISTRATION
   ========================================================= */

function setupRegistration() {

    const form =
        document.getElementById("registrationForm");


    const saved =
        localStorage.getItem("eduai_user");


    if (saved) {

        try {

            const user =
                JSON.parse(saved);

            showRegistrationMessage(
                `Welcome back, ${user.name}! 👋`
            );

        } catch {

            localStorage.removeItem("eduai_user");

        }

    }


    form.addEventListener("submit", event => {

        event.preventDefault();


        const name =
            document.getElementById("regName").value.trim();

        const email =
            document.getElementById("regEmail").value.trim();

        const phone =
            document.getElementById("regPhone").value.trim();


        const user = {

            name,
            email,
            phone,

            registeredAt:
                new Date().toISOString()

        };


        localStorage.setItem(
            "eduai_user",
            JSON.stringify(user)
        );


        showRegistrationMessage(
            `Registration successful! Welcome ${name} 🎉`
        );


        form.reset();

    });

}


function showRegistrationMessage(message) {

    const box =
        document.getElementById("registrationStatus");


    box.textContent = message;

    box.style.marginTop = "15px";

    box.style.color = "#15803d";

    box.style.fontWeight = "600";

}


/* =========================================================
   11. REVIEWS
   ========================================================= */

function setupFeedback() {

    const stars =
        document.querySelectorAll("#ratingStars span");


    stars.forEach(star => {

        star.addEventListener("click", () => {

            setRating(
                Number(star.dataset.rating)
            );

        });

    });


    document
        .getElementById("feedbackForm")
        .addEventListener("submit", event => {

            event.preventDefault();

            const text =
                document
                    .getElementById("feedbackText")
                    .value
                    .trim();


            if (!text) return;


            const user =
                JSON.parse(
                    localStorage.getItem("eduai_user") || "{}"
                );


            const review = {

                name:
                    user.name || "Anonymous Student",

                rating:
                    selectedRating,

                text,

                date:
                    new Date().toLocaleDateString()

            };


            const reviews =
                JSON.parse(
                    localStorage.getItem("eduai_reviews") || "[]"
                );


            reviews.unshift(review);


            localStorage.setItem(
                "eduai_reviews",
                JSON.stringify(reviews)
            );


            document
                .getElementById("feedbackText")
                .value = "";


            loadReviews();

        });

}


function setRating(rating) {

    selectedRating = rating;


    document
        .querySelectorAll("#ratingStars span")
        .forEach(star => {

            const value =
                Number(star.dataset.rating);


            star.classList.toggle(
                "active",
                value <= rating
            );

        });

}


function loadReviews() {

    const container =
        document.getElementById("reviewsList");


    const reviews =
        JSON.parse(
            localStorage.getItem("eduai_reviews") || "[]"
        );


    if (reviews.length === 0) {

        container.innerHTML = `
            <div class="review">
                <div class="review-name">
                    Abhiraj Kumar
                    <span class="review-stars">★★★★★</span>
                </div>

                <div class="review-text">
                    Very helpful AI tools for study and exam preparation.
                </div>
            </div>
        `;

        return;

    }


    container.innerHTML =
        reviews.map(review => `

            <div class="review">

                <div class="review-name">
                    ${escapeHTML(review.name)}

                    <span class="review-stars">
                        ${"★".repeat(review.rating)}
                    </span>
                </div>

                <div class="review-text">
                    ${escapeHTML(review.text)}
                </div>

            </div>

        `).join("");

}


/* =========================================================
   12. SUBSCRIBE
   ========================================================= */

function setupSubscribe() {

    document
        .getElementById("subscribeForm")
        .addEventListener("submit", event => {

            event.preventDefault();


            const input =
                document.getElementById("subEmail");

            const email =
                input.value.trim();


            const subscribers =
                JSON.parse(
                    localStorage.getItem("eduai_subscribers") || "[]"
                );


            if (!subscribers.includes(email)) {

                subscribers.push(email);

                localStorage.setItem(
                    "eduai_subscribers",
                    JSON.stringify(subscribers)
                );

            }


            document
                .getElementById("subStatus")
                .textContent =
                "✓ Thanks for subscribing!";


            input.value = "";

        });

}


/* =========================================================
   13. SECURITY HELPER
   ========================================================= */

function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

      }

```javascript
// =====================================================
// EDUAI HUB - FIXED APP.JS
// =====================================================

// 👉 YAHAN APNI API KEY PASTE KARO
const GEMINI_API_KEY = AQ.Ab8RN6I9x2j8_NbiO8561hTik5zIeIi1SgjYov5IWLELE-i6Pg;

// Stable Gemini model
const GEMINI_MODEL = "gemini-2.5-flash";

let currentTab = "notes";
let selectedRating = 5;


// =====================================================
// PAGE LOAD
// =====================================================

document.addEventListener("DOMContentLoaded", function () {

    console.log("EduAI Hub JavaScript loaded successfully.");

    setupTabs();
    setupButtons();
    setupRegistration();
    setupFeedback();
    setupSubscribe();

    loadReviews();
    setRating(5);

});


// =====================================================
// TAB SYSTEM
// =====================================================

function setupTabs() {

    const buttons = document.querySelectorAll(".tab-btn");

    buttons.forEach(function (button) {

        button.addEventListener("click", function () {

            buttons.forEach(function (btn) {
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

    if (!title) return;

    if (currentTab === "notes") {
        title.textContent = "AI Study Notes";
    }

    else if (currentTab === "quiz") {
        title.textContent = "AI Quiz";
    }

    else if (currentTab === "ppt") {
        title.textContent = "AI PPT Outline";
    }

    else if (currentTab === "pyq") {
        title.textContent = "AI PYQ Practice Paper";
    }

}


// =====================================================
// BUTTON SETUP
// =====================================================

function setupButtons() {

    const generateBtn =
        document.getElementById("generateBtn");

    const solveBtn =
        document.getElementById("solveBtn");

    const copyBtn =
        document.getElementById("copyBtn");

    const clearDoubtBtn =
        document.getElementById("clearDoubtBtn");

    const topicInput =
        document.getElementById("topicInput");


    if (generateBtn) {

        generateBtn.addEventListener(
            "click",
            generateContent
        );

    }


    if (solveBtn) {

        solveBtn.addEventListener(
            "click",
            solveDoubt
        );

    }


    if (copyBtn) {

        copyBtn.addEventListener(
            "click",
            copyOutput
        );

    }


    if (clearDoubtBtn) {

        clearDoubtBtn.addEventListener(
            "click",
            function () {

                const input =
                    document.getElementById("doubtInput");

                const output =
                    document.getElementById("doubtOutput");

                if (input) input.value = "";

                if (output) output.innerHTML = "";

            }
        );

    }


    if (topicInput) {

        topicInput.addEventListener(
            "keydown",
            function (event) {

                if (event.key === "Enter") {
                    generateContent();
                }

            }
        );

    }

}


// =====================================================
// GEMINI API
// =====================================================

async function callGeminiAPI(prompt) {

    if (
        !GEMINI_API_KEY ||
        GEMINI_API_KEY === "PASTE_YOUR_API_KEY_HERE"
    ) {

        throw new Error(
            "API key missing. Open app.js and paste your Gemini API key."
        );

    }


    const url =
        "https://generativelanguage.googleapis.com/v1beta/models/" +
        GEMINI_MODEL +
        ":generateContent";


    const response = await fetch(url, {

        method: "POST",

        headers: {

            "Content-Type": "application/json",

            "x-goog-api-key": GEMINI_API_KEY

        },

        body: JSON.stringify({

            contents: [

                {

                    parts: [

                        {
                            text: prompt
                        }

                    ]

                }

            ]

        })

    });


    const data = await response.json();


    console.log(
        "Gemini response:",
        data
    );


    if (!response.ok) {

        let message =
            data &&
            data.error &&
            data.error.message
                ? data.error.message
                : "Gemini API request failed.";

        throw new Error(
            message
        );

    }


    const text =
        data &&
        data.candidates &&
        data.candidates[0] &&
        data.candidates[0].content &&
        data.candidates[0].content.parts &&
        data.candidates[0].content.parts[0] &&
        data.candidates[0].content.parts[0].text;


    if (!text) {

        throw new Error(
            "Gemini returned an empty response."
        );

    }


    return text;

}


// =====================================================
// GENERATE CONTENT
// =====================================================

async function generateContent() {

    const input =
        document.getElementById("topicInput");

    const output =
        document.getElementById("outputContainer");

    const button =
        document.getElementById("generateBtn");

    const status =
        document.getElementById("statusText");


    if (!input || !output) {

        console.error(
            "Required HTML elements not found."
        );

        return;

    }


    const topic =
        input.value.trim();


    if (!topic) {

        output.innerHTML =
            '<div class="api-error">' +
            'Please enter a topic first.' +
            '</div>';

        input.focus();

        return;

    }


    let prompt = "";


    // NOTES

    if (currentTab === "notes") {

        prompt =
            "Create clear and detailed BCA study notes on: " +
            topic +
            ". Include definition, important concepts, " +
            "examples, advantages, disadvantages, exam points " +
            "and a short revision summary. Use simple language.";

    }


    // QUIZ

    else if (currentTab === "quiz") {

        prompt =
            "Create 10 multiple choice questions about " +
            topic +
            " for BCA students. " +
            "Give four options A, B, C and D. " +
            "After every question provide the correct answer " +
            "and a short explanation.";

    }


    // PPT

    else if (currentTab === "ppt") {

        prompt =
            "Create an 8-slide college presentation about " +
            topic +
            ". For every slide provide slide title, " +
            "important bullet points and speaker notes.";

    }


    // PYQ

    else if (currentTab === "pyq") {

        prompt =
            "Create a BCA practice question paper about " +
            topic +
            ". Include 5 short questions, 5 long questions " +
            "and 5 MCQs. Provide answers after the questions. " +
            "Clearly mention that these are practice questions.";

    }


    output.innerHTML =
        '<div class="loading">' +
        '<div class="spinner"></div>' +
        'Generating content...' +
        '</div>';


    if (status) {
        status.textContent = "AI is working...";
    }


    if (button) {
        button.disabled = true;
        button.textContent = "Generating...";
    }


    try {

        const result =
            await callGeminiAPI(prompt);


        output.textContent =
            result;


        if (status) {
            status.textContent =
                "Generated successfully ✓";
        }


    }

    catch (error) {

        console.error(
            "Generate error:",
            error
        );


        showError(
            output,
            error
        );


        if (status) {
            status.textContent =
                "Generation failed";
        }

    }


    if (button) {

        button.disabled = false;

        button.textContent =
            "Generate ✨";

    }

}


// =====================================================
// DOUBT SOLVER
// =====================================================

async function solveDoubt() {

    const input =
        document.getElementById("doubtInput");

    const output =
        document.getElementById("doubtOutput");

    const button =
        document.getElementById("solveBtn");


    if (!input || !output) return;


    const question =
        input.value.trim();


    if (!question) {

        output.innerHTML =
            '<div class="api-error">' +
            'Please enter your doubt first.' +
            '</div>';

        return;

    }


    output.innerHTML =
        '<div class="loading">' +
        '<div class="spinner"></div>' +
        'AI is solving your doubt...' +
        '</div>';


    if (button) {

        button.disabled = true;

        button.textContent =
            "Solving...";

    }


    const prompt =
        "You are a helpful BCA tutor. " +
        "Solve this student question clearly. " +
        "Explain step by step when necessary. " +
        "Use simple language and examples.\n\n" +
        "Question:\n" +
        question;


    try {

        const result =
            await callGeminiAPI(prompt);


        output.textContent =
            result;

    }

    catch (error) {

        showError(
            output,
            error
        );

    }


    if (button) {

        button.disabled = false;

        button.textContent =
            "🚀 Solve My Doubt";

    }

}


// =====================================================
// ERROR DISPLAY
// =====================================================

function showError(element, error) {

    if (!element) return;


    const message =
        error && error.message
            ? error.message
            : "Unknown error occurred.";


    element.innerHTML =
        '<div class="api-error">' +
        '<strong>⚠️ AI Request Failed</strong>' +
        '<br><br>' +
        escapeHTML(message) +
        '<br><br>' +
        'Check your API key and internet connection.' +
        '</div>';

}


// =====================================================
// COPY
// =====================================================

async function copyOutput() {

    const output =
        document.getElementById("outputContainer");


    if (!output) return;


    const text =
        output.innerText.trim();


    if (!text) {

        alert(
            "Nothing to copy."
        );

        return;

    }


    try {

        await navigator.clipboard.writeText(
            text
        );


        const button =
            document.getElementById("copyBtn");


        if (button) {

            button.textContent =
                "✓ Copied";

            setTimeout(
                function () {

                    button.textContent =
                        "📋 Copy";

                },
                1500
            );

        }

    }

    catch {

        alert(
            "Copy failed."
        );

    }

}


// =====================================================
// REGISTRATION
// =====================================================

function setupRegistration() {

    const form =
        document.getElementById(
            "registrationForm"
        );


    if (!form) {

        console.error(
            "Registration form not found."
        );

        return;

    }


    form.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const name =
                document
                    .getElementById("regName")
                    .value
                    .trim();


            const email =
                document
                    .getElementById("regEmail")
                    .value
                    .trim();


            const phone =
                document
                    .getElementById("regPhone")
                    .value
                    .trim();


            if (!name || !email || !phone) {

                showRegistrationMessage(
                    "Please fill all fields.",
                    true
                );

                return;

            }


            if (!/^[0-9]{10}$/.test(phone)) {

                showRegistrationMessage(
                    "Please enter a valid 10-digit phone number.",
                    true
                );

                return;

            }


            const user = {

                name: name,

                email: email,

                phone: phone,

                registeredAt:
                    new Date().toISOString()

            };


            try {

                localStorage.setItem(
                    "eduai_user",
                    JSON.stringify(user)
                );


                showRegistrationMessage(
                    "Registration successful! Welcome " +
                    name +
                    " 🎉",
                    false
                );


                form.reset();

            }

            catch (error) {

                console.error(
                    "Registration error:",
                    error
                );


                showRegistrationMessage(
                    "Registration could not be saved in this browser.",
                    true
                );

            }

        }
    );


    // SHOW SAVED USER

    try {

        const saved =
            localStorage.getItem(
                "eduai_user"
            );


        if (saved) {

            const user =
                JSON.parse(saved);


            showRegistrationMessage(
                "Welcome back, " +
                user.name +
                "! 👋",
                false
            );

        }

    }

    catch {

        localStorage.removeItem(
            "eduai_user"
        );

    }

}


function showRegistrationMessage(
    message,
    isError
) {

    const box =
        document.getElementById(
            "registrationStatus"
        );


    if (!box) return;


    box.textContent =
        message;


    box.style.marginTop =
        "15px";


    box.style.fontWeight =
        "600";


    box.style.color =
        isError
            ? "#dc2626"
            : "#15803d";

}


// =====================================================
// REVIEWS
// =====================================================

function setupFeedback() {

    const stars =
        document.querySelectorAll(
            "#ratingStars span"
        );


    stars.forEach(function (star) {

        star.addEventListener(
            "click",
            function () {

                setRating(
                    Number(
                        star.dataset.rating
                    )
                );

            }
        );

    });


    const form =
        document.getElementById(
            "feedbackForm"
        );


    if (!form) return;


    form.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const text =
                document
                    .getElementById(
                        "feedbackText"
                    )
                    .value
                    .trim();


            if (!text) return;


            let user = null;


            try {

                user =
                    JSON.parse(
                        localStorage.getItem(
                            "eduai_user"
                        )
                    );

            }

            catch {

                user = null;

            }


            const review = {

                name:
                    user && user.name
                        ? user.name
                        : "Anonymous Student",

                rating:
                    selectedRating,

                text:
                    text,

                date:
                    new Date().toLocaleDateString()

            };


            let reviews = [];


            try {

                reviews =
                    JSON.parse(
                        localStorage.getItem(
                            "eduai_reviews"
                        )
                    ) || [];

            }

            catch {

                reviews = [];

            }


            reviews.unshift(
                review
            );


            localStorage.setItem(
                "eduai_reviews",
                JSON.stringify(reviews)
            );


            document.getElementById(
                "feedbackText"
            ).value = "";


            loadReviews();

        }
    );

}


function setRating(rating) {

    selectedRating =
        rating;


    document
        .querySelectorAll(
            "#ratingStars span"
        )
        .forEach(function (star) {

            const value =
                Number(
                    star.dataset.rating
                );


            if (value <= rating) {

                star.classList.add(
                    "active"
                );

            }

            else {

                star.classList.remove(
                    "active"
                );

            }

        });

}


function loadReviews() {

    const container =
        document.getElementById(
            "reviewsList"
        );


    if (!container) return;


    let reviews = [];


    try {

        reviews =
            JSON.parse(
                localStorage.getItem(
                    "eduai_reviews"
                )
            ) || [];

    }

    catch {

        reviews = [];

    }


    if (reviews.length === 0) {

        container.innerHTML =
            `
            <div class="review">

                <div class="review-name">
                    Abhiraj Kumar

                    <span class="review-stars">
                        ★★★★★
                    </span>
                </div>

                <div class="review-text">
                    Very helpful AI tools for study and exam preparation.
                </div>

            </div>
            `;

        return;

    }


    container.innerHTML =
        reviews.map(function (review) {

            return `
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
            `;

        }).join("");

}


// =====================================================
// SUBSCRIBE
// =====================================================

function setupSubscribe() {

    const form =
        document.getElementById(
            "subscribeForm"
        );


    if (!form) return;


    form.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const input =
                document.getElementById(
                    "subEmail"
                );


            const status =
                document.getElementById(
                    "subStatus"
                );


            const email =
                input.value.trim();


            if (!email) return;


            let subscribers = [];


            try {

                subscribers =
                    JSON.parse(
                        localStorage.getItem(
                            "eduai_subscribers"
                        )
                    ) || [];

            }

            catch {

                subscribers = [];

            }


            if (!subscribers.includes(email)) {

                subscribers.push(
                    email
                );

            }


            localStorage.setItem(
                "eduai_subscribers",
                JSON.stringify(
                    subscribers
                )
            );


            if (status) {

                status.textContent =
                    "✓ Successfully subscribed!";

                status.style.marginTop =
                    "10px";

            }


            input.value = "";

        }
    );

}


// =====================================================
// SECURITY
// =====================================================

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}
```

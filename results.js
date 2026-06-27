const data = JSON.parse(sessionStorage.getItem("vmrResults"));

if (!data) {
    alert("No analysis found.");
    window.location.href = "index.html";
}

document.querySelector(".results-summary").textContent = data.summary;

document.querySelector(".score-number").textContent =
    `${data.riskScore}/100`;

const level = document.getElementById("riskLevel");

if (data.riskScore >= 70) {
    level.textContent = "High Risk";
} else if (data.riskScore >= 40) {
    level.textContent = "Moderate Risk";
} else {
    level.textContent = "Low Risk";
}

const container = document.getElementById("redFlagsContainer");

container.innerHTML = "";

// Show Red Flags
data.redFlags.forEach(flag => {

    const card = document.createElement("div");
    card.className = "card red";

    card.innerHTML = `
        <div class="risk-tag high-risk">
            FLAG
        </div>

        <h2>⚠️ Warning</h2>

        <p>${flag}</p>
    `;

    container.appendChild(card);

});

// Privacy Concerns
data.dataPrivacyConcerns.forEach(item => {

    const card = document.createElement("div");

    card.className = "card yellow";

    card.innerHTML = `
        <div class="risk-tag medium-risk">
            PRIVACY
        </div>

        <h2>🔒 Privacy</h2>

        <p>${item}</p>
    `;

    container.appendChild(card);

});

// Suggestions
data.suggestions.forEach(item => {

    const card = document.createElement("div");

    card.className = "card green";

    card.innerHTML = `
        <div class="risk-tag low-risk">
            SUGGESTION
        </div>

        <h2>✅ Recommendation</h2>

        <p>${item}</p>
    `;

    container.appendChild(card);

});

sessionStorage.setItem("reportData", JSON.stringify(data));

function animateScore(score){

const el=document.querySelector(".score-number");

let current=0;

const timer=setInterval(()=>{

current++;

el.textContent=current+"/100";

if(current>=score){

clearInterval(timer);

}

},15);

}

animateScore(data.riskScore);

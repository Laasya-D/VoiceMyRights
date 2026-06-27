const data = JSON.parse(sessionStorage.getItem("vmrResults"));

if (!data) {
    alert("No report found.");
    window.location.href = "index.html";
}

// Score
document.querySelector(".report-number").textContent =
    `${data.riskScore}/100`;

// Risk text
const riskText = document.getElementById("riskText");

if (data.riskScore >= 70)
    riskText.textContent = "High Risk";
else if (data.riskScore >= 40)
    riskText.textContent = "Moderate Risk";
else
    riskText.textContent = "Low Risk";

// Summary
document.getElementById("summaryText").textContent =
    data.summary;

// Pills
const pillContainer = document.getElementById("pillContainer");

data.redFlags.forEach(flag => {

    const pill = document.createElement("div");

    pill.className = "risk-pill red-pill";

    pill.textContent = flag;

    pillContainer.appendChild(pill);

});

// Warning list
const warningList = document.getElementById("warningList");

data.redFlags.forEach(flag => {

    const li = document.createElement("li");

    li.textContent = flag;

    warningList.appendChild(li);

});

// Suggestions
const suggestionList = document.getElementById("suggestionList");

data.suggestions.forEach(tip => {

    const li = document.createElement("li");

    li.textContent = tip;

    suggestionList.appendChild(li);

});


// Download
document.querySelector(".download-btn").addEventListener("click", () => {

    window.print();

});


// Share
document.querySelector(".share-btn").addEventListener("click", async () => {

    const text =
`VoiceMyRights Report

Risk Score: ${data.riskScore}/100

Summary:
${data.summary}`;

    if (navigator.share) {

        await navigator.share({

            title: "VoiceMyRights Report",

            text

        });

    } else {

        await navigator.clipboard.writeText(text);

        alert("Report copied to clipboard!");

    }

});
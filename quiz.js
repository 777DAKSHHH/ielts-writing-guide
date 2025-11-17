document.addEventListener('DOMContentLoaded', () => {
    // Generate and display Task ID on page load
    function generateTaskId() {
        const prefix = "77:77:77:77:";
        const storedId = localStorage.getItem("taskCounter") || "00";
        let next = String(Number(storedId) + 1).padStart(2, "0");
        localStorage.setItem("taskCounter", next);
        return `${prefix}${next}:D`;
    }

    const taskId = generateTaskId();
    const taskIdDisplay = document.getElementById("taskIdDisplay");
    if(taskIdDisplay) taskIdDisplay.textContent = taskId;
});

function checkQuiz() {
    const answers = {
        q1: 'a',
        q2: 'b',
        q3: 'b',
        q4: 'b',
        q5: 'a',
        q6: 'a',
        q7: 'c',
        q8: 'a',
        q9: 'b',
        q10: 'b',
        q11: 'a',
        q12: 'b',
        q13: 'b',
        q14: 'b',
        q15: 'b',
    };

    let score = 0;
    const totalQuestions = Object.keys(answers).length;
    const wrongQuestions = [];
    let unansweredCount = 0;

    // Reset styles from previous submissions
    document.querySelectorAll('.options label').forEach(label => {
        label.classList.remove('correct', 'wrong');
    });

    for (let i = 1; i <= totalQuestions; i++) {
        const questionName = `q${i}`;
        const correctAnswerValue = answers[questionName];
        
        const selectedRadio = document.querySelector(`input[name="${questionName}"]:checked`);
        const allOptions = document.querySelectorAll(`input[name="${questionName}"]`);

        // Always highlight the correct answer in green
        allOptions.forEach(radio => {
            if (radio.value === correctAnswerValue) {
                radio.parentElement.classList.add('correct');
            }
        });

        if (selectedRadio) {
            if (selectedRadio.value === correctAnswerValue) {
                score++;
            } else {
                wrongQuestions.push(`Q${i}`);
                // If a wrong answer was selected, highlight it in red
                selectedRadio.parentElement.classList.add('wrong');
            }
        } else {
            // If no answer was selected for a question
            unansweredCount++;
            wrongQuestions.push(`Q${i} (missed)`);
        }
    }

    // --- Push results to Firebase ---
    function submitQuizResults(score, total, wrongQs, missedCount) {
        const taskId = document.getElementById("taskIdDisplay").textContent;
        if (!taskId) {
            console.error("Task ID not found. Cannot submit results.");
            return;
        }

        window.firebaseSet(window.firebaseRef(window.db, "quizResults/" + taskId), {
            taskId: taskId,
            correct: ((score / total) * 100).toFixed(1) + "%",
            incorrect: (((total - score - missedCount) / total) * 100).toFixed(1) + "%",
            missed: ((missedCount / total) * 100).toFixed(1) + "%",
            wrongQuestions: wrongQs.join(", ") || "None"
        })
        .then(() => console.log("✅ Successfully pushed task:", taskId))
        .catch(err => console.error("❌ Firebase error:", err.message));
    }

    submitQuizResults(score, totalQuestions, wrongQuestions, unansweredCount);

    const resultBox = document.getElementById("resultBox");
    resultBox.style.display = "block";
    resultBox.innerHTML = `
      <h2>Your Score: ${score} / ${totalQuestions}</h2>
      <p>Great job! Review your answers above.</p>
    `;

    document.getElementById("downloadBtn").style.display = "inline-block";
    resultBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
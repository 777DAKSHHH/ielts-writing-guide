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
        q1: 'B',
        q2: 'C',
        q3: 'B',
        q4: 'C',
        q5: 'A',
        q6: 'B',
        q7: 'C'
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

    document.getElementById("resultBox").style.display = "block";
    document.getElementById("resultBox").innerHTML = `You scored ${score} out of ${totalQuestions}.`;

    document.getElementById("downloadBtn").style.display = "inline-block";
}
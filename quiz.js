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
                // If a wrong answer was selected, highlight it in red
                selectedRadio.parentElement.classList.add('wrong');
            }
        }
    }

    document.getElementById("resultBox").style.display = "block";
    document.getElementById("resultBox").innerHTML = `You scored ${score} out of ${totalQuestions}.`;

    document.getElementById("downloadBtn").style.display = "inline-block";
}
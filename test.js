document.addEventListener('DOMContentLoaded', function() {
    const questionTitle = document.getElementById('questionTitle');
    const questionDescription = document.getElementById('questionDescription');
    const answerInput = document.getElementById('answerInput');
    const nextQuestionBtn = document.getElementById('nextQuestionBtn');
    const submitBtn = document.getElementById('submitBtn');
    const nameBox = document.getElementById('nameBox');
    const studentIdBox = document.getElementById('studentIdBox');
    const previousQuestionBtn = document.getElementById('previousQuestionBtn');

    let currentQuestionNumber = 1;
    let startTime = Date.now();

    // 타이머 업데이트 함수
    function updateTimer() {
        const timer = document.getElementById('timer');
        const seconds = Math.floor((Date.now() - startTime) / 1000);
        timer.textContent = new Date(seconds * 1000).toISOString().substr(11, 8);
    }
    setInterval(updateTimer, 1000);

    const userData = JSON.parse(localStorage.getItem('userData'));

    // 인적사항 로드
    function loadInfo() {
        nameBox.textContent = userData.name;
        studentIdBox.textContent = userData.age;
    }

    // 문제를 불러오는 함수
    function loadQuestion(testType, questionNumber) {
        fetch(`https://pron.underconnor.me/api/getQuestion/${testType}/${questionNumber}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const question = data.question;
                    questionTitle.textContent = question.title;
                    questionDescription.textContent = question.description;
                } else {
                    console.error('Failed to load question');
                }
            })
            .catch(error => console.error('Error fetching question:', error));
    }

    // 페이지 로드 시 인적사항 및 문제 유형 로드
    if (userData) {
        loadInfo();
        const savedTestType = userData.testType;
        if (savedTestType) {
            loadQuestion(savedTestType, currentQuestionNumber);
        } else {
            console.error('Failed to load test type from local storage');
        }
    } else {
        console.error('Failed to load user data from local storage');
    }

    previousQuestionBtn.addEventListener('click', function() {
        if (currentQuestionNumber > 1) {
            currentQuestionNumber--;
            const savedTestType = userData.testType;
            if (savedTestType) {
                loadQuestion(savedTestType, currentQuestionNumber);
                localStorage.setItem(`answer2`, answerInput.value.trim());
                // 이전 답안을 로컬 저장소에서 불러와서 입력창에 표시
                const previousAnswer = localStorage.getItem(`answer${currentQuestionNumber}`);
                answerInput.value = previousAnswer ? previousAnswer : ''; // 이전에 입력된 답안이 있으면 표시하고, 없으면 비움
                submitBtn.style.display = 'none'; // 제출 버튼 숨기기
                previousQuestionBtn.style.display = 'none';
                nextQuestionBtn.style.display = 'block'; // 다음 문제 버튼 표시
            } else {
                console.error('Failed to load test type from local storage');
            }
        }
    });


    nextQuestionBtn.addEventListener('click', function() {
        currentQuestionNumber++;
        if (currentQuestionNumber <= 2) {
            const savedTestType = userData.testType;
            if (savedTestType) {
                loadQuestion(savedTestType, currentQuestionNumber);
                // 이전 답안을 저장
                const previousAnswer = answerInput.value.trim();
                // 이전 답안을 로컬 저장소에 저장
                localStorage.setItem(`answer${currentQuestionNumber - 1}`, previousAnswer);
                // 다음 문제에 대한 답안을 로드하여 입력창에 표시
                const nextAnswer = localStorage.getItem(`answer${currentQuestionNumber}`);
                answerInput.value = nextAnswer ? nextAnswer : ''; // 이전에 입력된 답안이 있으면 표시하고, 없으면 비움

                // 2번 문제 페이지로 이동할 때 제출 버튼 표시
                if (currentQuestionNumber === 2) {
                    nextQuestionBtn.style.display = 'none'; // 다음 문제 버튼 숨기기
                    submitBtn.style.display = 'block'; // 제출 버튼 표시
                    previousQuestionBtn.style.display = 'block'; // 이전 문제 버튼 표시
                }
            } else {
                console.error('Failed to load test type from local storage');
            }
        } else {
            console.error('Already at the last question');
        }
    });




    // 제출 버튼 클릭 시
    submitBtn.addEventListener('click', function() {
        const answer = answerInput.value.trim();
        if (answer) {
            localStorage.setItem(`answer2`, answerInput.value.trim());
            // 로컬 저장소에 있는 모든 답안들을 txt 파일로 저장
            const userData = JSON.parse(localStorage.getItem('userData'));
            const savedAnswers = [];
            const info = [userData.age,userData.name,userData.testType];
            savedAnswers.push(info);
            for (let i = 1; i <= 2; i++) {
                const savedAnswer = localStorage.getItem(`answer${i}`);
                if (savedAnswer) {
                    savedAnswers.push(savedAnswer);
                }
            }
            const textContent = savedAnswers.join('\n');
            downloadTxtFile(textContent, 'backup.txt'); // txt 파일 다운로드 함수 호출

            fetch('https://pron.underconnor.me/api/submitAnswers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    testType: info.join(''),
                    answers: savedAnswers
                })
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    console.log(data);
                    window.location.href = 'success.html';
                })
                .catch(error => {
                    console.error('Error submitting answers:', error);
                });
            answerInput.value = ''; // 답안 입력창 초기화
        } else {
            alert('답안을 입력해주세요.');
        }
    });
});

function downloadTxtFile(content, filename) {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}
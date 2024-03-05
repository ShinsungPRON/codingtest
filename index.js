document.addEventListener('DOMContentLoaded', function() {
    const startBtn = document.getElementById('startBtn');
    const userCodeInput = document.getElementById('userCode');

    // 로컬 스토리지에 데이터 저장 함수
    function saveToLocalStorage(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    // 테스트 시작 버튼 이벤트 리스너
    startBtn.addEventListener('click', function() {
        const userCode = userCodeInput.value.trim();
        if (userCode) {
            // 백엔드 서버에 GET 요청을 보냄
            fetch(`https://pron.underconnor.me/api/getUserData?userCode=${userCode}`)
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        // 인적사항과 문항 유형을 로컬 스토리지에 저장
                        saveToLocalStorage('userData', data.userData);
                        window.location.href = 'test.html'; // 테스트 페이지로 이동
                    } else {
                        alert('유효하지 않은 고유 코드입니다.');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('서버에 연결할 수 없습니다.');
                });
        } else {
            alert('고유 코드를 입력해주세요.');
        }
    });
});

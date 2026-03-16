# Lucky Diary Prototype

럭키 다이어리 앱 서비스 기획을 반영한 독립형 모바일 프로토타입입니다.

## Run

```bash
cd /Users/heoh3/Documents/cash/prototype-calendar
npm install
python3 -m http.server 4173
```

브라우저에서 `http://localhost:4173` 를 열면 됩니다.
이미 사용 중인 포트라면 `4174` 같은 다른 포트로 바꿔 실행하면 됩니다.

정적 빌드 확인이 필요하면 아래도 가능합니다.

```bash
cd /Users/heoh3/Documents/cash/prototype-calendar
npm run build
```

주요 체험 포인트:

- 오늘의 기록 작성 후 광고 로딩과 보상 팝업 확인
- 특별 행운 스티커로 보상 강화
- 일정 등록 후 응원받기와 레어 스티커 강화
- 미래 날짜 선택 후 행운 미리보기 잠금 해제

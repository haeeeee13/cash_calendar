const weekdayRow = document.getElementById("weekdayRow");
const calendarGrid = document.getElementById("calendarGrid");
const calendarTitle = document.getElementById("calendarTitle");
const streakRow = document.getElementById("streakRow");
const bonusChip = document.getElementById("bonusChip");
const pointBalance = document.getElementById("pointBalance");
const selectedDateLabel = document.getElementById("selectedDateLabel");
const contextEyebrow = document.getElementById("contextEyebrow");
const contextTitle = document.getElementById("contextTitle");
const contextBody = document.getElementById("contextBody");
const scheduleBody = document.getElementById("scheduleBody");
const overlay = document.getElementById("overlay");
const modalShell = document.getElementById("modalShell");
const dayTemplate = document.getElementById("dayTemplate");
const prevMonthButton = document.getElementById("prevMonthButton");
const nextMonthButton = document.getElementById("nextMonthButton");
const openScheduleButton = document.getElementById("openScheduleButton");

const weekdays = ["월", "화", "수", "목", "금", "토", "일"];
const todayKey = "2026-03-13";
const moodOptions = [
  { key: "good", label: "좋음", icon: "😄" },
  { key: "normal", label: "보통", icon: "🙂" },
  { key: "bad", label: "나쁨", icon: "🥲" },
];
const categories = ["면접", "데이트", "미팅", "여행", "공부", "일상"];
const timeOptions = Array.from({ length: 24 }, (_, hour) => `${String(hour).padStart(2, "0")}:00`);
const stickerCatalog = {
  common: ["🍀", "🌤", "🧸", "☕", "🫧"],
  special: ["👑", "🦄", "✨", "🌈", "💎"],
  schedule: ["🎯", "💼", "💌", "✈️", "📚", "🌿"],
};
const fortuneMessages = [
  "작은 기록 하나가 오늘의 흐름을 부드럽게 바꿔줘요.",
  "너무 완벽하려 하지 않을수록 좋은 기회가 가까워져요.",
  "오늘 적은 메모가 저녁의 기분을 더 환하게 만들어요.",
  "지금의 솔직한 감정이 행운을 끌어당기는 포인트예요.",
];
const weatherByDate = {
  "2026-03-13": "맑음 18°C",
  "2026-03-14": "구름 많음 16°C",
  "2026-03-15": "봄비 14°C",
  "2026-03-16": "맑음 17°C",
  "2026-03-17": "바람 13°C",
};

const state = {
  currentMonth: new Date("2026-03-01T00:00:00"),
  selectedDateKey: todayKey,
  points: 1260,
  selectedMood: null,
  draftMemo: "",
  streak: [
    { day: "1일", icon: "✅", complete: true },
    { day: "2일", icon: "✅", complete: true },
    { day: "3일", icon: "+30P", bonus: true, complete: true },
    { day: "4일", icon: "✅", complete: true },
    { day: "5일", icon: "✅", complete: true },
    { day: "6일", icon: "오늘", today: true, complete: false },
    { day: "7일", icon: "+70P", bonus: true, complete: false },
  ],
  entries: {
    "2026-03-10": {
      mood: "좋음",
      memo: "미뤄둔 정리를 끝내서 마음이 가벼웠다.",
      fortune: "정리된 공간이 새로운 제안을 불러와요.",
      weather: "맑음 15°C",
      points: 40,
      sticker: { icon: "🍀", rarity: "common", name: "클로버" },
      preview: false,
    },
    "2026-03-12": {
      mood: "보통",
      memo: "오후에 차분하게 회의 준비를 마쳤다.",
      fortune: "차분한 준비가 좋은 결과로 이어져요.",
      weather: "구름 17°C",
      points: 40,
      sticker: { icon: "👑", rarity: "legendary", name: "황금 왕관" },
      preview: false,
    },
  },
  schedules: [
    {
      id: 1,
      title: "브랜드 미팅",
      category: "미팅",
      date: "2026-03-16",
      time: "14:00",
      cheered: false,
      sticker: null,
      points: 0,
    },
  ],
};

function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateKey(key) {
  return new Date(`${key}T00:00:00`);
}

function formatDisplayDate(key) {
  const date = parseDateKey(key);
  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
}

function formatMonthTitle(date) {
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
}

function getMonthDays(date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const offset = (firstDay.getDay() + 6) % 7;
  const totalCells = 35 + Number(offset + lastDay.getDate() > 35) * 7;
  const start = new Date(firstDay);
  start.setDate(firstDay.getDate() - offset);

  return Array.from({ length: totalCells }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    return day;
  });
}

function compareDateKey(left, right) {
  return parseDateKey(left).getTime() - parseDateKey(right).getTime();
}

function getDateContext(key) {
  if (key === todayKey) {
    return "today";
  }
  return compareDateKey(key, todayKey) > 0 ? "future" : "past";
}

function getHighestSticker(key) {
  const entrySticker = state.entries[key]?.sticker;
  const scheduleStickers = state.schedules
    .filter((item) => item.date === key && item.sticker)
    .map((item) => item.sticker);

  const all = [entrySticker, ...scheduleStickers].filter(Boolean);
  if (!all.length) {
    return null;
  }
  return all.sort((left, right) => rarityWeight(right.rarity) - rarityWeight(left.rarity))[0];
}

function rarityWeight(rarity) {
  if (rarity === "legendary") {
    return 3;
  }
  if (rarity === "rare") {
    return 2;
  }
  return 1;
}

function randomFrom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function closeModal() {
  overlay.classList.add("hidden");
  modalShell.innerHTML = "";
}

function openModal(markup) {
  modalShell.innerHTML = markup;
  overlay.classList.remove("hidden");
}

function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  document.body.appendChild(toast);
  window.setTimeout(() => toast.remove(), 2200);
}

function addPoints(amount) {
  state.points += amount;
  renderTop();
}

function renderTop() {
  pointBalance.textContent = `${state.points}P`;
}

function renderWeekdays() {
  weekdayRow.innerHTML = "";
  weekdays.forEach((day) => {
    const node = document.createElement("span");
    node.textContent = day;
    weekdayRow.appendChild(node);
  });
}

function renderStreak(animated = false) {
  streakRow.innerHTML = "";
  state.streak.forEach((item, index) => {
    const day = document.createElement("div");
    day.className = "streak-day";
    day.innerHTML = `<small>${item.day}</small>`;

    const bubble = document.createElement("div");
    bubble.className = "streak-bubble";
    bubble.textContent = item.complete ? "✓" : item.icon;

    if (item.complete) {
      bubble.classList.add("done");
    }
    if (item.today) {
      bubble.classList.add("today");
    }
    if (item.bonus) {
      bubble.classList.add("bonus");
    }
    if (animated && index === 5) {
      bubble.classList.add("active-pulse");
    }

    day.appendChild(bubble);
    streakRow.appendChild(day);
  });

  const completedCount = state.streak.filter((item) => item.complete).length;
  if (completedCount >= 7) {
    bonusChip.textContent = "7일 보너스 달성!";
  } else if (completedCount >= 6) {
    bonusChip.textContent = "3일 보너스 수령 완료";
  } else {
    bonusChip.textContent = "3일 보너스 대기";
  }
}

function renderCalendar() {
  calendarTitle.textContent = formatMonthTitle(state.currentMonth);
  calendarGrid.innerHTML = "";

  getMonthDays(state.currentMonth).forEach((date) => {
    const key = formatDateKey(date);
    const context = getDateContext(key);
    const highestSticker = getHighestSticker(key);
    const entry = state.entries[key];
    const previewUnlocked = Boolean(entry?.preview);
    const cell = dayTemplate.content.firstElementChild.cloneNode(true);

    cell.querySelector(".day-number").textContent = `${date.getDate()}`;
    cell.querySelector(".day-sticker").textContent = highestSticker?.icon || (previewUnlocked ? "🔓" : "");
    cell.querySelector(".day-tag").textContent =
      highestSticker?.rarity === "legendary"
        ? "SPECIAL"
        : previewUnlocked
          ? "PREVIEW"
          : context === "future"
            ? "LOCKED"
            : entry
              ? "DONE"
              : "";

    if (date.getMonth() !== state.currentMonth.getMonth()) {
      cell.classList.add("is-other");
    }
    if (key === state.selectedDateKey) {
      cell.classList.add("is-selected");
    }
    if (context === "future") {
      cell.classList.add("is-future");
    }

    cell.addEventListener("click", () => {
      state.selectedDateKey = key;
      render();
    });
    calendarGrid.appendChild(cell);
  });
}

function renderRecordForm() {
  const moodButtons = moodOptions
    .map(
      (option) => `
        <button class="mood-button ${state.selectedMood === option.key ? "is-selected" : ""}" data-mood="${option.key}" type="button">
          <span class="mood-icon">${option.icon}</span>
          <span>${option.label}</span>
        </button>
      `
    )
    .join("");

  contextBody.innerHTML = `
    <div class="record-form">
      <p>좋음, 보통, 나쁨 중 하나를 선택하고 오늘의 한 줄을 남겨보세요. 메모는 비워둬도 돼요.</p>
      <div class="mood-row">${moodButtons}</div>
      <label class="input-label" for="memoInput">한 줄 일기 (선택)</label>
      <textarea id="memoInput" rows="4" placeholder="오늘 가장 기억에 남는 순간을 적어보세요.">${state.draftMemo}</textarea>
      <div class="action-row">
        <button class="primary-button" id="saveRecordButton" type="button">광고 보고 오늘의 행운 받기</button>
      </div>
    </div>
  `;

  contextBody.querySelectorAll("[data-mood]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedMood = button.dataset.mood;
      renderContext();
    });
  });

  contextBody.querySelector("#memoInput").addEventListener("input", (event) => {
    state.draftMemo = event.target.value;
  });

  contextBody.querySelector("#saveRecordButton").addEventListener("click", () => {
    if (!state.selectedMood) {
      showToast("기분을 먼저 선택해 주세요.");
      return;
    }
    startRewardFlow({
      type: "record",
      dateKey: todayKey,
      mood: moodOptions.find((item) => item.key === state.selectedMood)?.label,
      memo: state.draftMemo.trim(),
    });
  });
}

function renderRecordSummary(entry, key) {
  contextBody.innerHTML = `
    <div class="record-summary">
      <div class="record-summary-header">
        <div>
          <p class="eyebrow">Diary Complete</p>
          <h3>${entry.mood}의 하루가 저장됐어요</h3>
        </div>
        <div class="sticker-display ${entry.sticker.rarity === "legendary" ? "legendary" : ""}">
          <span>${entry.sticker.icon}</span>
        </div>
      </div>
      <p class="record-memo">${entry.memo || "메모 없이 기분만 기록한 날이에요."}</p>
      <div class="fortune-card">
        <strong>오늘의 운세</strong>
        <p>${entry.fortune}</p>
      </div>
      <div class="reward-grid">
        <span class="reward-pill">🪙 ${entry.points}P 적립</span>
        <span class="reward-pill">🌤 ${entry.weather}</span>
        <span class="reward-pill">🎁 ${entry.sticker.name}</span>
      </div>
      ${
        key === todayKey && entry.sticker.rarity !== "legendary"
          ? `<button class="reward-button legendary" id="upgradeTodayButton" type="button">특별 행운 스티커 받기</button>`
          : ""
      }
    </div>
  `;

  const upgradeButton = document.getElementById("upgradeTodayButton");
  if (upgradeButton) {
    upgradeButton.addEventListener("click", () => {
      startRewardFlow({ type: "record-upgrade", dateKey: key });
    });
  }
}

function renderFuturePreview(key, entry) {
  const unlocked = Boolean(entry?.preview);
  contextBody.innerHTML = `
    <div class="preview-card">
      <p>선택한 날짜는 미래 날짜예요. 광고를 시청하면 해당 날짜의 예보와 미리보기 포인트를 받을 수 있어요.</p>
      ${
        unlocked
          ? `
            <div class="fortune-card">
              <strong>내일의 행운 미리보기</strong>
              <p>${entry.fortune}</p>
            </div>
            <div class="reward-grid">
              <span class="reward-pill">🌦 ${entry.weather}</span>
              <span class="reward-pill">🪙 ${entry.points}P preview</span>
            </div>
          `
          : ""
      }
      <button class="calendar-preview-button" id="previewUnlockButton" type="button">
        ${unlocked ? "다시 보기" : "내일의 행운 미리보기 잠금 해제"}
      </button>
    </div>
  `;

  document.getElementById("previewUnlockButton").addEventListener("click", () => {
    startRewardFlow({ type: "preview", dateKey: key });
  });
}

function renderPastRecord(key, entry) {
  if (!entry) {
    contextBody.innerHTML = `
      <div class="schedule-empty">
        <p>이 날짜에는 아직 저장된 기록이 없어요. 캘린더에서 미래 날짜는 미리보기, 오늘은 기록 작성을 체험할 수 있어요.</p>
      </div>
    `;
    return;
  }
  renderRecordSummary(entry, key);
}

function renderContext() {
  const key = state.selectedDateKey;
  const context = getDateContext(key);
  const entry = state.entries[key];

  selectedDateLabel.textContent = formatDisplayDate(key);

  if (context === "today") {
    contextEyebrow.textContent = "Today";
    contextTitle.textContent = entry ? "오늘의 기록 요약" : "오늘의 기록";
    if (entry) {
      renderRecordSummary(entry, key);
    } else {
      renderRecordForm();
    }
    return;
  }

  if (context === "future") {
    contextEyebrow.textContent = "Future Preview";
    contextTitle.textContent = "내일의 행운 미리보기";
    renderFuturePreview(key, entry);
    return;
  }

  contextEyebrow.textContent = "Past Diary";
  contextTitle.textContent = "지난 기록 확인";
  renderPastRecord(key, entry);
}

function renderScheduleList() {
  if (!state.schedules.length) {
    scheduleBody.innerHTML = `
      <div class="schedule-empty">
        <h3>등록된 일정이 없어요</h3>
        <p>광고 보상과 함께 중요한 일정의 성공을 미리 응원받아 보세요.</p>
        <a class="empty-link" href="#" id="firstScheduleLink">첫 일정 등록하기</a>
      </div>
    `;

    document.getElementById("firstScheduleLink").addEventListener("click", (event) => {
      event.preventDefault();
      openScheduleForm();
    });
    return;
  }

  scheduleBody.innerHTML = `
    <div class="schedule-list">
      ${state.schedules
        .sort((left, right) => compareDateKey(left.date, right.date))
        .map(
          (item) => `
            <article class="schedule-item">
              <div class="schedule-item-top">
                <div>
                  <h3>${item.title}</h3>
                  <div class="schedule-meta">
                    <span class="category-pill">${item.category}</span>
                    <span class="time-chip">${formatDisplayDate(item.date)} ${item.time}</span>
                  </div>
                </div>
                <div class="sticker-display ${item.sticker?.rarity === "legendary" ? "legendary" : ""}">
                  <span>${item.sticker?.icon || "🎟️"}</span>
                </div>
              </div>
              <p>${item.cheered ? "응원 완료된 일정이에요. 스티커가 리스트와 캘린더에 반영됩니다." : "광고를 보고 성공 기원 스티커와 포인트를 받아보세요."}</p>
              <div class="schedule-actions">
                ${
                  item.cheered
                    ? `<span class="status-done">응원 완료</span>`
                    : `<button class="primary-button small" data-cheer-id="${item.id}" type="button">응원받기</button>`
                }
                ${
                  item.cheered && item.sticker?.rarity !== "legendary"
                    ? `<button class="reward-button" data-upgrade-id="${item.id}" type="button">레어 스티커로 강화하기</button>`
                    : ""
                }
                ${
                  item.sticker
                    ? `<span class="tag-chip">${item.sticker.name}</span>`
                    : `<span class="tag-chip">보상 대기</span>`
                }
              </div>
            </article>
          `
        )
        .join("")}
    </div>
  `;

  scheduleBody.querySelectorAll("[data-cheer-id]").forEach((button) => {
    button.addEventListener("click", () => {
      startRewardFlow({ type: "schedule", scheduleId: Number(button.dataset.cheerId) });
    });
  });

  scheduleBody.querySelectorAll("[data-upgrade-id]").forEach((button) => {
    button.addEventListener("click", () => {
      startRewardFlow({ type: "schedule-upgrade", scheduleId: Number(button.dataset.upgradeId) });
    });
  });
}

function render() {
  renderTop();
  renderStreak();
  renderCalendar();
  renderContext();
  renderScheduleList();
}

function createRewardPayload(flow) {
  if (flow.type === "preview") {
    const weather = weatherByDate[flow.dateKey] || "구름 15°C";
    return {
      title: "내일의 행운이 열렸어요",
      badge: "Preview Reward",
      points: 18,
      weather,
      fortune: "미리 준비한 계획이 내일의 리듬을 매끈하게 만들어요.",
      sticker: { icon: "🔓", rarity: "rare", name: "프리뷰 배지" },
      buttonText: "닫기",
      upgradeText: "",
    };
  }

  if (flow.type === "record-upgrade" || flow.type === "schedule-upgrade") {
    return {
      title: "특별 행운이 강화됐어요",
      badge: "Legendary Reward",
      points: flow.type === "record-upgrade" ? 70 : 55,
      weather: weatherByDate[todayKey],
      fortune: "오늘의 흐름이 반짝이듯 확장돼요. 자신 있게 움직여도 좋아요.",
      sticker: { icon: randomFrom(["👑", "🦄", "💎"]), rarity: "legendary", name: "전설 스티커" },
      buttonText: "닫기",
      upgradeText: "",
      legendary: true,
    };
  }

  if (flow.type === "schedule") {
    const schedule = state.schedules.find((item) => item.id === flow.scheduleId);
    return {
      title: `${schedule.title} 일정 응원 도착`,
      badge: "Cheer Reward",
      points: 28,
      weather: weatherByDate[schedule.date] || "맑음 17°C",
      fortune: `${schedule.category} 일정에 좋은 기운이 붙어요. 시작 10분 전에 한 번 더 체크해 보세요.`,
      sticker: { icon: randomFrom(stickerCatalog.schedule), rarity: "common", name: "응원 스티커" },
      buttonText: "닫기",
      upgradeText: "레어 스티커로 강화하기",
    };
  }

  const mood = flow.mood || "보통";
  return {
    title: "오늘의 기록 완료",
    badge: "Daily Reward",
    points: 42,
    weather: weatherByDate[flow.dateKey] || "맑음 18°C",
    fortune: `${mood} 기분으로 시작한 오늘, ${randomFrom(fortuneMessages)}`,
    sticker: { icon: randomFrom(stickerCatalog.common), rarity: "common", name: "행운 스티커" },
    buttonText: "닫기",
    upgradeText: "특별 행운 스티커 받기",
  };
}

function commitReward(flow, payload) {
  addPoints(payload.points);

  if (flow.type === "preview") {
    state.entries[flow.dateKey] = {
      preview: true,
      fortune: payload.fortune,
      weather: payload.weather,
      points: payload.points,
      sticker: null,
    };
    return;
  }

  if (flow.type === "record" || flow.type === "record-upgrade") {
    const existing = state.entries[flow.dateKey] || {};
    state.entries[flow.dateKey] = {
      ...existing,
      mood: flow.mood || existing.mood || "보통",
      memo: flow.memo !== undefined ? flow.memo : existing.memo,
      fortune: payload.fortune,
      weather: payload.weather,
      points: (existing.points || 0) + payload.points,
      sticker: payload.sticker,
      preview: false,
    };

    if (flow.type === "record") {
      state.streak[5].complete = true;
      state.streak[5].icon = "✓";
      if (!state.streak[6].complete) {
        addPoints(30);
        showToast("3일 보너스가 아닌, 오늘 출석 보상 +30P가 즉시 지급됐어요.");
      }
      renderStreak(true);
    }
    return;
  }

  const schedule = state.schedules.find((item) => item.id === flow.scheduleId);
  if (schedule) {
    schedule.cheered = true;
    schedule.points += payload.points;
    schedule.sticker = payload.sticker;
  }
}

function bindResultActions(flow, payload) {
  document.getElementById("closeResultButton").addEventListener("click", () => {
    closeModal();
    render();
  });

  const upgradeButton = document.getElementById("upgradeResultButton");
  if (upgradeButton) {
    upgradeButton.addEventListener("click", () => {
      const nextFlow =
        flow.type === "record"
          ? { type: "record-upgrade", dateKey: flow.dateKey }
          : { type: "schedule-upgrade", scheduleId: flow.scheduleId };
      startRewardFlow(nextFlow);
    });
  }
}

function showResultModal(flow, payload) {
  openModal(`
    <div class="modal-card">
      <div class="result-head">
        <div>
          <p class="eyebrow">Reward Result</p>
          <h3>${payload.title}</h3>
        </div>
        <span class="result-badge">${payload.badge}</span>
      </div>
      <div class="sticker-display ${payload.legendary ? "legendary" : ""}">
        <span>${payload.sticker.icon}</span>
      </div>
      <p>${payload.fortune}</p>
      <div class="modal-grid">
        <div class="modal-stat">
          <strong>포인트</strong>
          <span>+${payload.points}P</span>
        </div>
        <div class="modal-stat">
          <strong>날씨 정보</strong>
          <span>${payload.weather}</span>
        </div>
        <div class="modal-stat">
          <strong>행운 스티커</strong>
          <span>${payload.sticker.name}</span>
        </div>
        <div class="modal-stat">
          <strong>등급</strong>
          <span>${payload.sticker.rarity === "legendary" ? "전설" : payload.sticker.rarity === "rare" ? "레어" : "일반"}</span>
        </div>
      </div>
      <div class="modal-actions">
        <button class="ghost-button" id="closeResultButton" type="button">${payload.buttonText}</button>
        ${
          payload.upgradeText
            ? `<button class="reward-button ${flow.type.includes("upgrade") ? "legendary" : ""}" id="upgradeResultButton" type="button">${payload.upgradeText}</button>`
            : ""
        }
      </div>
    </div>
  `);

  bindResultActions(flow, payload);
}

function startRewardFlow(flow) {
  openModal(`
    <div class="modal-card loading">
      <div class="loading-orb">✨</div>
      <p class="eyebrow">Ad Loading</p>
      <h3>행운을 조합 중</h3>
      <p>광고 시청이 끝나면 포인트, 운세, 날씨, 스티커를 한 번에 받아볼 수 있어요.</p>
    </div>
  `);

  window.setTimeout(() => {
    const payload = createRewardPayload(flow);
    commitReward(flow, payload);
    showResultModal(flow, payload);
    render();
  }, 1100);
}

function openScheduleForm() {
  openModal(`
    <div class="modal-card">
      <div class="result-head">
        <div>
          <p class="eyebrow">New Schedule</p>
          <h3>중요한 일정 등록</h3>
        </div>
      </div>
      <label class="input-label" for="scheduleTitle">일정 이름</label>
      <input id="scheduleTitle" type="text" placeholder="예: 최종 면접" />

      <label class="input-label" for="scheduleCategory" style="margin-top:12px;">카테고리</label>
      <select id="scheduleCategory">
        ${categories.map((item) => `<option value="${item}">${item}</option>`).join("")}
      </select>

      <label class="input-label" for="scheduleDate" style="margin-top:12px;">날짜</label>
      <select id="scheduleDate">
        ${["2026-03-14", "2026-03-15", "2026-03-16", "2026-03-17", "2026-03-18"]
          .map((item) => `<option value="${item}">${formatDisplayDate(item)}</option>`)
          .join("")}
      </select>

      <label class="input-label" for="scheduleTime" style="margin-top:12px;">시간 (1시간 단위)</label>
      <select id="scheduleTime">
        ${timeOptions.map((item) => `<option value="${item}">${item}</option>`).join("")}
      </select>

      <div class="modal-actions">
        <button class="ghost-button" id="closeScheduleModal" type="button">취소</button>
        <button class="primary-button" id="saveScheduleModal" type="button">등록하기</button>
      </div>
    </div>
  `);

  document.getElementById("closeScheduleModal").addEventListener("click", closeModal);
  document.getElementById("saveScheduleModal").addEventListener("click", () => {
    const title = document.getElementById("scheduleTitle").value.trim();
    const category = document.getElementById("scheduleCategory").value;
    const date = document.getElementById("scheduleDate").value;
    const time = document.getElementById("scheduleTime").value;

    state.schedules.push({
      id: Date.now(),
      title: title || `${category} 일정`,
      category,
      date,
      time,
      cheered: false,
      sticker: null,
      points: 0,
    });
    closeModal();
    renderScheduleList();
    renderCalendar();
    showToast("일정이 등록됐어요. 이제 응원 보상을 받아볼 수 있어요.");
  });
}

function bindEvents() {
  prevMonthButton.addEventListener("click", () => {
    state.currentMonth = new Date(state.currentMonth.getFullYear(), state.currentMonth.getMonth() - 1, 1);
    renderCalendar();
  });

  nextMonthButton.addEventListener("click", () => {
    state.currentMonth = new Date(state.currentMonth.getFullYear(), state.currentMonth.getMonth() + 1, 1);
    renderCalendar();
  });

  openScheduleButton.addEventListener("click", openScheduleForm);
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) {
      closeModal();
    }
  });
}

renderWeekdays();
bindEvents();
render();

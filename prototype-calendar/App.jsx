import React, { useEffect, useMemo, useRef, useState } from 'react';
import { 
  Calendar as CalendarIcon, Star, ChevronLeft, ChevronRight, CheckCircle, Lock, 
  Smile, Frown, Meh, SunMedium, MapPin, X, Sparkles, Clock, Target,
  Trophy, Crown, ArrowUpCircle, Sparkle, ShoppingBag, User, Edit3, Trash2, Flame,
  Gift, Plus, ChevronRight as RightIcon, Stars
} from 'lucide-react';

const App = () => {
  // [설정] 오늘 날짜를 3월 12일로 고정
  const fixedToday = {
    year: 2026,
    month: 2, // 3월 (0-indexed)
    date: 12,
    key: '2026-03-12'
  };

  const todayKey = fixedToday.key;

  const moodIcons = {
    'sad_max': '😭', 'sad': '😢', 'normal': '🙂', 'happy': '😊', 'happy_max': '😍'
  };

  const categories = [
    { icon: '📝', label: '면접·시험' }, { icon: '❤️', label: '데이트·소개팅' },
    { icon: '💼', label: '미팅·업무' }, { icon: '✈️', label: '여행·나들이' },
    { icon: '💪', label: '공부·운동' }, { icon: '✨', label: '소소한 일상' }
  ];
  const weatherByOffset = {
    0: '☀️ 맑음, 15°C',
    1: '🌤️ 구름조금, 16°C',
    2: '⛅ 흐림, 14°C',
    3: '🌦️ 봄비, 13°C',
  };

  // 1. 상태 관리
  const [points, setPoints] = useState(1250);
  const [view, setView] = useState('main'); 
  const [activeTab, setActiveTab] = useState('캘린더');
  const [calendarMode, setCalendarMode] = useState('week'); 
  
  const [currentYear, setCurrentYear] = useState(fixedToday.year);
  const [currentMonth, setCurrentMonth] = useState(fixedToday.month); 
  const [selectedDateKey, setSelectedDateKey] = useState(todayKey);
  
  const [adPurpose, setAdPurpose] = useState('');
  const [activeScheduleId, setActiveScheduleId] = useState(null);
  const [preparingMsg, setPreparingMsg] = useState(null);
  const [claimedBonuses, setClaimedBonuses] = useState({ day3: false, day7: false });
  const [isEditingRecord, setIsEditingRecord] = useState(false);
  
  // [초기 데이터]
  const [allRecords, setAllRecords] = useState({
    '2026-03-09': { mood: 'normal', note: '평범한 월요일의 시작.', fortune: '차분하게 시작하는 것이 좋습니다.', recorded: true, specialClaimed: false, sticker: '🍀', weather: '☀️ 맑음' },
    '2026-03-11': { mood: 'happy_max', note: '레어 스티커를 뽑았다!', fortune: '당신의 밝은 기운이 주변을 비춥니다.', recorded: true, specialClaimed: true, sticker: '🍀', specialSticker: '👑', weather: '☁️ 구름조금' }
  });

  const [allSchedules, setAllSchedules] = useState({
    '2026-03-09': [
      { id: 101, category: '💼 미팅·업무', title: '미팅·업무', time: '10:00', cheered: true, sticker: '🍀', isRare: false, fortune: '차분한 목소리가 상대방에게 신뢰를 줄 것입니다.' },
      { id: 102, category: '✨ 소소한 일상', title: '소소한 일상', time: '18:00', cheered: false, sticker: null, isRare: false, fortune: null }
    ],
    '2026-03-11': [
      { id: 201, category: '📝 면접·시험', title: '면접·시험', time: '14:00', cheered: true, sticker: '👑', isRare: true, fortune: '당당한 태도가 행운을 부릅니다. 준비한 대로만 하세요!' },
      { id: 202, category: '💪 공부·운동', title: '공부·운동', time: '20:00', cheered: true, sticker: '🍀', isRare: false, fortune: '몸의 긴장을 풀면 마음의 행운이 찾아옵니다.' }
    ]
  });

  const [tempInput, setTempInput] = useState({ mood: null, note: '' });
  const [streak, setStreak] = useState([true, true, false, false, false, false, false]);
  const [newSchedule, setNewSchedule] = useState({ category: '✨ 소소한 일상', time: '09:00' });
  const [lastReward, setLastReward] = useState(null);
  const selectedTimeRef = useRef(null);
  const timeScrollerRef = useRef(null);

  // 날짜 정보 계산
  const dateInfo = useMemo(() => {
    const sel = new Date(selectedDateKey);
    const tod = new Date(todayKey);
    sel.setHours(0,0,0,0);
    tod.setHours(0,0,0,0);
    const diffDays = Math.round((sel.getTime() - tod.getTime()) / (1000 * 60 * 60 * 24));
    return {
      isToday: selectedDateKey === todayKey,
      isPast: sel < tod,
      isFuture: sel > tod,
      diffDays,
      canPreviewWeather: diffDays >= 0 && diffDays <= 3,
    };
  }, [selectedDateKey, todayKey]);

  // 캘린더 날짜 렌더링 데이터
  const calendarDays = useMemo(() => {
    if (calendarMode === 'month') {
      const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
      const days = [];
      const startPadding = (firstDayOfMonth + 6) % 7; 
      for (let i = 0; i < startPadding; i++) days.push(null);
      for (let d = 1; d <= daysInMonth; d++) {
        days.push({ day: d, key: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}` });
      }
      return days;
    } else {
      const selDate = new Date(selectedDateKey);
      const dayOfWeek = (selDate.getDay() + 6) % 7; 
      const startOfWeek = new Date(selDate);
      startOfWeek.setDate(selDate.getDate() - dayOfWeek);
      const days = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(startOfWeek);
        d.setDate(startOfWeek.getDate() + i);
        days.push({ day: d.getDate(), key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` });
      }
      return days;
    }
  }, [currentYear, currentMonth, calendarMode, selectedDateKey]);

  const currentRecord = allRecords[selectedDateKey] || { recorded: false };
  const currentSchedules = allSchedules[selectedDateKey] || [];
  const isThirdDayBonusReady = streak[2] && !claimedBonuses.day3;
  const hasActualRecord = Boolean(currentRecord.recorded && !currentRecord.previewOnly);
  const isFuturePreview = Boolean(currentRecord.previewOnly);
  const isTodayCheckComplete = streak[2];
  const canSubmitTodayRecord = Boolean(tempInput.mood);

  const getCalendarStateForDate = (dateKey) => {
    const record = allRecords[dateKey];
    const schedules = allSchedules[dateKey] || [];
    const hasRareRecord = Boolean(record?.specialClaimed);
    const hasRareSchedule = schedules.some((schedule) => schedule.isRare);
    const hasNormalSchedule = schedules.some((schedule) => schedule.cheered && !schedule.isRare);
    const hasRecordedTodayFortune = Boolean(record?.recorded);
    const hasNormalRecord = hasRecordedTodayFortune && !hasRareRecord;

    if (hasRareRecord && hasRareSchedule) return 'fortune_rare_schedule_rare';
    if (hasRareRecord && hasNormalSchedule) return 'fortune_rare_schedule_normal';
    if (hasNormalRecord && hasRareSchedule) return 'fortune_normal_schedule_rare';
    if (hasNormalRecord && hasNormalSchedule) return 'fortune_normal_schedule_normal';
    if (hasRareRecord) return 'fortune_rare';
    if (hasNormalRecord) return 'fortune_normal';
    if (hasRareSchedule) return 'schedule_rare';
    if (hasNormalSchedule) return 'schedule_normal';
    return 'empty';
  };

  const getFutureButtonText = useMemo(() => {
    const sel = new Date(selectedDateKey);
    const diffDays = dateInfo.diffDays;
    const suffix = dateInfo.canPreviewWeather ? '운세와 날씨 무료 확인' : '운세 무료 확인';
    if (diffDays === 1) return `내일 ${suffix}`;
    if (diffDays === 2) return `모레 ${suffix}`;
    return `${sel.getMonth() + 1}월 ${sel.getDate()}일 ${suffix}`;
  }, [dateInfo.canPreviewWeather, dateInfo.diffDays, selectedDateKey]);

  const getWeatherForDate = (dateKey) => {
    const sel = new Date(dateKey);
    const tod = new Date(todayKey);
    sel.setHours(0,0,0,0);
    tod.setHours(0,0,0,0);
    const diffDays = Math.round((sel.getTime() - tod.getTime()) / (1000 * 60 * 60 * 24));
    return weatherByOffset[diffDays] || '🌥️ 날씨 준비중';
  };

  // 핸들러
  const handleTabClick = (tab) => {
    if (tab !== '캘린더') {
      setPreparingMsg(`${tab}은 준비중입니다.`);
      setTimeout(() => setPreparingMsg(null), 2000);
    } else { setActiveTab(tab); }
  };

  const closeResult = () => { setView('main'); setLastReward(null); };

  const handleCalendarNav = (dir) => {
    if (calendarMode === 'month') {
      if (dir === 'prev') {
        if (currentMonth === 0) { setCurrentYear(v => v - 1); setCurrentMonth(11); }
        else setCurrentMonth(v => v - 1);
      } else {
        if (currentMonth === 11) { setCurrentYear(v => v + 1); setCurrentMonth(0); }
        else setCurrentMonth(v => v + 1);
      }
    } else {
      const newDate = new Date(selectedDateKey);
      newDate.setDate(newDate.getDate() + (dir === 'next' ? 7 : -7));
      const newKey = `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}-${String(newDate.getDate()).padStart(2, '0')}`;
      setSelectedDateKey(newKey);
      setCurrentYear(newDate.getFullYear());
      setCurrentMonth(newDate.getMonth());
    }
  };

  const handleOpenRecording = (isEdit = false) => {
    setIsEditingRecord(isEdit);
    setTempInput(isEdit || hasActualRecord ? { mood: currentRecord.mood, note: currentRecord.note } : { mood: null, note: '' });
    setView('recording');
  };

  const handleSaveRecordEdit = () => {
    setAllRecords(prev => ({
      ...prev,
      [selectedDateKey]: {
        ...(prev[selectedDateKey] || {}),
        mood: tempInput.mood,
        note: tempInput.note,
      }
    }));
    setPreparingMsg('기록이 수정되었습니다.');
    setTimeout(() => setPreparingMsg(null), 2000);
    setIsEditingRecord(false);
    setView('main');
  };

  const handleDeleteRecord = () => {
    if (window.confirm('기록을 삭제하시겠습니까?')) {
        setAllRecords(prev => { const n = { ...prev }; delete n[selectedDateKey]; return n; });
    }
  };

  const handleAddSchedule = () => {
    const label = newSchedule.category.split(' ')[1];
    const item = { ...newSchedule, title: label, id: Date.now(), cheered: false, sticker: null, isRare: false, fortune: null };
    setAllSchedules(prev => ({ ...prev, [selectedDateKey]: [...(prev[selectedDateKey] || []), item] }));
    setView('main');
  };

  const handleOpenScheduleAdd = () => {
    setNewSchedule({ category: '✨ 소소한 일상', time: '09:00' });
    setView('schedule_add');
  };

  const handleClaimThirdDayBonus = () => {
    startAd('streak_bonus');
  };

  const startAd = (purpose, extraData = null) => {
    setAdPurpose(purpose);
    setActiveScheduleId(extraData);
    setView('ad_loading');
    setTimeout(() => { setView('ad_watch'); }, 1500);
  };

  const handleCloseAd = () => {
    processReward(adPurpose, activeScheduleId);
    setView('result');
  };

  const getUpgradePurpose = () => {
    if (adPurpose === 'today' || adPurpose === 'future_preview' || adPurpose === 'today_special') {
      return 'today_special';
    }
    return 'schedule_upgrade';
  };

  const processReward = (purpose, extraData) => {
    const luckyItems = ["🍀", "🎯", "💎", "🕯️", "🔑"];
    const specialItems = ["👑", "🦄", "🌈", "🐉", "🔥"];
    const randomItem = luckyItems[Math.floor(Math.random() * luckyItems.length)];
    const randomSpecial = specialItems[Math.floor(Math.random() * specialItems.length)];

    if (purpose === 'today' || purpose === 'future_preview') {
      setPoints(prev => prev + 1);
      const fortuneMsg = "성실한 당신의 태도가 운을 부르고 있네요.";
      const weather = dateInfo.canPreviewWeather ? getWeatherForDate(selectedDateKey) : null;
      setAllRecords(prev => ({ 
        ...prev, 
        [selectedDateKey]: {
          ...(prev[selectedDateKey] || {}),
          mood: purpose === 'future_preview' ? null : tempInput.mood,
          note: purpose === 'future_preview' ? '' : tempInput.note,
          fortune: fortuneMsg,
          recorded: true,
          previewOnly: purpose === 'future_preview',
          sticker: randomItem,
          weather
        } 
      }));
      setLastReward({ type: 'today_summary', amount: 1, item: randomItem, title: '보상 도착!', desc: fortuneMsg, canUpgrade: true, weather });
      if (purpose === 'today' && dateInfo.isToday) setStreak([true, true, true, false, false, false, false]);
    } else if (purpose === 'today_special') {
      setPoints(prev => prev + 2);
      setAllRecords(prev => ({ ...prev, [selectedDateKey]: { ...(prev[selectedDateKey] || {}), specialClaimed: true, specialSticker: randomSpecial } }));
      setLastReward({ type: 'special_reward', amount: 2, item: randomSpecial, title: '전설 강화 성공!', desc: '전설 등급의 행운 아이템과 추가 포인트를 획득했습니다.', canUpgrade: false });
    } else if (purpose === 'streak_bonus') {
      setPoints(prev => prev + 30);
      setClaimedBonuses(prev => ({ ...prev, day3: true }));
      setLastReward({
        type: 'streak_bonus',
        amount: 30,
        item: '🎉',
        title: '3일 출석 보너스!',
        desc: '광고 시청을 완료해서 3일차 출석 보너스가 적립되었습니다.',
        canUpgrade: false,
      });
    } else if (purpose === 'schedule_cheer' || purpose === 'schedule_upgrade') {
      const isUpgrade = purpose === 'schedule_upgrade';
      const addedPoints = isUpgrade ? 2 : 1;
      setPoints(prev => prev + addedPoints);
      const targetId = extraData || activeScheduleId;
      const schedules = allSchedules[selectedDateKey] || [];
      const target = schedules.find(s => s.id === targetId);
      const categoryLabel = target?.title || "일상";
      let fortune = target?.fortune || `[${categoryLabel}] 일정에 예상치 못한 행운이 찾아옵니다.`;
      const finalDesc = isUpgrade ? `✨ 전설 스티커 기운으로 성공 확률이 200% 상승했습니다!` : fortune;
      setAllSchedules(prev => {
        const updated = (prev[selectedDateKey] || []).map(s => s.id === targetId ? { ...s, cheered: true, sticker: isUpgrade ? randomSpecial : (s.sticker || randomItem), isRare: isUpgrade, fortune: fortune } : s);
        return { ...prev, [selectedDateKey]: updated };
      });
      setLastReward({ type: 'sticker', item: isUpgrade ? randomSpecial : (target?.sticker || randomItem), title: isUpgrade ? '강화 완료!' : '일정 행운 도착!', desc: String(finalDesc), amount: addedPoints, canUpgrade: !isUpgrade, scheduleId: targetId });
      if (purpose === 'schedule_cheer' && selectedDateKey === todayKey) setStreak([true, true, true, false, false, false, false]);
    }
  };

  const PointBadge = ({ amount = 1, className = "" }) => (
    <div className={`absolute -top-2 -right-2 bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full shadow-md animate-bounce flex items-center gap-0.5 z-10 border border-white/20 ${className}`}>
        <Star className="w-2 h-2 fill-white" /> +{amount}P
    </div>
  );

  useEffect(() => {
    if (view === 'schedule_add' && selectedTimeRef.current && timeScrollerRef.current) {
      const frame = window.requestAnimationFrame(() => {
        const container = timeScrollerRef.current;
        const target = selectedTimeRef.current;
        if (!container || !target) return;

        const targetLeft = target.offsetLeft - (container.clientWidth - target.clientWidth) / 2;
        container.scrollTo({
          left: Math.max(0, targetLeft),
          behavior: 'auto',
        });
      });

      return () => window.cancelAnimationFrame(frame);
    }
  }, [view, newSchedule.time]);

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-gray-50 font-sans shadow-2xl relative overflow-hidden text-gray-900">
      <header className="bg-white sticky top-0 z-30 shadow-sm">
        <div className="px-4 py-3 flex justify-between items-center border-b border-gray-50">
            <div className="flex items-center gap-2"><ChevronLeft className="w-6 h-6 text-gray-400" /><h1 className="text-lg font-bold text-gray-800 tracking-tight">럭키 다이어리</h1></div>
            <div className="flex items-center gap-3"><User className="w-6 h-6 text-gray-400" /><div className="bg-yellow-100 px-3 py-1 rounded-full flex items-center gap-1 border border-yellow-200"><Star className="w-4 h-4 text-yellow-500 fill-yellow-500" /><span className="text-sm font-black text-yellow-700">{points.toLocaleString()}P</span></div></div>
        </div>
        <nav className="flex px-4 pt-2">
            {['캘린더', '럭키 아이템', '데일리 타로'].map(tab => (
                <button key={tab} onClick={() => handleTabClick(tab)} className={`flex-1 py-3 text-sm font-bold transition-all relative ${activeTab === tab ? 'text-blue-600' : 'text-gray-400'}`}>
                    {tab}{activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"></div>}
                </button>
            ))}
        </nav>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-6 pb-16 no-scrollbar">
        <section className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4 px-1"><h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Today Check Streak</h2><div className={`text-[10px] font-bold px-3 py-1 rounded-full shrink-0 ${isTodayCheckComplete ? 'text-emerald-700 bg-emerald-50' : 'text-orange-600 bg-orange-50'}`}>{isTodayCheckComplete ? '오늘 출석 완료' : '오늘 출석 전'}</div></div>
            <div className="mb-4 px-1">
                <p className="text-sm font-black text-gray-800 break-keep">오늘 기록 보상을 받거나 오늘 일정 응원을 받으면 출석이 쌓여요.</p>
            </div>
            <div className="flex justify-between items-center px-1">
                {streak.map((done, idx) => {
                  const isBonusDay = idx === 2 || idx === 6;
                  const isUpcomingBonusDay = (idx === 2 || idx === 6) && !done;
                  const isClaimedBonusDay = (idx === 2 && claimedBonuses.day3) || (idx === 6 && claimedBonuses.day7);
                  const isTodaySlot = idx === 2;

                  return (
                    <div
                      key={idx}
                      className={`w-9 h-9 rounded-2xl border-2 flex items-center justify-center transition-all relative ${
                        done
                          ? 'bg-blue-600 border-blue-600 text-white shadow-lg'
                          : isTodaySlot
                            ? 'bg-orange-50 border-orange-200 text-orange-500'
                          : isUpcomingBonusDay
                            ? 'bg-orange-50 border-orange-200 text-orange-500'
                            : 'bg-gray-50 border-gray-50 text-gray-200'
                      }`}
                    >
                      {done ? <CheckCircle className="w-5 h-5 animate-in zoom-in" /> : <span className="text-[10px] font-black">{isTodaySlot ? '오늘' : idx + 1}</span>}
                      {isBonusDay && (
                        <div className={`absolute -bottom-2 px-1.5 py-0.5 rounded-full text-[7px] font-black border ${
                          isClaimedBonusDay
                            ? 'bg-blue-600 text-white border-blue-500'
                            : done
                            ? 'bg-white text-blue-600 border-blue-100'
                            : isUpcomingBonusDay
                              ? 'bg-orange-500 text-white border-orange-400'
                              : 'bg-gray-100 text-gray-400 border-gray-200'
                        }`}>
                          {isClaimedBonusDay ? 'Done' : 'Bonus'}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
            {isThirdDayBonusReady && (
              <button onClick={handleClaimThirdDayBonus} className="mt-5 w-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white py-4 rounded-[1.5rem] font-black shadow-lg active:scale-95 transition-all">
                3일차 보너스 받기
              </button>
            )}
        </section>

        <section className="bg-white rounded-[2.5rem] p-5 shadow-lg border border-gray-100 relative min-h-[180px]">
          <div className="flex flex-col gap-4 pt-4">
            <div className="flex justify-between items-center px-1">
              <span className="font-black text-gray-800 text-xl">{currentYear}년 {currentMonth + 1}월</span>
              <div className="bg-gray-100 p-1 rounded-xl flex gap-1 border border-gray-200 shadow-inner">
                  <button onClick={() => setCalendarMode('week')} className={`px-4 py-1.5 text-[10px] font-black rounded-lg transition-all ${calendarMode === 'week' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'}`}>주간</button>
                  <button onClick={() => setCalendarMode('month')} className={`px-4 py-1.5 text-[10px] font-black rounded-lg transition-all ${calendarMode === 'month' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'}`}>월간</button>
              </div>
            </div>
            <div className="flex justify-between items-center px-1 border-y border-gray-50 py-3">
                <button onClick={() => handleCalendarNav('prev')} className="p-2 hover:bg-gray-50 rounded-full active:scale-90 transition-transform"><ChevronLeft className="w-4 h-4 text-gray-400" /></button>
                <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{calendarMode === 'week' ? 'Weekly Stream' : 'Monthly View'}</p>
                <button onClick={() => handleCalendarNav('next')} className="p-2 hover:bg-gray-50 rounded-full active:scale-90 transition-transform"><ChevronRight className="w-4 h-4 text-gray-400" /></button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-2 mt-5 transition-all">
            {['월','화','수','목','금','토','일'].map(d => <div key={d} className="text-center text-[10px] text-gray-300 font-black uppercase">{d}</div>)}
            {calendarDays.map((dateObj, idx) => {
              if (!dateObj) return <div key={`empty-${idx}`} className="h-14"></div>;
              const isSelected = selectedDateKey === dateObj.key;
              const isTodayCell = dateObj.key === todayKey;
              const calendarState = getCalendarStateForDate(dateObj.key);
              const stateMap = {
                empty: {
                  cell: isSelected ? 'border-blue-500 ring-4 ring-blue-50 bg-white shadow-sm scale-105' : 'border-transparent bg-gray-50/50',
                  text: isSelected ? 'text-blue-600' : isTodayCell ? 'text-blue-500' : 'text-gray-400',
                  bar: '',
                  icon: '',
                  iconClass: '',
                },
                fortune_normal: {
                  cell: isSelected ? 'border-blue-400 ring-4 ring-blue-100 bg-gradient-to-br from-sky-50 to-blue-50 shadow-sm scale-105' : 'border-blue-100 bg-gradient-to-br from-sky-50 to-blue-50 shadow-[0_8px_16px_rgba(59,130,246,0.10)]',
                  text: 'text-blue-700',
                  bar: 'bg-gradient-to-r from-sky-300 to-blue-400',
                  icon: '🍀',
                  iconClass: 'text-[13px]',
                },
                fortune_rare: {
                  cell: isSelected ? 'border-violet-400 ring-4 ring-violet-100 bg-gradient-to-br from-violet-50 via-fuchsia-50 to-rose-50 shadow-sm scale-105' : 'border-violet-200 bg-gradient-to-br from-violet-50 via-fuchsia-50 to-rose-50 shadow-[0_8px_16px_rgba(168,85,247,0.14)]',
                  text: 'text-violet-700',
                  bar: 'bg-gradient-to-r from-violet-300 via-fuchsia-300 to-rose-300',
                  icon: '👑',
                  iconClass: 'text-[13px]',
                },
                schedule_normal: {
                  cell: isSelected ? 'border-emerald-400 ring-4 ring-emerald-100 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 shadow-sm scale-105' : 'border-emerald-200 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 shadow-[0_8px_16px_rgba(16,185,129,0.12)]',
                  text: 'text-emerald-700',
                  bar: 'bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300',
                  icon: '🎯',
                  iconClass: 'text-[13px]',
                },
                schedule_rare: {
                  cell: isSelected ? 'border-orange-400 ring-4 ring-orange-100 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 shadow-sm scale-105' : 'border-orange-200 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 shadow-[0_8px_16px_rgba(251,146,60,0.14)]',
                  text: 'text-orange-700',
                  bar: 'bg-gradient-to-r from-orange-300 via-amber-400 to-yellow-300',
                  icon: '⭐',
                  iconClass: 'text-[13px]',
                },
                fortune_normal_schedule_normal: {
                  cell: isSelected ? 'border-cyan-400 ring-4 ring-cyan-100 bg-gradient-to-br from-sky-50 via-teal-50 to-cyan-50 shadow-sm scale-105' : 'border-cyan-200 bg-gradient-to-br from-sky-50 via-teal-50 to-cyan-50 shadow-[0_8px_16px_rgba(34,211,238,0.12)]',
                  text: 'text-cyan-700',
                  bar: 'bg-gradient-to-r from-sky-300 via-teal-300 to-cyan-300',
                  icon: '🍀🎯',
                  iconClass: 'text-[11px] tracking-[-0.12em]',
                },
                fortune_normal_schedule_rare: {
                  cell: isSelected ? 'border-amber-400 ring-4 ring-amber-100 bg-gradient-to-br from-sky-50 via-orange-50 to-yellow-50 shadow-sm scale-105' : 'border-amber-200 bg-gradient-to-br from-sky-50 via-orange-50 to-yellow-50 shadow-[0_8px_16px_rgba(245,158,11,0.14)]',
                  text: 'text-amber-700',
                  bar: 'bg-gradient-to-r from-sky-300 via-orange-300 to-yellow-300',
                  icon: '🍀⭐',
                  iconClass: 'text-[11px] tracking-[-0.08em]',
                },
                fortune_rare_schedule_normal: {
                  cell: isSelected ? 'border-fuchsia-400 ring-4 ring-fuchsia-100 bg-gradient-to-br from-violet-50 via-emerald-50 to-cyan-50 shadow-sm scale-105' : 'border-fuchsia-200 bg-gradient-to-br from-violet-50 via-emerald-50 to-cyan-50 shadow-[0_8px_16px_rgba(217,70,239,0.12)]',
                  text: 'text-fuchsia-700',
                  bar: 'bg-gradient-to-r from-violet-300 via-emerald-300 to-cyan-300',
                  icon: '👑🎯',
                  iconClass: 'text-[11px] tracking-[-0.08em]',
                },
                fortune_rare_schedule_rare: {
                  cell: isSelected ? 'border-fuchsia-400 ring-4 ring-fuchsia-100 bg-gradient-to-br from-amber-100 via-fuchsia-50 to-rose-100 shadow-sm scale-105' : 'border-fuchsia-200 bg-gradient-to-br from-amber-100 via-fuchsia-50 to-rose-100 shadow-[0_10px_18px_rgba(217,70,239,0.18)]',
                  text: 'text-fuchsia-700',
                  bar: 'bg-gradient-to-r from-yellow-300 via-fuchsia-400 to-rose-400',
                  icon: '👑⭐',
                  iconClass: 'text-[11px] tracking-[-0.08em]',
                },
              };
              const style = stateMap[calendarState];
              return (
                <button
                  key={dateObj.key}
                  onClick={() => setSelectedDateKey(dateObj.key)}
                  className={`h-14 rounded-2xl border transition-all flex flex-col items-center justify-start pt-2.5 pb-1 relative overflow-hidden ${style.cell}`}
                >
                  {style.bar && <div className={`absolute inset-x-2 top-1 h-0.5 rounded-full opacity-90 ${style.bar}`}></div>}
                  <span className={`text-[11px] leading-none font-black ${style.text}`}>{dateObj.day}</span>
                  {style.icon && <div className={`mt-1 leading-none ${style.iconClass}`}>{style.icon}</div>}
                </button>
              );
            })}
          </div>
        </section>

        <div className="space-y-4">
            <h3 className="font-bold text-gray-800 flex items-center gap-2 px-1"><Smile className={`w-5 h-5 ${dateInfo.isFuture ? 'text-purple-500' : 'text-blue-600'}`} /> {dateInfo.isToday ? '오늘의 기록' : dateInfo.isPast ? '과거의 기록' : '미래의 행운'}</h3>
            {hasActualRecord ? (
                <div className={`bg-white rounded-[2.5rem] border p-6 shadow-sm space-y-6 animate-in fade-in duration-500 ${currentRecord.specialClaimed ? 'border-yellow-200 gradient-rare' : 'border-gray-100'}`}>
                    <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-white rounded-[1.5rem] flex items-center justify-center text-4xl shadow-sm border border-gray-50">{moodIcons[currentRecord.mood] || '🙂'}</div>
                        <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                              <p className="text-[10px] font-black text-gray-300 uppercase tracking-tighter">Diary Log</p>
                              <div className="flex items-center gap-2">
                                {currentRecord.weather && <span className="text-[10px] font-bold text-gray-400 italic">{currentRecord.weather}</span>}
                                <button onClick={() => handleOpenRecording(true)} className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 active:scale-95 transition-all">
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                            <p className="text-sm text-gray-700 italic leading-relaxed break-keep">"{currentRecord.note || "작성된 메모가 없습니다."}"</p>
                        </div>
                    </div>
                    <div className="rounded-3xl border-2 p-5 bg-blue-50/50 border-blue-100 shadow-inner relative overflow-hidden">
                        <div className="flex flex-col gap-5 relative z-10">
                            <div className="space-y-1.5">
                                <p className="text-[10px] font-black text-blue-400 italic mb-1 flex items-center gap-1"><Sparkles className="w-3 h-3" /> Fortune Card</p>
                                <p className={`text-[13px] font-bold text-blue-900 leading-relaxed break-keep`}>"{currentRecord.fortune}"</p>
                            </div>
                            {/* 강화 유도 장치 */}
                            <div className="pt-4 border-t border-blue-100/50">
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 aspect-square max-w-[70px] bg-white rounded-2xl flex flex-col items-center justify-center border-2 border-blue-50 shadow-sm relative">
                                        <span className="text-2xl">{currentRecord.sticker || '🍀'}</span>
                                        <div className="absolute -bottom-2 bg-gray-100 px-2 py-0.5 rounded-full shadow-sm"><span className="text-[7px] font-black text-gray-400 uppercase">Normal</span></div>
                                    </div>
                                    {currentRecord.specialClaimed ? (
                                        <div className="flex-1 aspect-square max-w-[70px] bg-gradient-to-br from-yellow-300 to-orange-400 rounded-2xl flex flex-col items-center justify-center border-2 border-white shadow-lg animate-in zoom-in">
                                            <span className="text-2xl">{currentRecord.specialSticker}</span>
                                            <div className="absolute -bottom-2 bg-orange-500 px-2 py-0.5 rounded-full border border-white"><span className="text-[7px] font-black text-white uppercase tracking-tighter">Legend</span></div>
                                        </div>
                                    ) : (
                                        !dateInfo.isPast && (
                                            <button onClick={() => startAd('today_special')} className="flex-[2.5] bg-white/80 border-2 border-dashed border-blue-200 rounded-2xl flex items-center justify-center gap-3 px-4 py-3 hover:bg-white hover:border-blue-500 transition-all relative group shadow-sm active:scale-95">
                                                <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-600 transition-colors shadow-inner"><ArrowUpCircle className="w-5 h-5 text-blue-600 group-hover:text-white" /></div>
                                                <div className="text-left">
                                                    <p className="text-[11px] font-black text-blue-800 leading-none">레어 강화</p>
                                                    <p className="text-[8px] text-gray-400 font-bold mt-1 leading-tight break-keep">전설 등급으로 상향하기</p>
                                                </div>
                                                <PointBadge amount={2} className="!top-[-5px] !right-[-5px]" />
                                            </button>
                                        )
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : isFuturePreview ? (
                <div className="bg-white rounded-[2.5rem] border border-indigo-100 p-6 shadow-sm space-y-5 animate-in fade-in duration-500">
                    <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-indigo-50 rounded-[1.5rem] flex items-center justify-center text-3xl shadow-sm border border-indigo-100">🔮</div>
                        <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                              <p className="text-[10px] font-black text-indigo-300 uppercase tracking-tighter">Fortune Preview</p>
                              {currentRecord.weather && <span className="text-[10px] font-bold text-indigo-400 italic">{currentRecord.weather}</span>}
                            </div>
                            <p className="text-sm text-gray-600 leading-relaxed break-keep">미리 확인한 운세가 표시되고 있어요.</p>
                        </div>
                    </div>
                    <div className="rounded-3xl border-2 p-5 bg-indigo-50/60 border-indigo-100 shadow-inner relative overflow-hidden">
                        <div className="flex flex-col gap-5 relative z-10">
                            <div className="space-y-1.5">
                                <p className="text-[10px] font-black text-indigo-400 italic mb-1 flex items-center gap-1"><Sparkles className="w-3 h-3" /> Preview Fortune</p>
                                <p className="text-[13px] font-bold text-indigo-900 leading-relaxed break-keep">"{currentRecord.fortune}"</p>
                            </div>
                            <div className="pt-4 border-t border-indigo-100/70">
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 aspect-square max-w-[70px] bg-white rounded-2xl flex flex-col items-center justify-center border-2 border-indigo-50 shadow-sm relative">
                                        <span className="text-2xl">{currentRecord.sticker || '🍀'}</span>
                                        <div className="absolute -bottom-2 bg-gray-100 px-2 py-0.5 rounded-full shadow-sm"><span className="text-[7px] font-black text-gray-400 uppercase">Normal</span></div>
                                    </div>
                                    {currentRecord.specialClaimed ? (
                                        <div className="flex-1 aspect-square max-w-[70px] bg-gradient-to-br from-yellow-300 to-orange-400 rounded-2xl flex flex-col items-center justify-center border-2 border-white shadow-lg animate-in zoom-in relative">
                                            <span className="text-2xl">{currentRecord.specialSticker}</span>
                                            <div className="absolute -bottom-2 bg-orange-500 px-2 py-0.5 rounded-full border border-white"><span className="text-[7px] font-black text-white uppercase tracking-tighter">Legend</span></div>
                                        </div>
                                    ) : (
                                        <button onClick={() => startAd('today_special')} className="flex-[2.5] bg-white/90 border-2 border-dashed border-indigo-200 rounded-2xl flex items-center justify-center gap-3 px-4 py-3 hover:bg-white hover:border-indigo-500 transition-all relative group shadow-sm active:scale-95">
                                            <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-600 transition-colors shadow-inner"><ArrowUpCircle className="w-5 h-5 text-indigo-600 group-hover:text-white" /></div>
                                            <div className="text-left">
                                                <p className="text-[11px] font-black text-indigo-800 leading-none">2차 운세 강화</p>
                                                <p className="text-[8px] text-gray-400 font-bold mt-1 leading-tight break-keep">레어 스티커로 업그레이드하기</p>
                                            </div>
                                            <PointBadge amount={2} className="!top-[-5px] !right-[-5px]" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
              dateInfo.isFuture ? (
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-lg animate-in zoom-in duration-300">
                  <div className="relative z-10 space-y-6">
                    <div>
                      <h4 className="font-bold text-xl flex items-center gap-2">미래 행운 열기 <Sparkles className="w-5 h-5 opacity-50" /></h4>
                      <p className="text-sm opacity-80 mt-1 leading-relaxed text-indigo-50 break-keep">남들보다 먼저 {selectedDateKey.split('-')[2]}일의 행운을 잡으세요.</p>
                      {!dateInfo.canPreviewWeather && (
                        <p className="text-[11px] text-indigo-100/80 font-bold mt-3 break-keep">날씨는 오늘부터 3일 뒤까지만 함께 제공돼요.</p>
                      )}
                    </div>
                    <button onClick={() => startAd('future_preview')} className="w-full bg-white text-indigo-700 py-5 rounded-2xl font-black text-sm flex items-center justify-center relative shadow-xl active:scale-95 transition-all">{getFutureButtonText}<PointBadge /></button>
                  </div>
                  <Sparkles className="absolute -bottom-8 -right-8 w-32 h-32 opacity-10 rotate-12" />
                </div>
              ) : (
                /* [피드백 반영] 과거 기록 불가능 예외 처리 */
                dateInfo.isPast ? (
                  <div className="bg-gray-100 rounded-[2.5rem] p-10 border-2 border-dashed border-gray-200 text-center">
                    <Frown className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="font-bold text-gray-400">기록이 없는 날입니다.</p>
                  </div>
                ) : (
                  <button onClick={() => handleOpenRecording()} className="w-full bg-white p-10 rounded-[2.5rem] border border-gray-100 flex flex-col items-center gap-3 relative shadow-sm active:scale-95 transition-all">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-4xl shadow-inner">✍️</div>
                    <p className="font-black text-gray-700">오늘 하루 어떠셨나요?</p>
                    <PointBadge />
                  </button>
                )
              )
            )}
        </div>

        {/* 2. 일정 섹션 */}
        <div className="space-y-4 pb-12">
            <div className="flex justify-between items-center px-1">
              <h3 className="font-bold text-gray-800 flex items-center gap-2"><Target className="w-5 h-5 text-orange-500" /> {selectedDateKey.split('-')[2]}일 성공 일정</h3>
              {!dateInfo.isPast && currentSchedules.length > 0 && <button onClick={handleOpenScheduleAdd} className="text-[11px] font-black text-blue-600 bg-white border border-blue-100 px-4 py-2 rounded-full shadow-sm">+ 일정 추가</button>}
            </div>

            {/* [피드백 반영] 이미지 image_ffd083.png 가이드를 준수한 Empty State */}
            {currentSchedules.length === 0 ? (
                <div className="bg-white p-10 rounded-[2.5rem] border-none shadow-lg shadow-gray-200 text-center space-y-6 flex flex-col items-center animate-in fade-in">
                  <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center relative">
                    <Gift className="w-12 h-12 text-orange-500" />
                    <div className="absolute top-2 right-2"><Sparkle className="w-6 h-6 text-yellow-400" /></div>
                  </div>
                  <div className="space-y-1">
                    <p className="font-black text-gray-800 text-xl">일정 등록하고 포인트 받을 시간!</p>
                    <p className="text-sm text-gray-400">중요한 날을 등록하고 응원을 받으면 <span className="text-orange-500 font-bold">포인트</span>를 드려요.</p>
                  </div>
                  <div className="w-full max-w-[240px] relative mt-2">
                    <button onClick={handleOpenScheduleAdd} className="w-full bg-blue-600 text-white py-4 rounded-full font-black text-md flex items-center justify-center gap-2 shadow-xl shadow-blue-100 active:scale-95 transition-all">
                      <Plus className="w-5 h-5" /> 일정 등록하기
                    </button>
                    {/* [피드백 반영] 버튼 우측 상단 포인트 뱃지 */}
                    <PointBadge className="!top-[-8px] !right-[-5px] !animate-bounce" />
                  </div>
                </div>
            ) : (
                <div className="space-y-4 animate-in slide-in-from-bottom duration-500">
                    {currentSchedules.map((s) => (
                        <div key={s.id} className="bg-white p-5 rounded-[2.5rem] border border-gray-100 flex flex-col gap-4 shadow-sm hover:border-blue-100 transition-colors">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <div className={`w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-3xl border border-gray-100 shadow-inner`}>{s.cheered ? (s.isRare ? '👑' : '🍀') : '📅'}</div>
                                    <div><p className="font-black text-gray-800 text-sm">{s.title}</p><p className="text-[10px] text-gray-400 font-bold flex items-center gap-1 mt-0.5"><Clock className="w-3 h-3" /> {s.time}</p></div>
                                </div>
                                <div className="shrink-0">
                                  {s.cheered ? (
                                    !s.isRare ? (
                                      <button onClick={() => startAd('schedule_upgrade', s.id)} className="bg-orange-50 text-orange-600 border border-orange-200 px-4 py-2 rounded-2xl text-[10px] font-black relative active:scale-95 transition-all">강화 <PointBadge amount={2} /></button>
                                    ) : (
                                      <div className="bg-orange-500 text-white px-4 py-2 rounded-2xl text-[10px] font-black shadow-md shadow-orange-100 flex items-center gap-1"><Flame className="w-3 h-3" /> 레어 완료</div>
                                    )
                                  ) : (
                                    /* [피드백 반영] 과거 일정 응원 불가능 예외 처리 */
                                    !dateInfo.isPast && <button onClick={() => startAd('schedule_cheer', s.id)} className="bg-blue-600 text-white px-5 py-2.5 rounded-2xl text-[10px] font-black relative shadow-md active:scale-95 transition-all">응원 <PointBadge /></button>
                                  )}
                                </div>
                            </div>
                            {s.cheered && <div className="bg-gray-50 p-4 rounded-2xl italic text-[11px] text-gray-600 shadow-inner leading-relaxed break-keep">"{s.fortune}"</div>}
                        </div>
                    ))}
                </div>
            )}
        </div>
      </main>

      {/* 오버레이 (기록/일정추가/광고/결과) - 기존 완성 버전 유지 */}
      {view === 'recording' && (
        <div className="absolute inset-0 bg-white z-50 flex flex-col p-8 animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center mb-10"><button onClick={() => { setIsEditingRecord(false); setView('main'); }} className="p-3 bg-gray-50 rounded-full active:scale-90 transition-all"><X className="w-6 h-6 text-gray-400" /></button><h2 className="text-lg font-black text-gray-800">{isEditingRecord ? '기록 수정' : '오늘의 기록'}</h2><div className="w-12"></div></div>
            <div className="space-y-12 flex-1 overflow-y-auto no-scrollbar pb-6">
                <p className="font-black text-2xl text-center text-gray-800 leading-tight">{isEditingRecord ? '기록을 다시 다듬어볼까요?' : '오늘 기분은 어떠셨나요?'}</p>
                <div className="flex justify-between items-center bg-gray-50 p-6 rounded-[2.5rem] shadow-inner">
                    {['sad_max', 'sad', 'normal', 'happy', 'happy_max'].map(id => (
                        <button key={id} onClick={() => setTempInput({...tempInput, mood: id})} className={`flex flex-col items-center gap-2 transition-all ${tempInput.mood === id ? 'scale-125 z-10' : 'opacity-40 grayscale'}`}>
                            <span className="text-4xl">{moodIcons[id]}</span>
                        </button>
                    ))}
                </div>
                <textarea value={tempInput.note} onChange={(e) => setTempInput({...tempInput, note: e.target.value})} placeholder="오늘 하루를 짧게 정리해볼까요?" className="w-full h-44 p-6 rounded-[2rem] bg-gray-50 border-none text-sm resize-none shadow-inner focus:ring-2 focus:ring-blue-500" />
            </div>
            {isEditingRecord ? (
              <button onClick={handleSaveRecordEdit} disabled={!canSubmitTodayRecord} className={`w-full py-5 rounded-[2rem] font-bold shadow-xl transition-all ${canSubmitTodayRecord ? 'bg-blue-600 text-white active:scale-95' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>수정 저장하기</button>
            ) : (
              <button disabled={!canSubmitTodayRecord} onClick={() => startAd(dateInfo.isFuture ? 'future_preview' : 'today')} className={`w-full py-5 rounded-[2rem] font-bold relative shadow-xl transition-all ${canSubmitTodayRecord ? 'bg-blue-600 text-white active:scale-95' : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'}`}>{canSubmitTodayRecord ? <>기록 완료하고 보상 받기 <PointBadge /></> : '기분을 선택해주세요'}</button>
            )}
        </div>
      )}

      {view === 'schedule_add' && (
        <div className="absolute inset-0 bg-black/40 z-50 flex flex-col justify-end">
            <div className="bg-white rounded-t-[3.5rem] p-9 space-y-8 animate-in slide-in-from-bottom duration-300 shadow-2xl">
                <div className="text-center space-y-1"><h2 className="text-xl font-black text-nowrap">등록할 일정을 선택해주세요</h2><p className="text-xs text-gray-400 break-keep">성공하고 싶은 일정을 골라주세요.</p></div>
                <div className="grid grid-cols-2 gap-3">{categories.map(c => (<button key={c.label} onClick={() => setNewSchedule({...newSchedule, category: `${c.icon} ${c.label}`})} className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left ${newSchedule.category.includes(c.label) ? 'border-blue-600 bg-blue-50 shadow-sm' : 'border-gray-50 bg-gray-50'}`}><span className="text-xl">{c.icon}</span><span className="text-[11px] font-black text-gray-700">{c.label}</span></button>))}</div>
                <div className="space-y-3">
                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest ml-1">시간 선택</p>
                    <div ref={timeScrollerRef} className="flex gap-2 overflow-x-auto pb-4 no-scrollbar scroll-smooth snap-x">
                        {Array.from({length:24},(_,i)=>`${String(i).padStart(2,'0')}:00`).map(t => (<button ref={newSchedule.time === t ? selectedTimeRef : null} key={t} onClick={() => setNewSchedule({...newSchedule, time: t})} className={`shrink-0 px-6 py-3 rounded-xl font-black text-sm transition-all snap-start ${newSchedule.time === t ? 'bg-blue-600 text-white shadow-md scale-105' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>{t}</button>))}
                    </div>
                </div>
                <div className="flex gap-3"><button onClick={() => setView('main')} className="flex-1 bg-gray-100 text-gray-500 py-4.5 rounded-[2rem] font-bold active:scale-95 transition-all">취소</button><button onClick={handleAddSchedule} className="flex-[2] bg-blue-600 text-white py-4.5 rounded-[2rem] font-bold shadow-xl active:scale-95 transition-all">일정 등록하기</button></div>
            </div>
        </div>
      )}

      {view === 'ad_loading' && (
        <div className="absolute inset-0 bg-white z-[100] flex flex-col items-center justify-center p-10 text-center animate-in fade-in">
          <div className="relative mb-12"><div className="w-24 h-24 border-4 border-gray-100 border-t-blue-600 rounded-full animate-spin"></div><Sparkles className="absolute -top-2 -right-2 text-yellow-400 w-10 h-10 animate-pulse" /></div>
          <h2 className="text-2xl font-black text-gray-800 tracking-tight">당신을 위한 행운을</h2>
          <p className="text-blue-600 font-bold text-lg">조합하고 있습니다</p>
          <p className="text-gray-300 text-sm mt-4 italic">잠시만 기다려주세요...</p>
        </div>
      )}

      {view === 'ad_watch' && (
        <div className="absolute inset-0 bg-black z-[105] flex flex-col text-white animate-in fade-in">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/50">Sponsored</p>
              <h2 className="text-lg font-black">광고 시청 후 보상 받기</h2>
            </div>
            <button onClick={handleCloseAd} className="px-4 py-2 rounded-full bg-white text-gray-900 text-sm font-black active:scale-95 transition-all">
              광고 닫기
            </button>
          </div>

          <div className="flex-1 p-6 flex flex-col justify-between bg-gradient-to-br from-slate-900 via-indigo-950 to-fuchsia-950">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 rounded-full px-3 py-1 text-[11px] font-bold">
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                AD 00:15
              </div>
              <div className="space-y-3">
                <h3 className="text-3xl font-black leading-tight break-keep">오늘의 행운을 두 배로 올리는 스페셜 오퍼</h3>
                <p className="text-sm text-white/75 leading-relaxed break-keep">
                  브랜드 광고 영역 예시입니다. 실제 서비스에서는 리워드 비디오가 재생되고, 사용자가 닫기 또는 완료 후 보상 결과 화면으로 이동합니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {view === 'result' && lastReward && (
        <div className="absolute inset-0 bg-black/80 z-[110] flex items-center justify-center p-6 backdrop-blur-sm">
          <div className={`bg-white w-full rounded-[4.5rem] p-10 text-center relative animate-in zoom-in duration-300 shadow-2xl ${adPurpose.includes('upgrade') || adPurpose.includes('special') ? 'border-4 border-yellow-400' : ''}`}>
            <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full bg-yellow-400 border-8 border-white shadow-2xl flex items-center justify-center text-6xl animate-bounce">{lastReward.item}</div>
            <div className="mt-14 space-y-6">
              <div><h3 className="text-3xl font-black text-gray-800">{lastReward.title}</h3><p className="text-[10px] text-gray-400 font-bold uppercase mt-1 tracking-widest">Lucky Reward Arrival</p></div>
              <div className="rounded-[2.5rem] p-6 bg-blue-50 text-left border border-blue-100 shadow-inner">
                <p className="text-[10px] font-black text-blue-500 mb-2 uppercase tracking-widest flex items-center gap-1"><Sparkles className="w-3 h-3" /> Information</p>
                <p className="text-[13px] font-bold italic text-blue-900 leading-relaxed break-keep">{"\"" + (lastReward.desc || "") + "\""}</p>
              </div>
              {lastReward.weather && (
                <div className="rounded-[2rem] p-4 bg-sky-50 border border-sky-100 text-left shadow-inner">
                  <p className="text-[10px] font-black text-sky-500 mb-2 uppercase tracking-widest">Weather</p>
                  <p className="text-sm font-black text-sky-900">{lastReward.weather}</p>
                </div>
              )}
              <div className={`rounded-[2.5rem] p-5 flex justify-between items-center px-8 border-2 border-yellow-100 shadow-sm transition-all ${lastReward.amount > 1 ? 'bg-orange-50 border-orange-200' : 'bg-yellow-50'}`}>
                <div className="text-left"><p className={`text-[10px] font-black uppercase ${lastReward.amount > 1 ? 'text-orange-600' : 'text-yellow-600'}`}>Reward</p><p className={`text-2xl font-black ${lastReward.amount > 1 ? 'text-orange-700' : 'text-yellow-700'}`}>+{lastReward.amount}P</p></div><Trophy className={`${lastReward.amount > 1 ? 'text-orange-500' : 'text-yellow-500'} w-10 h-10`} />
              </div>
              <div className="space-y-3 pt-2">
                {lastReward.canUpgrade && <button onClick={() => startAd(getUpgradePurpose(), lastReward.scheduleId)} className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white py-5 rounded-[2.5rem] font-black animate-pulse shadow-xl active:scale-95 transition-all">레어 강화하고 포인트 더 받기</button>}
                <button onClick={closeResult} className={`w-full py-5 rounded-[2.5rem] font-bold bg-gray-900 text-white shadow-lg active:scale-95 transition-all`}>{lastReward.canUpgrade ? '그냥 닫기' : '저장하고 닫기'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {preparingMsg && <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-gray-900/90 text-white px-6 py-3 rounded-2xl font-bold text-sm z-[200] shadow-2xl animate-in slide-in-from-bottom">{preparingMsg}</div>}
    </div>
  );
};

export default App;

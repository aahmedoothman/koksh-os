/**
 * ==========================================================================
 * Koksh Workspace OS — Dashboard (الرئيسية) Module
 * Focus: "أنا لازم أعمل إيه دلوقتي؟" + Analytics
 * ==========================================================================
 */

function renderDashboard() {
    const now = new Date();
    const hour = now.getHours();
    const greetingEl = document.getElementById('banner-greeting-text');
    if (greetingEl) {
        if (hour >= 5 && hour < 12) {
            greetingEl.innerHTML = "صباح الخير يا Koksh ☀️";
        } else {
            greetingEl.innerHTML = "مساء الخير يا Koksh 🌙";
        }
    }

    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateStr = now.toLocaleDateString('ar-EG', options);
    const dateEl = document.getElementById('banner-date-text');
    if (dateEl) dateEl.textContent = dateStr;

    // 1. مهام النهارده
    const todayItems = AppState.contentItems.filter(i => i.date === AppState.selectedDate);
    const todayCountEl = document.getElementById('dash-today-count');
    if (todayCountEl) todayCountEl.textContent = todayItems.length;

    const todayListEl = document.getElementById('dash-today-list');
    if (todayListEl) {
        if (todayItems.length === 0) {
            todayListEl.innerHTML = `<div class="text-[11px] text-slate-400 text-center py-4">لا توجد مهام اليوم 🎉</div>`;
        } else {
            todayListEl.innerHTML = todayItems.map(item => `
                <div class="p-2 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs cursor-pointer hover:bg-slate-100" onclick="editContentItem('${item.id}')">
                    <span class="font-bold text-slate-800 truncate">${item.title}</span>
                    <span class="text-[10px] px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 font-bold shrink-0">${item.stage}</span>
                </div>
            `).join('');
        }
    }

    // 2. المتأخر والعاجل
    const urgentTasks = AppState.urgentTasks.filter(t => !t.done);
    const urgentCountEl = document.getElementById('dash-urgent-count');
    if (urgentCountEl) urgentCountEl.textContent = urgentTasks.length;

    const urgentListEl = document.getElementById('dash-urgent-list');
    if (urgentListEl) {
        if (urgentTasks.length === 0) {
            urgentListEl.innerHTML = `<div class="text-[11px] text-emerald-600 text-center py-4 font-bold">لا توجد مهام متأخرة ✓</div>`;
        } else {
            urgentListEl.innerHTML = urgentTasks.map(t => `
                <div class="p-2 rounded-xl bg-amber-50/60 border border-amber-200 flex items-center justify-between text-xs">
                    <label class="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
                        <input type="checkbox" onchange="toggleUrgentTask('${t.id}')" class="rounded text-amber-600">
                        <span class="font-bold text-slate-800 truncate">${t.text}</span>
                    </label>
                </div>
            `).join('');
        }
    }

    // 3. أقرب موعد تصوير
    const shoots = [...AppState.shootSessions].sort((a,b) => new Date(a.date) - new Date(b.date));
    const shootSpotlightEl = document.getElementById('dash-shoot-spotlight');
    const cdEl = document.getElementById('dash-shoot-countdown');

    if (shootSpotlightEl) {
        if (shoots.length === 0) {
            shootSpotlightEl.innerHTML = `<div class="text-[11px] text-slate-400 text-center py-4">لا توجد جلسات تصوير مجدولة</div>`;
            if (cdEl) cdEl.textContent = "فارغ";
        } else {
            const next = shoots[0];
            const client = AppState.clients.find(c => c.id === next.clientId) || { name: 'عميل غير محدد' };
            if (cdEl) cdEl.textContent = next.date;
            shootSpotlightEl.innerHTML = `
                <div class="space-y-1.5 p-2 bg-rose-50/50 rounded-xl border border-rose-100 text-xs">
                    <div class="font-bold text-slate-900 truncate">${client.name}</div>
                    <div class="text-[11px] text-slate-600"><i class="fa-solid fa-clock ml-1 text-rose-500"></i> ${next.date} (${next.time})</div>
                    <div class="text-[11px] text-slate-600 truncate"><i class="fa-solid fa-location-dot ml-1 text-rose-500"></i> ${next.location}</div>
                </div>
            `;
        }
    }

    // 4. محتوى محتاج قرار / مراجعة
    const decisionItems = AppState.contentItems.filter(i => i.stage === 'فكرة' || i.stage === 'سكريبت');
    const decisionCountEl = document.getElementById('dash-decision-count');
    if (decisionCountEl) decisionCountEl.textContent = decisionItems.length;

    const decisionListEl = document.getElementById('dash-decision-list');
    if (decisionListEl) {
        if (decisionItems.length === 0) {
            decisionListEl.innerHTML = `<div class="text-[11px] text-slate-400 text-center py-4">الاسكريبتات جاهزة للإنتاج ✓</div>`;
        } else {
            decisionListEl.innerHTML = decisionItems.map(item => `
                <div class="p-2 rounded-xl bg-purple-50/50 border border-purple-100 flex items-center justify-between text-xs cursor-pointer hover:bg-purple-100/60" onclick="editContentItem('${item.id}')">
                    <span class="font-bold text-slate-800 truncate">${item.title}</span>
                    <span class="text-[10px] text-purple-700 font-extrabold px-1.5 py-0.5 rounded bg-white">${item.stage}</span>
                </div>
            `).join('');
        }
    }

    // Bottom Analytics KPIs
    const activeCount = AppState.clients.filter(c => c.status === 'active').length;
    const clientKpiEl = document.getElementById('dash-kpi-clients');
    if (clientKpiEl) clientKpiEl.textContent = activeCount;

    const total = AppState.contentItems.length;
    const published = AppState.contentItems.filter(i => i.stage === 'تم النشر').length;
    const rate = total > 0 ? Math.round((published / total) * 100) : 0;
    const prodRateEl = document.getElementById('dash-kpi-prod-rate');
    if (prodRateEl) prodRateEl.textContent = `${rate}%`;
    const prodRatioEl = document.getElementById('dash-kpi-prod-ratio');
    if (prodRatioEl) prodRatioEl.textContent = `(${published}/${total} تم النشر)`;

    const shootsKpiEl = document.getElementById('dash-kpi-shoots');
    if (shootsKpiEl) shootsKpiEl.textContent = AppState.shootSessions.length;

    const totalMRR = AppState.clients.reduce((s,c) => s + (Number(c.retainer) || 0), 0);
    const totalPaid = AppState.clients.reduce((s,c) => s + (Number(c.paid) || 0), 0);
    const colRate = totalMRR > 0 ? Math.round((totalPaid / totalMRR) * 100) : 0;
    const mrrEl = document.getElementById('dash-kpi-mrr');
    if (mrrEl) mrrEl.textContent = `${totalMRR.toLocaleString()} ج.م`;
    const colRateEl = document.getElementById('dash-kpi-collected-rate');
    if (colRateEl) colRateEl.textContent = `${colRate}% محصل`;
}

function toggleUrgentTask(id) {
    const t = AppState.urgentTasks.find(x => x.id === id);
    if (t) {
        t.done = !t.done;
        saveState();
        renderAll();
        showToast("success", "إنجاز ممتاز!", "تم تحديث حالة المهمة العاجلة.");
    }
}
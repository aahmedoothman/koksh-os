/**
 * ==========================================================================
 * Koksh Workspace OS — State & Persistence Engine
 * ==========================================================================
 */

const INITIAL_DB = {
    clients: [
        { id: "c-1", name: "Weals Constructions", niche: "مقاولات وتشطيبات فاخرة", retainer: 16000, paid: 16000, deliverables: "12 Reels + 8 Designs + 2 جلسات تصوير", phone: "01012345678", status: "active", driveLink: "https://drive.google.com/drive/folders/weals" },
        { id: "c-2", name: "Weal's Food", niche: "مطاعم وأغذية صحية", retainer: 14000, paid: 9000, deliverables: "16 Reels + Stories يومية + تصوير طعام", phone: "01098765432", status: "active", driveLink: "https://drive.google.com/drive/folders/wealsfood" },
        { id: "c-3", name: "أسماك السويسي", niche: "مأكولات بحرية وسوق طازج", retainer: 12500, paid: 12500, deliverables: "10 Reels + 6 بوستات + حملة إعلانية", phone: "01122334455", status: "active", driveLink: "https://drive.google.com/drive/folders/suaisi" },
        { id: "c-4", name: "مطعم همبوزة (Hamboza)", niche: "برجر وفاست فود تريندي", retainer: 11000, paid: 6000, deliverables: "14 تيك توك وريلز + تغطية افتتاح", phone: "01234567890", status: "active", driveLink: "https://drive.google.com/drive/folders/hamboza" },
        { id: "c-5", name: "ورشة الأسواني للأخشاب", niche: "أثاث وديكورات خشبية راقية", retainer: 9000, paid: 5000, deliverables: "8 Reels + كاتالوج صور منتجات", phone: "01555555555", status: "active", driveLink: "https://drive.google.com/drive/folders/aswani" }
    ],
    contentItems: [
        {
            id: "cnt-1", clientId: "c-1", title: "3 أخطاء تدمر تشطيب الصالون وتضاعف التكلفة", platform: "Instagram", type: "Reels / Short", date: "2026-08-21", stage: "جاهز للنشر",
            hook: "لو بتشطب شقتك الأيام دي، إياك تقع في الغلطة رقم 2 اللي بتكلفك آلاف!",
            body: "1. اختيار الإضاءة قبل الفرش.\n2. إهمال نقاط الكهرباء خلف الشاشات.\n3. اختيار دهانات لامعة في الحوائط العريضة.",
            cta: "ابعتلنا مساحة شقتك في رسالة وهنبعتلك مقايسة مجانية فوراً!",
            shots: [
                { id: "st-1", text: "لقطة كلوز على عيب في دهان حائط مع حركة يد للمهندس", done: true },
                { id: "st-2", text: "لقطة وايد للصالون بعد التشطيب النهائي والإضاءة المودرن", done: true }
            ]
        },
        {
            id: "cnt-2", clientId: "c-2", title: "تحدي السعرات: طبق الباستا الوايت صوص دايت ولا لأ؟", platform: "TikTok", type: "Reels / Short", date: "2026-08-21", stage: "مونتاج",
            hook: "تفتكروا الباستا دي فيها كام سعر حراري؟ الرقم هيصدمك!",
            body: "الشيف بيحضر الصوص بمكون سري خالي من الدسم تماماً وبنفس الطعم الكريمي الغني.",
            cta: "منشن صاحبك اللي عامل دايت وقله العشا النهاردة عند Weal's Food!",
            shots: [
                { id: "st-3", text: "لقطة بطيئة نزول الوايت صوص على الباستا الساخنة", done: true },
                { id: "st-4", text: "ريأكشن وتذوق وانبهار", done: false }
            ]
        },
        {
            id: "cnt-3", clientId: "c-3", title: "الفرق بين الجمبري السويسي الحر والجمبري المستورد", platform: "Facebook", type: "Single Post / تصميم", date: "2026-08-22", stage: "سكريبت",
            hook: "إزاي تضمن إن الجمبري اللي بتشتريه بلدي وسويسي 100% ومش مجمد؟",
            body: "3 علامات في اللون والملمس وحجم الرأس.",
            cta: "اطلب أوردر الفريش النهاردة قبل الساعة 2 الظهر!",
            shots: []
        },
        {
            id: "cnt-4", clientId: "c-4", title: "برجر التريبل تشيز بالبصل المكرمل - لقطات الإغراء", platform: "Instagram", type: "Reels / Short", date: "2026-08-23", stage: "تصوير",
            hook: "لو جعان بلاش تتفرج على الفيديو ده لحد الآخر!",
            body: "لقطات قريبة جداً مع صوت السيزلنج وشلال الجبنة السايحة.",
            cta: "جرب ساندوتش البرجر الجديد من همبوزة واستمتع بخصم 20% بكود KOKSH20!",
            shots: [
                { id: "st-5", text: "سيزلنج اللحم على الجريل الساخن", done: false }
            ]
        },
        {
            id: "cnt-5", clientId: "c-5", title: "إزاي بنحول لوح خشب زان خام لترابيزة سفرة ملكية", platform: "YouTube", type: "Reels / Short", date: "2026-08-24", stage: "فكرة",
            hook: "من كتلة خشب صامتة إلى قطعة فنية تعيش معاك العمر كله!",
            body: "مراحل التصنيع اليدوي، الصنفرة، والتلميع في ورشة الأسواني.",
            cta: "احجز تصميمك الخاص بالمقاسات اللي تناسب بيتك!",
            shots: []
        }
    ],
    shootSessions: [
        {
            id: "shoot-1", clientId: "c-1", date: "2026-08-22", time: "11:00", location: "موقع تشطيب الفيلا - الشيخ زايد الحي الدبلوماسي",
            notes: "الكاميرا Sony A7IV + مايك لاسلكي DJI + إضاءة ليد محمولة. التركيز على لقطات B-Roll.",
            items: ["cnt-1"]
        },
        {
            id: "shoot-2", clientId: "c-4", date: "2026-08-25", time: "15:00", location: "فرع همبوزة - مصر الجديدة بجوار الكوربة",
            notes: "تصوير طعام Food Videography + تصوير أطباق جديدة ASMR سيزلنج.",
            items: ["cnt-4"]
        }
    ],
    adsCampaigns: [
        { id: "ad-1", clientId: "c-1", name: "حملة استشارات وتشطيبات زايد", platform: "Instagram / Meta", budget: 6000, spend: 3200, results: "48 Leads مهتمين", status: "active" },
        { id: "ad-2", clientId: "c-3", name: "عروض الجمبري والسي فود الويك إند", platform: "Facebook", budget: 3500, spend: 3500, results: "120 رسالة وطلب أوردر", status: "completed" },
        { id: "ad-3", clientId: "c-4", name: "حملة افتتاح فرع الكوربة", platform: "TikTok Ads", budget: 4000, spend: 1800, results: "85K Views + 420 زيارة", status: "active" }
    ],
    urgentTasks: [
        { id: "urg-1", text: "مراجعة مونتاج ريلز Weal's Food النهائي قبل النشر", done: true },
        { id: "urg-2", text: "إرسال اسكريبتات جلسة تصوير السبت لعميل Weals Constructions", done: false },
        { id: "urg-3", text: "تحصيل الدفعة المتبقية من مطعم همبوزة (5,000 ج.م)", done: false },
        { id: "urg-4", text: "جدولة بوست الجمبري السويسي لصفحة أسماك السويسي", done: true }
    ]
};

let AppState = {
    activeTab: 'dashboard',
    contentSubView: 'calendar',
    selectedDate: '2026-08-21',
    plannerCurrentMonth: new Date(2026, 7, 1),
    sidebarCollapsed: false,
    currentWorkspaceClientId: null,
    currentWorkspaceTab: 'overview',
    currentScriptViewing: null,
    ...loadState()
};

function loadState() {
    try {
        const s = localStorage.getItem('koksh_os_v3_db');
        if (s) {
            const p = JSON.parse(s);
            if (p && Array.isArray(p.clients) && Array.isArray(p.contentItems)) {
                return p;
            }
        }
    } catch (e) {
        console.error("Failed to load state:", e);
    }
    return JSON.parse(JSON.stringify(INITIAL_DB));
}

function saveState() {
    try {
        const payload = {
            clients: AppState.clients,
            contentItems: AppState.contentItems,
            shootSessions: AppState.shootSessions,
            adsCampaigns: AppState.adsCampaigns || [],
            urgentTasks: AppState.urgentTasks
        };
        localStorage.setItem('koksh_os_v3_db', JSON.stringify(payload));
    } catch (e) {
        console.error("Failed to save state:", e);
    }
}

function resetToDemoData() {
    if (confirm("هل أنت متأكد من رغبتك في إعادة ضبط جميع البيانات النموذجية؟")) {
        const demoCopy = JSON.parse(JSON.stringify(INITIAL_DB));
        AppState.clients = demoCopy.clients;
        AppState.contentItems = demoCopy.contentItems;
        AppState.shootSessions = demoCopy.shootSessions;
        AppState.adsCampaigns = demoCopy.adsCampaigns;
        AppState.urgentTasks = demoCopy.urgentTasks;
        saveState();
        renderAll();
        showToast("success", "تمت الاستعادة", "تم إعادة ضبط جميع البيانات النموذجية بنجاح!");
        closeModal('settings-modal');
    }
}

function exportBackupJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(AppState, null, 2));
    const a = document.createElement('a');
    a.setAttribute("href", dataStr);
    a.setAttribute("download", `koksh_backup_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(a);
    a.click();
    a.remove();
    showToast("success", "تم التصدير", "تم تنزيل ملف النسخة الاحتياطية بنجاح!");
}

function importBackupJSON(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const parsed = JSON.parse(e.target.result);
            if (parsed && Array.isArray(parsed.clients) && Array.isArray(parsed.contentItems)) {
                AppState.clients = parsed.clients;
                AppState.contentItems = parsed.contentItems;
                AppState.shootSessions = parsed.shootSessions || [];
                AppState.adsCampaigns = parsed.adsCampaigns || [];
                AppState.urgentTasks = parsed.urgentTasks || [];
                saveState();
                renderAll();
                showToast("success", "تم الاستيراد", "تمت استعادة البيانات بنجاح!");
                closeModal('settings-modal');
            } else {
                showToast("error", "خطأ في الملف", "الملف غير متطابق مع بنية النظام");
            }
        } catch (err) {
            showToast("error", "فشل الاستيراد", "تعذر قراءة ملف JSON");
        }
    };
    reader.readAsText(file);
}

function showToast(type, title, message) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    
    let bgClass = "bg-white border-slate-200 text-slate-800";
    let iconClass = "fa-solid fa-circle-info text-blue-500";
    
    if (type === 'success') {
        bgClass = "bg-white border-emerald-200 text-slate-800";
        iconClass = "fa-solid fa-circle-check text-emerald-500";
    } else if (type === 'warning') {
        bgClass = "bg-white border-amber-200 text-slate-800";
        iconClass = "fa-solid fa-triangle-exclamation text-amber-500";
    } else if (type === 'error') {
        bgClass = "bg-white border-rose-200 text-slate-800";
        iconClass = "fa-solid fa-circle-xmark text-rose-500";
    }

    toast.className = `flex items-center gap-3 px-4 py-3 rounded-2xl shadow-floating border ${bgClass} transition-all duration-300 pointer-events-auto transform translate-y-[-20px] opacity-0 text-xs font-semibold`;
    toast.innerHTML = `
        <i class="${iconClass} text-base shrink-0"></i>
        <div class="flex-1 min-w-0">
            <span class="font-bold block text-slate-900">${title}</span>
            <span class="text-slate-500 font-medium text-[11px]">${message}</span>
        </div>
        <button onclick="this.parentElement.remove()" class="text-slate-400 hover:text-slate-600 mr-2">
            <i class="fa-solid fa-xmark"></i>
        </button>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.remove('translate-y-[-20px]', 'opacity-0');
    }, 10);

    setTimeout(() => {
        toast.classList.add('translate-y-[-20px]', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    AppState.sidebarCollapsed = !AppState.sidebarCollapsed;
    localStorage.setItem('koksh_sidebar_collapsed', AppState.sidebarCollapsed ? 'true' : 'false');
    applySidebarState();
}

function applySidebarState() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;
    const texts = document.querySelectorAll('.sidebar-text');
    const isCollapsed = AppState.sidebarCollapsed;

    if (isCollapsed) {
        sidebar.classList.remove('w-64');
        sidebar.classList.add('w-20');
        texts.forEach(el => el.classList.add('hidden'));
    } else {
        sidebar.classList.remove('w-20');
        sidebar.classList.add('w-64');
        texts.forEach(el => el.classList.remove('hidden'));
    }
}

function populateClientDropdowns() {
    const cntSelect = document.getElementById('cnt-client-id');
    const shootSelect = document.getElementById('shoot-client-id');
    const paySelect = document.getElementById('payment-client-id');
    const filterContent = document.getElementById('content-client-filter');

    const opts = AppState.clients.map(c => `<option value="${c.id}">${c.name}</option>`).join('');

    if (cntSelect) cntSelect.innerHTML = opts;
    if (shootSelect) shootSelect.innerHTML = opts;
    if (paySelect) paySelect.innerHTML = opts;

    if (filterContent) {
        const cur = filterContent.value || 'ALL';
        filterContent.innerHTML = `<option value="ALL">جميع العملاء</option>` + opts;
        filterContent.value = cur;
    }
}

function updateBadges() {
    const todayItems = AppState.contentItems.filter(i => i.date === AppState.selectedDate).length;
    const todayEl = document.getElementById('today-badge-count');
    if (todayEl) todayEl.textContent = todayItems;

    const cntEl = document.getElementById('content-badge-count');
    if (cntEl) cntEl.textContent = AppState.contentItems.length;

    const shootEl = document.getElementById('shoots-badge-count');
    if (shootEl) shootEl.textContent = AppState.shootSessions.length;

    const clEl = document.getElementById('clients-badge-count');
    if (clEl) clEl.textContent = AppState.clients.length;
}

function renderAll() {
    populateClientDropdowns();
    if (typeof renderDashboard === 'function') renderDashboard();
    if (typeof renderTodayTab === 'function') renderTodayTab();
    if (typeof renderContentTab === 'function') renderContentTab();
    if (typeof renderShootsTab === 'function') renderShootsTab();
    if (typeof renderClientsTab === 'function') renderClientsTab();
    if (typeof renderFinanceTab === 'function') renderFinanceTab();
    updateBadges();
}
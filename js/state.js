/**
 * ==========================================================================
 * Koksh Workspace OS — Unified State & Persistence Engine
 * Phase 10-12: Smart Content System, Unified Tasks & Scaled Planning
 * ==========================================================================
 */

const CONTENT_GOALS = [
    { value: "Awareness", label: "🎯 وعي وانتشار (Awareness)" },
    { value: "Sales", label: "💰 مبيعات وتحويلات (Sales)" },
    { value: "Engagement", label: "💬 تفاعل ومجتمع (Engagement)" },
    { value: "Mix", label: "⚡ مزيج متوازن (Mix)" }
];

const CONTENT_STAGES = [
    { value: "💡 فكرة", label: "💡 فكرة (Idea)", color: "bg-amber-50 text-amber-800 border-amber-200" },
    { value: "📋 تخطيط", label: "📋 تخطيط (Planning)", color: "bg-blue-50 text-blue-800 border-blue-200" },
    { value: "🎬 جاهز للتصوير", label: "🎬 جاهز للتصوير (Ready for Shoot)", color: "bg-rose-50 text-rose-800 border-rose-200" },
    { value: "🎥 تم التصوير", label: "🎥 تم التصوير (Shot)", color: "bg-orange-50 text-orange-800 border-orange-200" },
    { value: "✂️ مونتاج / تصميم", label: "✂️ مونتاج / تصميم (Editing / Design)", color: "bg-purple-50 text-purple-800 border-purple-200" },
    { value: "🔍 مراجعة", label: "🔍 مراجعة (Review)", color: "bg-yellow-50 text-yellow-800 border-yellow-200" },
    { value: "📦 جاهز للجدولة", label: "📦 جاهز للجدولة (Ready to Schedule)", color: "bg-indigo-50 text-indigo-800 border-indigo-200" },
    { value: "📅 مجدول", label: "📅 مجدول (Scheduled)", color: "bg-cyan-50 text-cyan-800 border-cyan-200" },
    { value: "✅ تم النشر", label: "✅ تم النشر (Published)", color: "bg-emerald-50 text-emerald-800 border-emerald-200" }
];

const CLIENT_TEMPLATES = [
    {
        id: "tpl-restaurant",
        name: "مطاعم وأغذية سريعة (Restaurant & Food)",
        description: "خطة مخصصة لمطاعم البرجر والفاست فود مع التركيز على لقطات الإغراء والتيك توك",
        platforms: ["Instagram", "TikTok", "Facebook"],
        goal: "Sales",
        deliverables: {
            "Instagram": { reels: 8, posts: 6, stories: 15 },
            "TikTok": { videos: 8 },
            "Facebook": { posts: 4 }
        }
    },
    {
        id: "tpl-cafe",
        name: "كافيهات وقهوة مختصة (Cafe & Coffee)",
        description: "تركيز على الأجواء، تفاعل الاستوري اليومي، والمشروبات الصيفية والشتوية",
        platforms: ["Instagram", "TikTok"],
        goal: "Engagement",
        deliverables: {
            "Instagram": { reels: 6, posts: 4, stories: 20 },
            "TikTok": { videos: 6 }
        }
    },
    {
        id: "tpl-finishing",
        name: "عقارات وتشطيبات وديكور (Real Estate & Finishing)",
        description: "بناء الثقة ومصداقية التنفيذ مع لقطات قبل وبعد ونصائح التوفير للملاك",
        platforms: ["Instagram", "Facebook", "YouTube"],
        goal: "Awareness",
        deliverables: {
            "Instagram": { reels: 12, posts: 8, stories: 10 },
            "Facebook": { posts: 8 },
            "YouTube": { videos: 2 }
        }
    },
    {
        id: "tpl-store",
        name: "متاجر وأزياء وإلكترونيات (Retail & E-commerce)",
        description: "عروض المنتجات، ريفيو واستعراض الموديلات، وعروض الخصومات المباشرة",
        platforms: ["Instagram", "TikTok", "Facebook"],
        goal: "Sales",
        deliverables: {
            "Instagram": { reels: 10, posts: 8, stories: 25 },
            "TikTok": { videos: 12 },
            "Facebook": { posts: 6 }
        }
    },
    {
        id: "tpl-creator",
        name: "صانع محتوى / كوتش (Personal Brand & Coach)",
        description: "بناء البراند الشخصي والأثورتي عبر الريلز والثريدز والشورتس واللينكد إن",
        platforms: ["Instagram", "YouTube Shorts", "LinkedIn", "TikTok"],
        goal: "Mix",
        deliverables: {
            "Instagram": { reels: 12, posts: 4, stories: 20 },
            "YouTube Shorts": { videos: 12 },
            "LinkedIn": { posts: 8 },
            "TikTok": { videos: 8 }
        }
    }
];

const INITIAL_DB = {
    clients: [
        { 
            id: "c-1", name: "Weals Constructions", niche: "مقاولات وتشطيبات فاخرة", retainer: 16000, paid: 16000, 
            deliverables: "12 Reels + 8 Designs + 2 جلسات تصوير", notes: "تفضيل تصوير التشطيبات الفاخرة ولقطات ما قبل وبعد", 
            phone: "01012345678", status: "active", driveLink: "https://drive.google.com/drive/folders/weals", archived: false,
            contentPlan: {
                platforms: ["Instagram", "Facebook", "YouTube"],
                goal: "Awareness",
                deliverables: { "Instagram": { reels: 12, posts: 8, stories: 10 }, "Facebook": { posts: 8 }, "YouTube": { videos: 2 } },
                notes: "التركيز على فيلات الشيخ زايد والتجمع"
            }
        },
        { 
            id: "c-2", name: "Weal's Food", niche: "مطاعم وأغذية صحية", retainer: 14000, paid: 9000, 
            deliverables: "16 Reels + Stories يومية + تصوير طعام", notes: "تركيز على التيك توك وتصوير الوجبات الصحية", 
            phone: "01098765432", status: "active", driveLink: "https://drive.google.com/drive/folders/wealsfood", archived: false,
            contentPlan: {
                platforms: ["Instagram", "TikTok"],
                goal: "Sales",
                deliverables: { "Instagram": { reels: 8, posts: 4, stories: 20 }, "TikTok": { videos: 8 } },
                notes: "عروض الغداء والدايت"
            }
        },
        { 
            id: "c-3", name: "أسماك السويسي", niche: "مأكولات بحرية وسوق طازج", retainer: 12500, paid: 12500, 
            deliverables: "10 Reels + 6 بوستات + حملة إعلانية", notes: "عروض نهاية الأسبوع والجمبري الطازج", 
            phone: "01122334455", status: "active", driveLink: "https://drive.google.com/drive/folders/suaisi", archived: false,
            contentPlan: {
                platforms: ["Instagram", "Facebook"],
                goal: "Sales",
                deliverables: { "Instagram": { reels: 6, posts: 6, stories: 15 }, "Facebook": { posts: 6 } },
                notes: "طلبات الدليفري والأسماك الفريش"
            }
        },
        { 
            id: "c-4", name: "مطعم همبوزة (Hamboza)", niche: "برجر وفاست فود تريندي", retainer: 11000, paid: 6000, 
            deliverables: "14 تيك توك وريلز + تغطية افتتاح", notes: "فرع الكوربة الجديد وتصوير ASMR", 
            phone: "01234567890", status: "active", driveLink: "https://drive.google.com/drive/folders/hamboza", archived: false,
            contentPlan: {
                platforms: ["Instagram", "TikTok"],
                goal: "Engagement",
                deliverables: { "Instagram": { reels: 8, posts: 6, stories: 15 }, "TikTok": { videos: 8 } },
                notes: "تحديات الطعام وتفاعل الشباب"
            }
        },
        { 
            id: "c-5", name: "ورشة الأسواني للأخشاب", niche: "أثاث وديكورات خشبية راقية", retainer: 9000, paid: 5000, 
            deliverables: "8 Reels + كاتالوج صور منتجات", notes: "أعمال خشب زان وتصنيع يدوي", 
            phone: "01555555555", status: "active", driveLink: "https://drive.google.com/drive/folders/aswani", archived: false,
            contentPlan: null
        }
    ],
    contentItems: [
        {
            id: "cnt-1", clientId: "c-1", title: "3 أخطاء تدمر تشطيب الصالون وتضاعف التكلفة", platform: "Instagram", type: "Reels / Short", date: "2026-08-21", stage: "📦 جاهز للجدولة",
            goal: "Awareness",
            hook: "لو بتشطب شقتك الأيام دي، إياك تقع في الغلطة رقم 2 اللي بتكلفك آلاف!",
            body: "1. اختيار الإضاءة قبل الفرش.\n2. إهمال نقاط الكهرباء خلف الشاشات.\n3. اختيار دهانات لامعة في الحوائط العريضة.",
            cta: "ابعتلنا مساحة شقتك في رسالة وهنبعتلك مقايسة مجانية فوراً!",
            shootNotes: "تصوير كلوز على الدهانات وإضاءة الصالون",
            shots: [
                { id: "st-1", text: "لقطة كلوز على عيب في دهان حائط مع حركة يد للمهندس", done: true },
                { id: "st-2", text: "لقطة وايد للصالون بعد التشطيب النهائي والإضاءة المودرن", done: true }
            ],
            archived: false
        },
        {
            id: "cnt-2", clientId: "c-2", title: "تحدي السعرات: طبق الباستا الوايت صوص دايت ولا لأ؟", platform: "TikTok", type: "Reels / Short", date: "2026-08-21", stage: "✂️ مونتاج / تصميم",
            goal: "Engagement",
            hook: "تفتكروا الباستا دي فيها كام سعر حراري؟ الرقم هيصدمك!",
            body: "الشيف بيحضر الصوص بمكون سري خالي من الدسم تماماً وبنفس الطعم الكريمي الغني.",
            cta: "منشن صاحبك اللي عامل دايت وقله العشا النهاردة عند Weal's Food!",
            shootNotes: "تصوير بطيء لسقوط الصوص والتذوق",
            shots: [
                { id: "st-3", text: "لقطة بطيئة نزول الوايت صوص على الباستا الساخنة", done: true },
                { id: "st-4", text: "ريأكشن وتذوق وانبهار", done: true }
            ],
            archived: false
        },
        {
            id: "cnt-3", clientId: "c-3", title: "الفرق بين الجمبري السويسي الحر والجمبري المستورد", platform: "Facebook", type: "Single Post / تصميم", date: "2026-08-22", stage: "🔍 مراجعة",
            goal: "Sales",
            designBrief: "تصميم مقارنة بصرية مقسم نصفين بين الجمبري البلدي الأحمر الفاتح والمستورد الباهت مع أسهم ونقاط توضيحية وهوية أسماك السويسي الفاخرة",
            caption: "عشان محدش يغشك في سوق السمك! إليك 3 علامات تضمنلك إن الجمبري اللي بتشتريه بلدي سويسي 100%:\n1. لون الرأس الطبيعي.\n2. الملمس المتماسك للصدفة.\n3. ريحة البحر المميزة بدون أي مياه مجمدة.\n\nاطلب بوكس السي فود الفريش النهاردة ويوصلك متنضف وجاهز للتسوية!",
            cta: "اطلب أوردر الفريش النهاردة قبل الساعة 2 الظهر!",
            shots: [],
            archived: false
        },
        {
            id: "cnt-4", clientId: "c-4", title: "برجر التريبل تشيز بالبصل المكرمل - لقطات الإغراء", platform: "Instagram", type: "Reels / Short", date: "2026-08-23", stage: "🎬 جاهز للتصوير",
            goal: "Sales",
            hook: "لو جعان بلاش تتفرج على الفيديو ده لحد الآخر!",
            body: "لقطات قريبة جداً مع صوت السيزلنج وشلال الجبنة السايحة.",
            cta: "جرب ساندوتش البرجر الجديد من همبوزة واستمتع بخصم 20% بكود KOKSH20!",
            shootNotes: "صوت ASMR وسيزلنج على الجريل",
            shots: [
                { id: "st-5", text: "سيزلنج اللحم على الجريل الساخن", done: false }
            ],
            archived: false
        },
        {
            id: "cnt-5", clientId: "c-5", title: "ألبوم صور: 5 تصميمات غرف نوم مودرن بخشب الزان الطبيعي", platform: "Instagram", type: "Carousel / ألبوم", date: "2026-08-24", stage: "📋 تخطيط",
            goal: "Awareness",
            slidesOutline: "شريحة 1: الغلاف (إزاي تختار غرفة نوم تعيش معاك العمر كله؟)\nشريحة 2: صور غرفة الماستر مع دريسنج رووم خشب زان\nشريحة 3: تفاصيل التنجيد الخشبي المخفي\nشريحة 4: نصائح اختيار درجات الخشب مع دهان الحوائط\nشريحة 5: كول تو أكشن وعرض المقايسة المجانية",
            caption: "الأناقة مش بس في الشكل، الأناقة في خامة تعيش وتتحمل! استعرض أحدث كتالوج لغرف النوم المصنوعة يدوياً بالكامل في ورشة الأسواني للأخشاب.",
            cta: "احجز تصميمك الخاص بالمقاسات اللي تناسب بيتك!",
            shots: [],
            archived: false
        },
        {
            id: "cnt-6", clientId: "c-2", title: "استوري تفاعلية: صوّت لوجبتك المفضلة في ويك إند الصحي", platform: "Instagram", type: "Story / تفاعل", date: "2026-08-21", stage: "📅 مجدول",
            goal: "Engagement",
            storyContent: "صورة نصفية بين وجبة السالمون المشوي ووجبة الباستا الدايت مع ستيكر تصويت (Poll) وإمكانية السحب لأعلى للطلب",
            interactionType: "Poll",
            cta: "اطلب وجبتك الآن بخصم الويك إند",
            shots: [],
            archived: false
        }
    ],
    rawIdeas: [
        { id: "raw-1", title: "مقارنة بين تكلفة تشطيب متر الشقة 2025 و 2026 بالأرقام الحقيقية", notes: "فكرة فيديو ريلز يوضح أين توفر وأين تستثمر بدون تضحية بالجودة", createdAt: "2026-08-20" },
        { id: "raw-2", title: "فيديو سريع: إزاي تطلب فطار صحي في الشغل بأقل من 100 جنيه", notes: "تيك توك تريندي وموجه للشركات والمكاتب", createdAt: "2026-08-21" },
        { id: "raw-3", title: "طريقة تنظيف السي فود والجمبري في البيت في 3 دقايق", notes: "بوست كاروسيل أو ريلز تعليمي لزيادة الشير والمتابعة", createdAt: "2026-08-21" }
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
    tasks: [
        {
            id: "tsk-1", title: "مراجعة مونتاج ريلز Weal's Food النهائي قبل النشر", clientId: "c-2", contentId: "cnt-2",
            type: "editing", priority: "high", status: "in_progress", dueDate: "2026-08-21", waitingReason: null, notes: "التركيز على سلاسة الترانزيشن ولون الصوص"
        },
        {
            id: "tsk-2", title: "إرسال اسكريبتات جلسة تصوير السبت لعميل Weals Constructions", clientId: "c-1", shootId: "shoot-1",
            type: "planning", priority: "high", status: "pending", dueDate: "2026-08-21", waitingReason: null, notes: "تأكيد اللوكيشن النهائي مع المهندس"
        },
        {
            id: "tsk-3", title: "تصميم بوست مقارنة الجمبري لصفحة أسماك السويسي", clientId: "c-3", contentId: "cnt-3",
            type: "design", priority: "medium", status: "pending", dueDate: "2026-08-22", waitingReason: null, notes: "تسليم التصميم لمدير التسويق للمراجعة"
        },
        {
            id: "tsk-4", title: "تحصيل الدفعة المتبقية من مطعم همبوزة (5,000 ج.م)", clientId: "c-4",
            type: "general", priority: "high", status: "waiting", dueDate: "2026-08-21", waitingReason: "Waiting for Payment", notes: "بانتظار تأكيد التحويل عبر إنستاباي"
        },
        {
            id: "tsk-5", title: "إعداد خطة المحتوى الشهرية لعميل ورشة الأسواني", clientId: "c-5",
            type: "planning", priority: "medium", status: "pending", dueDate: "2026-08-23", waitingReason: null, notes: "استخدام قالب عقارات وتشطيبات كنقطة بداية"
        }
    ],
    urgentTasks: [
        { id: "urg-1", text: "مراجعة مونتاج ريلز Weal's Food النهائي قبل النشر", done: false, clientId: "c-2", contentId: "cnt-2" },
        { id: "urg-2", text: "إرسال اسكريبتات جلسة تصوير السبت لعميل Weals Constructions", done: false, clientId: "c-1", shootId: "shoot-1" },
        { id: "urg-3", text: "تحصيل الدفعة المتبقية من مطعم همبوزة (5,000 ج.م)", done: false, clientId: "c-4" }
    ],
    expenses: [
        { id: "exp-1", name: "اشتراك باقة أدوات المونتاج والذكاء الاصطناعي (ChatGPT + Midjourney)", amount: 1450, date: "2026-08-05", type: "business", category: "Software & Tools", notes: "اشتراك شهري لتسريع إنتاج الاسكريبتات" },
        { id: "exp-2", name: "إعلانات ممولة لحملة افتتاح مطعم همبوزة", amount: 3200, date: "2026-08-10", type: "business", category: "Ads", notes: "TikTok Ads & Meta Ads" },
        { id: "exp-3", name: "إيجار عدسة سوني 24-70mm لجلسة تصوير الشيخ زايد", amount: 800, date: "2026-08-12", type: "business", category: "Production", notes: "جلسة تصوير Weals Constructions" },
        { id: "exp-4", name: "بنزين وانتقالات لوكيشن الشيخ زايد والتجمع", amount: 650, date: "2026-08-14", type: "business", category: "Transportation", notes: "انتقالات تصوير ميداني" },
        { id: "exp-5", name: "تسوق ومستلزمات شخصية وسوبرماركت", amount: 2300, date: "2026-08-15", type: "personal", category: "Shopping", notes: "مصاريف منزلية وشخصية" },
        { id: "exp-6", name: "فاتورة كهرباء وإنترنت منزلي فائق السرعة", amount: 950, date: "2026-08-18", type: "personal", category: "Bills", notes: "التزامات شخصية" },
        { id: "exp-7", name: "وجبات وغداء خارجي أثناء جلسات العمل والتصوير", amount: 1100, date: "2026-08-19", type: "personal", category: "Food", notes: "مطاعم وكافيهات" }
    ]
};

let AppState = {
    activeTab: 'dashboard',
    contentSubView: 'calendar',
    selectedDate: '2026-08-21',
    plannerCurrentMonth: new Date(2026, 7, 1),
    plannerWeekOffset: 0,
    sidebarCollapsed: false,
    focusMode: false,
    previousTab: 'dashboard',
    shootMode: false,
    activeShootModeSessionId: null,
    readNotifications: [],
    notificationFilter: 'all',
    financeSelectedMonth: '2026-08',
    financeTypeFilter: 'ALL',
    financeCategoryFilter: 'ALL',
    clientsViewFilter: 'active',
    contentArchiveFilter: 'active',
    tasksCategoryFilter: 'ALL',
    tasksClientFilter: 'ALL',
    tasksStatusFilter: 'ALL',
    tasksPriorityFilter: 'ALL',
    currentWorkspaceClientId: null,
    currentWorkspaceTab: 'overview',
    clientContentSubView: 'list',
    currentScriptViewing: null,
    ...loadState()
};

function loadState() {
    try {
        const s = localStorage.getItem('koksh_os_v3_db');
        if (s) {
            const p = JSON.parse(s);
            if (p && Array.isArray(p.clients) && Array.isArray(p.contentItems)) {
                if (!Array.isArray(p.expenses)) {
                    p.expenses = JSON.parse(JSON.stringify(INITIAL_DB.expenses));
                }
                if (!Array.isArray(p.rawIdeas)) {
                    p.rawIdeas = JSON.parse(JSON.stringify(INITIAL_DB.rawIdeas));
                }
                if (!Array.isArray(p.tasks)) {
                    p.tasks = JSON.parse(JSON.stringify(INITIAL_DB.tasks));
                }
                p.clients.forEach(c => {
                    if (typeof c.archived === 'undefined') c.archived = false;
                    if (typeof c.contentPlan === 'undefined') c.contentPlan = null;
                });
                p.contentItems.forEach(i => {
                    if (typeof i.archived === 'undefined') i.archived = false;
                    if (typeof i.goal === 'undefined') i.goal = 'Awareness';
                });
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
            rawIdeas: AppState.rawIdeas || [],
            shootSessions: AppState.shootSessions,
            adsCampaigns: AppState.adsCampaigns || [],
            tasks: AppState.tasks || [],
            urgentTasks: AppState.urgentTasks || [],
            expenses: AppState.expenses || [],
            readNotifications: AppState.readNotifications || []
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
        AppState.rawIdeas = demoCopy.rawIdeas || [];
        AppState.shootSessions = demoCopy.shootSessions;
        AppState.adsCampaigns = demoCopy.adsCampaigns;
        AppState.tasks = demoCopy.tasks || [];
        AppState.urgentTasks = demoCopy.urgentTasks || [];
        AppState.expenses = demoCopy.expenses || [];
        AppState.readNotifications = [];
        AppState.clientsViewFilter = 'active';
        AppState.contentArchiveFilter = 'active';
        AppState.tasksCategoryFilter = 'ALL';
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
                AppState.rawIdeas = parsed.rawIdeas || [];
                AppState.shootSessions = parsed.shootSessions || [];
                AppState.adsCampaigns = parsed.adsCampaigns || [];
                AppState.tasks = parsed.tasks || [];
                AppState.urgentTasks = parsed.urgentTasks || [];
                AppState.expenses = parsed.expenses || [];
                AppState.readNotifications = parsed.readNotifications || [];
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
        <button onclick="this.parentElement.remove()" class="text-slate-400 hover:text-slate-600 mr-2 cursor-pointer">
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
    if (window.innerWidth < 1024) {
        if (sidebar && sidebar.classList.contains('mobile-open')) closeMobileSidebar();
        else openMobileSidebar();
        return;
    }
    AppState.sidebarCollapsed = !AppState.sidebarCollapsed;
    localStorage.setItem('koksh_sidebar_collapsed', AppState.sidebarCollapsed ? 'true' : 'false');
    applySidebarState();
}

function applySidebarState() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;
    const texts = document.querySelectorAll('.sidebar-text');
    const isCollapsed = AppState.sidebarCollapsed && window.innerWidth >= 1024;

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
    const quickSelect = document.getElementById('quick-idea-client-id');
    const shootSelect = document.getElementById('shoot-client-id');
    const paySelect = document.getElementById('payment-client-id');
    const taskSelect = document.getElementById('task-client-id');
    const filterContent = document.getElementById('content-client-filter');
    const filterTasks = document.getElementById('tasks-client-filter');

    const activeClients = (AppState.clients || []).filter(c => !c.archived);
    const opts = activeClients.map(c => `<option value="${c.id}">${c.name}</option>`).join('');

    if (cntSelect) cntSelect.innerHTML = opts;
    if (quickSelect) quickSelect.innerHTML = `<option value="">بدون عميل (فكرة عامة)</option>` + opts;
    if (shootSelect) shootSelect.innerHTML = opts;
    if (paySelect) paySelect.innerHTML = opts;
    if (taskSelect) taskSelect.innerHTML = `<option value="">بدون عميل (مهمة عامة)</option>` + opts;

    if (filterContent) {
        const cur = filterContent.value || 'ALL';
        filterContent.innerHTML = `<option value="ALL">جميع العملاء</option>` + opts;
        filterContent.value = cur;
    }

    if (filterTasks) {
        const cur = filterTasks.value || 'ALL';
        filterTasks.innerHTML = `<option value="ALL">جميع العملاء</option>` + opts;
        filterTasks.value = cur;
    }
}

function updateBadges() {
    if (typeof updateNotificationBadge === 'function') updateNotificationBadge();
    const activeContent = (AppState.contentItems || []).filter(i => !i.archived);
    const todayItems = activeContent.filter(i => i.date === AppState.selectedDate).length;
    const todayEl = document.getElementById('today-badge-count');
    if (todayEl) todayEl.textContent = todayItems;

    const cntEl = document.getElementById('content-badge-count');
    if (cntEl) cntEl.textContent = activeContent.length;

    const shootEl = document.getElementById('shoots-badge-count');
    if (shootEl) shootEl.textContent = AppState.shootSessions.length;

    const activeClients = (AppState.clients || []).filter(c => !c.archived);
    const clEl = document.getElementById('clients-badge-count');
    if (clEl) clEl.textContent = activeClients.length;

    // Tasks Badge (Active pending/in_progress tasks)
    const activeTasksCount = (AppState.tasks || []).filter(t => t.status !== 'completed').length;
    const taskBadgeEl = document.getElementById('tasks-badge-count');
    if (taskBadgeEl) taskBadgeEl.textContent = activeTasksCount;
}

function renderAll() {
    populateClientDropdowns();
    if (typeof renderDashboard === 'function') renderDashboard();
    if (typeof renderTodayTab === 'function') renderTodayTab();
    if (typeof renderTasksTab === 'function') renderTasksTab();
    if (typeof renderContentTab === 'function') renderContentTab();
    if (typeof renderShootsTab === 'function') renderShootsTab();
    if (typeof renderClientsTab === 'function') renderClientsTab();
    if (typeof renderFinanceTab === 'function') renderFinanceTab();
    updateBadges();
    if (typeof enhanceInteractiveControls === 'function') enhanceInteractiveControls();
}

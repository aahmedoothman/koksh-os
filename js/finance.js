/**
 * ==========================================================================
 * Koksh Workspace OS — Advanced Finance & Profit Management Hub
 * Full Revenue, Operating Expenses, Personal Expenses, Ledger & Client Dues
 * ==========================================================================
 */

const BUSINESS_CATEGORIES = [
    { value: "Ads", label: "إعلانات وميديا بايينج (Ads)" },
    { value: "Production", label: "إنتاج ومعدات تصوير (Production)" },
    { value: "Design", label: "تصميم ومونتاج (Design)" },
    { value: "Software & Tools", label: "اشتراكات برامج وأدوات (Software & Tools)" },
    { value: "Transportation", label: "مواصلات وانتقالات شغل (Transportation)" },
    { value: "Office / Operations", label: "مقر وتشغيل ومصاريف إدارية (Office / Operations)" },
    { value: "Other", label: "مصاريف بيزنس أخرى (Other)" }
];

const PERSONAL_CATEGORIES = [
    { value: "Food", label: "طعام ومشروبات وكافيهات (Food)" },
    { value: "Transportation", label: "مواصلات شخصية وبنزين (Transportation)" },
    { value: "Shopping", label: "تسوق ومشتريات (Shopping)" },
    { value: "Bills", label: "فواتير والتزامات شخصية (Bills)" },
    { value: "Other", label: "مصاريف شخصية أخرى (Other)" }
];

function renderFinanceTab() {
    const selectedMonth = AppState.financeSelectedMonth || '2026-08';
    const typeFilter = AppState.financeTypeFilter || 'ALL';
    const clientFilter = AppState.financeClientFilter || 'ALL';
    const catFilter = AppState.financeCategoryFilter || 'ALL';

    const monthPicker = document.getElementById('finance-month-picker');
    if (monthPicker) monthPicker.value = selectedMonth;

    const monthTag = document.getElementById('fin-summary-month-tag');
    if (monthTag) {
        const [y, m] = selectedMonth.split('-');
        const monthNames = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
        monthTag.textContent = `${monthNames[parseInt(m, 10) - 1] || m} ${y}`;
    }

    // 1. Calculate Active Client Incomes
    const activeClients = (AppState.clients || []).filter(c => !c.archived);
    const totalExpectedMRR = activeClients.reduce((s, c) => s + (Number(c.retainer) || 0), 0);
    const totalCollectedIncome = activeClients.reduce((s, c) => s + (Number(c.paid) || 0), 0);
    const totalOutstandingDues = Math.max(0, totalExpectedMRR - totalCollectedIncome);
    const collectionRate = totalExpectedMRR > 0 ? Math.round((totalCollectedIncome / totalExpectedMRR) * 100) : 0;

    // 2. Filter Expenses by Selected Month
    const allExpenses = AppState.expenses || [];
    const monthExpenses = selectedMonth === 'ALL' 
        ? allExpenses 
        : allExpenses.filter(e => e.date && e.date.startsWith(selectedMonth));

    // 3. Calculate Expenses Breakdown
    const businessExpenses = monthExpenses
        .filter(e => e.type === 'business')
        .reduce((s, e) => s + (Number(e.amount) || 0), 0);

    const personalExpenses = monthExpenses
        .filter(e => e.type === 'personal')
        .reduce((s, e) => s + (Number(e.amount) || 0), 0);

    const totalAllExpenses = businessExpenses + personalExpenses;

    // 4. Fundamental Business Equation: Net Business Profit = Total Income - Business Expenses
    // (Personal expenses are shown separately and do NOT deduct from business profit)
    const netBusinessProfit = totalCollectedIncome - businessExpenses;
    const expectedNetProfit = totalExpectedMRR - businessExpenses;
    const profitMargin = totalCollectedIncome > 0 ? Math.round((netBusinessProfit / totalCollectedIncome) * 100) : 0;

    // 5. Update KPI Cards in DOM
    const elIncome = document.getElementById('fin-metric-income');
    const elMrrTotal = document.getElementById('fin-metric-mrr-total');
    const elBusExp = document.getElementById('fin-metric-bus-exp');
    const elPersExp = document.getElementById('fin-metric-pers-exp');
    const elNetProfit = document.getElementById('fin-metric-net-profit');
    const elProfitMargin = document.getElementById('fin-metric-profit-margin');
    const elTotalDue = document.getElementById('fin-metric-total-due');
    const elTotalAllExp = document.getElementById('fin-metric-total-expenses');

    if (elIncome) elIncome.textContent = `${totalCollectedIncome.toLocaleString()} ج.م`;
    if (elMrrTotal) elMrrTotal.textContent = `من إجمالي اشتراكات: ${totalExpectedMRR.toLocaleString()} ج.م (${collectionRate}% محصل)`;
    if (elBusExp) elBusExp.textContent = `${businessExpenses.toLocaleString()} ج.م`;
    if (elPersExp) elPersExp.textContent = `${personalExpenses.toLocaleString()} ج.م`;
    if (elTotalDue) elTotalDue.textContent = `${totalOutstandingDues.toLocaleString()} ج.م`;
    if (elTotalAllExp) elTotalAllExp.textContent = `${totalAllExpenses.toLocaleString()} ج.م`;

    if (elNetProfit) {
        elNetProfit.textContent = `${netBusinessProfit.toLocaleString()} ج.م`;
        elNetProfit.className = `text-2xl font-black ${netBusinessProfit >= 0 ? 'text-emerald-950' : 'text-rose-950'}`;
    }
    if (elProfitMargin) {
        elProfitMargin.textContent = `هامش ربح ${profitMargin}% (صافي متوقع: ${expectedNetProfit.toLocaleString()} ج.م)`;
    }

    // 6. Direct Answers Summary Box (Q&A)
    const ansIncome = document.getElementById('fin-qa-income');
    const ansBusExp = document.getElementById('fin-qa-bus-exp');
    const ansNet = document.getElementById('fin-qa-net');
    const ansPersExp = document.getElementById('fin-qa-pers-exp');

    if (ansIncome) ansIncome.textContent = `${totalCollectedIncome.toLocaleString()} ج.م`;
    if (ansBusExp) ansBusExp.textContent = `${businessExpenses.toLocaleString()} ج.م`;
    if (ansNet) {
        ansNet.textContent = `${netBusinessProfit.toLocaleString()} ج.م`;
        ansNet.className = `font-black text-base block ${netBusinessProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`;
    }
    if (ansPersExp) ansPersExp.textContent = `${personalExpenses.toLocaleString()} ج.م`;

    // 7. Populate Finance Client Filter Dropdown
    const clientSelect = document.getElementById('fin-filter-client');
    if (clientSelect) {
        const curVal = clientSelect.value || clientFilter;
        clientSelect.innerHTML = '<option value="ALL">جميع العملاء / المصادر</option>' + 
            activeClients.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
        clientSelect.value = curVal;
    }

    // 8. Build Unified Financial Transactions Ledger (Payments + Expenses)
    const transactions = [];

    // Add Client Payment Transactions
    activeClients.forEach(c => {
        if (Number(c.paid) > 0) {
            transactions.push({
                id: 'tx-pay-' + c.id,
                title: `تحصيل دفعة اشتراك: ${c.name}`,
                type: 'income',
                clientId: c.id,
                clientName: c.name,
                category: 'Retainer / اشتراك شهري',
                date: selectedMonth + '-01',
                amount: Number(c.paid) || 0,
                notes: `قيمة الاشتراك الكامل: ${Number(c.retainer).toLocaleString()} ج.م`,
                isIncome: true
            });
        }
    });

    // Add Expense Transactions
    monthExpenses.forEach(exp => {
        const isBus = exp.type === 'business';
        transactions.push({
            id: exp.id,
            title: exp.name,
            type: isBus ? 'business_expense' : 'personal_expense',
            clientId: exp.clientId || null,
            clientName: exp.clientId ? ((activeClients.find(c => c.id === exp.clientId) || {}).name || '') : '',
            category: exp.category || 'Other',
            date: exp.date || selectedMonth + '-15',
            amount: Number(exp.amount) || 0,
            notes: exp.notes || '',
            isIncome: false,
            rawExpense: exp
        });
    });

    // Sort: Date descending
    transactions.sort((a, b) => b.date.localeCompare(a.date));

    // Filter Ledger
    let filteredTransactions = transactions;
    if (typeFilter === 'income') {
        filteredTransactions = filteredTransactions.filter(t => t.isIncome);
    } else if (typeFilter === 'business') {
        filteredTransactions = filteredTransactions.filter(t => t.type === 'business_expense');
    } else if (typeFilter === 'personal') {
        filteredTransactions = filteredTransactions.filter(t => t.type === 'personal_expense');
    }

    if (clientFilter !== 'ALL') {
        filteredTransactions = filteredTransactions.filter(t => t.clientId === clientFilter);
    }

    if (catFilter !== 'ALL') {
        filteredTransactions = filteredTransactions.filter(t => t.category === catFilter);
    }

    // Render Unified Ledger Table
    const tbody = document.getElementById('fin-ledger-tbody');
    const countEl = document.getElementById('fin-transactions-count');
    if (countEl) countEl.textContent = `(${filteredTransactions.length} معاملة مسجلة)`;

    if (tbody) {
        if (filteredTransactions.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="py-12 text-center text-slate-400 font-semibold">لا توجد معاملات مسجلة مطابقة للفلاتر المحددة.</td></tr>`;
        } else {
            tbody.innerHTML = filteredTransactions.map(tx => {
                let typeBadge = '';
                let amountClass = '';

                if (tx.isIncome) {
                    typeBadge = '<span class="bg-emerald-50 text-emerald-800 font-bold px-2.5 py-1 rounded-full border border-emerald-200 text-[10px] flex items-center gap-1 w-fit"><i class="fa-solid fa-arrow-down text-emerald-600"></i> إيراد محصل</span>';
                    amountClass = 'text-emerald-700 font-black';
                } else if (tx.type === 'business_expense') {
                    typeBadge = '<span class="bg-indigo-50 text-indigo-800 font-bold px-2.5 py-1 rounded-full border border-indigo-200 text-[10px] flex items-center gap-1 w-fit"><i class="fa-solid fa-briefcase text-indigo-600"></i> مصروف بيزنس</span>';
                    amountClass = 'text-slate-900 font-black';
                } else {
                    typeBadge = '<span class="bg-purple-50 text-purple-800 font-bold px-2.5 py-1 rounded-full border border-purple-200 text-[10px] flex items-center gap-1 w-fit"><i class="fa-solid fa-user text-purple-600"></i> مصروف شخصي</span>';
                    amountClass = 'text-purple-700 font-black';
                }

                return `
                    <tr class="hover:bg-slate-50 transition-colors">
                        <td class="py-3 px-4 font-bold text-slate-900 break-words max-w-[220px]">
                            ${tx.title}
                        </td>
                        <td class="py-3 px-4 whitespace-nowrap">${typeBadge}</td>
                        <td class="py-3 px-4 whitespace-nowrap text-slate-600 font-semibold text-xs">
                            ${tx.clientName ? `<span class="cursor-pointer hover:underline text-brand-600 font-bold" onclick="navigateToClientWorkspace('${tx.clientId}')">${tx.clientName}</span>` : '<span class="text-slate-400">عام</span>'}
                        </td>
                        <td class="py-3 px-4 whitespace-nowrap font-medium text-slate-600 text-xs">${tx.category}</td>
                        <td class="py-3 px-4 whitespace-nowrap font-bold text-slate-700 text-xs">${tx.date}</td>
                        <td class="py-3 px-4 whitespace-nowrap ${amountClass} text-xs">
                            ${tx.isIncome ? '+' : '-'}${tx.amount.toLocaleString()} ج.م
                        </td>
                        <td class="py-3 px-4 text-center whitespace-nowrap">
                            ${!tx.isIncome ? `
                                <button onclick="deleteExpense('${tx.id}')" class="w-7 h-7 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center text-xs cursor-pointer transition-colors" title="حذف البند">
                                    <i class="fa-solid fa-trash"></i>
                                </button>
                            ` : `
                                <button onclick="openPaymentForClient('${tx.clientId}')" class="text-emerald-700 hover:underline font-bold text-xs cursor-pointer" title="تعديل أو تحصيل إضافي">
                                    تحصيل ↗
                                </button>
                            `}
                        </td>
                    </tr>
                `;
            }).join('');
        }
    }

    // 9. Render Client Dues & Retainers Breakdown Card
    const duesContainer = document.getElementById('fin-client-dues-list');
    if (duesContainer) {
        duesContainer.innerHTML = activeClients.map(c => {
            const ret = Number(c.retainer) || 0;
            const paid = Number(c.paid) || 0;
            const due = Math.max(0, ret - paid);

            return `
                <div class="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-soft flex items-center justify-between gap-3">
                    <div class="min-w-0 flex-1">
                        <span class="font-bold text-slate-900 text-xs block truncate cursor-pointer hover:underline hover:text-brand-600" onclick="navigateToClientWorkspace('${c.id}')">${c.name}</span>
                        <div class="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                            <span>الاشتراك: ${ret.toLocaleString()} ج.م</span> • 
                            <span class="text-emerald-700 font-bold">المحصل: ${paid.toLocaleString()} ج.م</span>
                        </div>
                    </div>
                    <div class="text-left shrink-0">
                        ${due > 0 ? `
                            <span class="text-xs font-black text-rose-600 block">متبقي: ${due.toLocaleString()} ج.م</span>
                            <button onclick="openPaymentForClient('${c.id}')" class="text-[10px] font-bold text-emerald-700 hover:underline cursor-pointer">+ تحصيل دفعة</button>
                        ` : `
                            <span class="text-xs font-bold text-emerald-600 block">مسدد بالكامل ✓</span>
                        `}
                    </div>
                </div>
            `;
        }).join('');
    }
}

function onFinanceMonthChange(val) {
    if (!val) return;
    AppState.financeSelectedMonth = val;
    renderFinanceTab();
}

function onExpenseFilterChange() {
    const typeSelect = document.getElementById('fin-filter-type');
    const clientSelect = document.getElementById('fin-filter-client');
    const catSelect = document.getElementById('fin-filter-cat');

    if (typeSelect) AppState.financeTypeFilter = typeSelect.value;
    if (clientSelect) AppState.financeClientFilter = clientSelect.value;
    if (catSelect) AppState.financeCategoryFilter = catSelect.value;

    renderFinanceTab();
}

function deleteExpense(expenseId) {
    if (confirm("هل أنت متأكد من حذف هذا المصروف؟")) {
        AppState.expenses = (AppState.expenses || []).filter(e => e.id !== expenseId);
        saveState();
        renderFinanceTab();
        showToast("info", "تم الحذف", "تمت إزالة بند المصروف بنجاح.");
    }
}

// Payment Modals & Handlers
function openNewPaymentModal() {
    const form = document.getElementById('payment-form');
    if (form) form.reset();
    populateClientDropdowns();
    updatePaymentDueInfo();
    openModal('payment-modal');
}

function openPaymentForClient(clientId) {
    openNewPaymentModal();
    const select = document.getElementById('payment-client-id');
    if (select) {
        select.value = clientId;
        updatePaymentDueInfo();
    }
}

function updatePaymentDueInfo() {
    const clientId = document.getElementById('payment-client-id')?.value;
    const preview = document.getElementById('payment-due-preview');
    if (!preview) return;

    const client = (AppState.clients || []).find(c => c.id === clientId);
    if (!client) {
        preview.innerHTML = '<span class="text-slate-400">اختر العميل لعرض المستحقات</span>';
        return;
    }

    const ret = Number(client.retainer) || 0;
    const paid = Number(client.paid) || 0;
    const due = Math.max(0, ret - paid);

    preview.innerHTML = `
        <div class="flex justify-between items-center text-xs">
            <span>الاشتراك الشهري: <strong>${ret.toLocaleString()} ج.م</strong></span>
            <span class="${due > 0 ? 'text-rose-700 font-bold' : 'text-emerald-700 font-bold'}">المتبقي: ${due.toLocaleString()} ج.م</span>
        </div>
    `;
}

function handlePaymentSubmit(e) {
    e.preventDefault();
    const clientId = document.getElementById('payment-client-id').value;
    const amount = Number(document.getElementById('payment-amount').value) || 0;

    if (!clientId || amount <= 0) {
        showToast("warning", "بيانات ناقصة", "يرجى تحديد العميل والمبلغ المحصل.");
        return;
    }

    const client = (AppState.clients || []).find(c => c.id === clientId);
    if (!client) return;

    client.paid = (Number(client.paid) || 0) + amount;
    saveState();
    renderAll();
    closeModal('payment-modal');
    showToast("success", "تم تسجيل التحصيل! 💰", `تم تسجيل تحصيل ${amount.toLocaleString()} ج.م لـ ${client.name} بنجاح.`);
}
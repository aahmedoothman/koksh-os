/**
 * ==========================================================================
 * Koksh Workspace OS — Finance (المالية والاشتراكات) Module
 * ==========================================================================
 */

function renderFinanceTab() {
    const totalMRR = AppState.clients.reduce((s,c) => s + (Number(c.retainer) || 0), 0);
    const totalPaid = AppState.clients.reduce((s,c) => s + (Number(c.paid) || 0), 0);
    const totalDue = Math.max(0, totalMRR - totalPaid);
    const collectedRate = totalMRR > 0 ? Math.round((totalPaid / totalMRR) * 100) : 0;

    const tEl = document.getElementById('fin-total-mrr');
    const cEl = document.getElementById('fin-total-collected');
    const dEl = document.getElementById('fin-total-due');
    const sEl = document.getElementById('fin-collected-rate-sub');

    if (tEl) tEl.textContent = `${totalMRR.toLocaleString()} ج.م`;
    if (cEl) cEl.textContent = `${totalPaid.toLocaleString()} ج.م`;
    if (dEl) dEl.textContent = `${totalDue.toLocaleString()} ج.م`;
    if (sEl) sEl.textContent = `${collectedRate}% من الإجمالي المستهدف`;

    const tbody = document.getElementById('fin-ledger-tbody');
    if (!tbody) return;

    tbody.innerHTML = AppState.clients.map(client => {
        const ret = Number(client.retainer) || 0;
        const paid = Number(client.paid) || 0;
        const due = Math.max(0, ret - paid);

        let badge = due === 0 && ret > 0 ? 
            '<span class="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">✅ مدفوع بالكامل</span>' :
            (paid > 0 ? '<span class="bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200">⏳ مدفوع جزئياً</span>' :
                        '<span class="bg-rose-50 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-200">⚠️ معلق</span>');

        return `
            <tr class="hover:bg-slate-50 transition-colors">
                <td class="py-3 px-4 font-bold text-slate-900">
                    <div class="flex items-center gap-2">
                        <div class="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-[10px]">
                            ${client.name.charAt(0)}
                        </div>
                        <span class="block">${client.name}</span>
                    </div>
                </td>
                <td class="py-3 px-4 font-black text-slate-900">${ret.toLocaleString()} ج.م</td>
                <td class="py-3 px-4 font-black text-emerald-600">${paid.toLocaleString()} ج.م</td>
                <td class="py-3 px-4 font-black text-rose-600">${due.toLocaleString()} ج.م</td>
                <td class="py-3 px-4 whitespace-nowrap">${badge}</td>
                <td class="py-3 px-4 text-center whitespace-nowrap">
                    <button onclick="openPaymentForClient('${client.id}')" class="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold px-3 py-1 rounded-xl text-xs transition-all">
                        + تسجيل دفعة
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function openNewPaymentModal() {
    const form = document.getElementById('payment-form');
    if (form) form.reset();
    openModal('payment-modal');
}

function openPaymentForClient(clientId) {
    openNewPaymentModal();
    const select = document.getElementById('payment-client-id');
    if (select) select.value = clientId;
}

function handlePaymentSubmit(e) {
    e.preventDefault();
    const clientId = document.getElementById('payment-client-id').value;
    const amount = Number(document.getElementById('payment-amount').value) || 0;
    const method = document.getElementById('payment-method').value;

    const client = AppState.clients.find(c => c.id === clientId);
    if (!client) return;

    client.paid = (Number(client.paid) || 0) + amount;
    saveState();
    renderAll();
    closeModal('payment-modal');
    showToast("success", "تم تسجيل الدفعة! 💰", `تم تسجيل ${amount.toLocaleString()} ج.م عبر ${method} بنجاح.`);
}
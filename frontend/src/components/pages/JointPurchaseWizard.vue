<template>
    <div class="wizard-container text-light">
        <teleport to="body">
            <button v-if="showFloatingSave" type="button" class="save-button-position btn highlight-action-button"
                :disabled="saving" @click="onSaveDraft">
                <span v-if="saving">儲存中…</span>
                <span v-else>儲存</span>
            </button>
        </teleport>
        <div class="wizard-header mb-3">
            <div class="wizard-heading">
                <h3 class="mb-1">共同購屋協議</h3>
                <p class="mb-0">釐清共同出資買房時的權利義務與風險分擔。</p>
            </div>
            <div class="wizard-actions">
                <p v-if="lastSavedText" class="wizard-last-saved mb-1 small text-light opacity-75">
                    上次編輯：{{ lastSavedText }}
                </p>
                <div class="wizard-action-buttons">
                    <button type="button" class="btn btn-outline-light btn-sm me-2" :disabled="saving"
                        @click="onSaveDraft">
                        <span v-if="saving">儲存中…</span>
                        <span v-else>儲存</span>
                    </button>
                    <button type="button" class="btn btn-outline-light btn-sm pdf-icon-btn" @click="onDownload"
                        :disabled="downloading" title="下載 PDF 範例">
                        <span v-if="downloading">產生中…</span>
                        <span v-else>
                            PDF
                            <i class="mdi mdi-file-download-outline" />
                        </span>
                    </button>
                </div>
                <div v-if="error" class="wizard-action-error mt-2" role="alert">
                    <i class="mdi mdi-alert-circle-outline" aria-hidden="true"></i>
                    <span>{{ error }}</span>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-md-7 mb-3">
                <div class="card card-soft">
                    <div class="card-body">
                        <h5 class="mb-3 fw-bold">
                            <i class="mdi mdi-account-multiple-outline me-2 text-light opacity-75" />
                            基本資訊
                        </h5>
                        <div class="ps-4">
                            <div class="mb-3">
                                <label class="form-label">甲方姓名</label>
                                <input v-model="form.partnerA" type="text" class="form-control" placeholder="例如：王小明" />
                            </div>
                            <div class="mb-3">
                                <label class="form-label">乙方姓名</label>
                                <input v-model="form.partnerB" type="text" class="form-control" placeholder="例如：林小潔" />
                            </div>
                        </div>

                        <h5 class="mb-3 mt-4 fw-bold">
                            <i class="mdi mdi-home-city-outline me-2 text-light opacity-75" />
                            標的物資訊
                        </h5>
                        <div class="ps-4">
                            <div class="mb-3">
                                <label class="form-label">不動產坐落地點</label>
                                <input v-model="form.location" type="text" class="form-control"
                                    placeholder="例如：台北市〇〇區〇〇路〇號" />
                            </div>
                            <div class="mb-3">
                                <label class="form-label">地號／建號（選填）</label>
                                <input v-model="form.landNumber" type="text" class="form-control"
                                    placeholder="例如：〇段〇小段第〇〇號" />
                            </div>
                            <div class="mb-3">
                                <label class="form-label">建物面積與車位（選填）</label>
                                <input v-model="form.buildingDetail" type="text" class="form-control"
                                    placeholder="例如：建坪〇坪，含坡道平面車位一個等。" />
                            </div>
                        </div>

                        <h5 class="mb-3 mt-4 fw-bold">
                            <i class="mdi mdi-scale-balance me-2 text-light opacity-75" />
                            出資比例與產權登記
                        </h5>
                        <div class="ps-4">
                            <div class="mb-3">
                                <label class="form-label">標的物總價（新台幣）</label>
                                <input :value="formatMoney(form.totalPrice)" type="text" class="form-control"
                                    placeholder="例如：12000000（不包含逾期違約金等）" @input="onMoneyInput('totalPrice', $event)" />
                            </div>

                            <div class="mb-3 ps-3 border-start border-light border-opacity-25">
                                <h6 class="mb-2">頭期款</h6>
                                <div class="row g-2 align-items-end mb-2">
                                    <div class="col-4">
                                        <label class="form-label mb-0">簽約金（甲方）</label>
                                        <input :value="formatMoney(form.downContractA)" type="text" class="form-control"
                                            placeholder="金額" @input="onMoneyInput('downContractA', $event)" />
                                    </div>
                                    <div class="col-4">
                                        <label class="form-label mb-0">簽約金（乙方）</label>
                                        <input :value="formatMoney(form.downContractB)" type="text" class="form-control"
                                            placeholder="金額" @input="onMoneyInput('downContractB', $event)" />
                                    </div>
                                </div>
                                <div class="row g-2 align-items-end mb-2">
                                    <div class="col-4">
                                        <label class="form-label mb-0">工程款一（甲方）</label>
                                        <input :value="formatMoney(form.downStage1A)" type="text" class="form-control"
                                            placeholder="金額" @input="onMoneyInput('downStage1A', $event)" />
                                    </div>
                                    <div class="col-4">
                                        <label class="form-label mb-0">工程款一（乙方）</label>
                                        <input :value="formatMoney(form.downStage1B)" type="text" class="form-control"
                                            placeholder="金額" @input="onMoneyInput('downStage1B', $event)" />
                                    </div>
                                </div>
                                <div class="row g-2 align-items-end mb-2">
                                    <div class="col-4">
                                        <label class="form-label mb-0">工程款二（甲方）</label>
                                        <input :value="formatMoney(form.downStage2A)" type="text" class="form-control"
                                            placeholder="金額" @input="onMoneyInput('downStage2A', $event)" />
                                    </div>
                                    <div class="col-4">
                                        <label class="form-label mb-0">工程款二（乙方）</label>
                                        <input :value="formatMoney(form.downStage2B)" type="text" class="form-control"
                                            placeholder="金額" @input="onMoneyInput('downStage2B', $event)" />
                                    </div>
                                </div>
                                <div class="row g-2 align-items-end mb-2">
                                    <div class="col-4">
                                        <label class="form-label mb-0">代收款（甲方）</label>
                                        <input :value="formatMoney(form.downAgencyA)" type="text" class="form-control"
                                            placeholder="金額" @input="onMoneyInput('downAgencyA', $event)" />
                                    </div>
                                    <div class="col-4">
                                        <label class="form-label mb-0">代收款（乙方）</label>
                                        <input :value="formatMoney(form.downAgencyB)" type="text" class="form-control"
                                            placeholder="金額" @input="onMoneyInput('downAgencyB', $event)" />
                                    </div>
                                </div>
                                <div class="row g-2 align-items-end mb-2">
                                    <div class="col-4">
                                        <label class="form-label mb-0">交屋款（甲方）</label>
                                        <input :value="formatMoney(form.handoverA)" type="text" class="form-control"
                                            placeholder="金額" @input="onMoneyInput('handoverA', $event)" />
                                    </div>
                                    <div class="col-4">
                                        <label class="form-label mb-0">交屋款（乙方）</label>
                                        <input :value="formatMoney(form.handoverB)" type="text" class="form-control"
                                            placeholder="金額" @input="onMoneyInput('handoverB', $event)" />
                                    </div>
                                </div>
                                <small class="form-text text-muted d-block" v-if="downPaymentTotals.text">
                                    {{ downPaymentTotals.text }}
                                </small>
                            </div>

                            <div class="mb-3 ps-3 border-start border-light border-opacity-25">
                                <h6 class="mb-2">入住前支出</h6>
                                <div class="row g-2 align-items-end mb-2">
                                    <div class="col-4">
                                        <label class="form-label mb-0">裝潢款（甲方）</label>
                                        <input :value="formatMoney(form.decorationA)" type="text" class="form-control"
                                            placeholder="金額" @input="onMoneyInput('decorationA', $event)" />
                                    </div>
                                    <div class="col-4">
                                        <label class="form-label mb-0">裝潢款（乙方）</label>
                                        <input :value="formatMoney(form.decorationB)" type="text" class="form-control"
                                            placeholder="金額" @input="onMoneyInput('decorationB', $event)" />
                                    </div>
                                </div>
                                <div class="row g-2 align-items-end mb-2">
                                    <div class="col-4">
                                        <label class="form-label mb-0">家具（甲方）</label>
                                        <input :value="formatMoney(form.furnitureA)" type="text" class="form-control"
                                            placeholder="金額" @input="onMoneyInput('furnitureA', $event)" />
                                    </div>
                                    <div class="col-4">
                                        <label class="form-label mb-0">家具（乙方）</label>
                                        <input :value="formatMoney(form.furnitureB)" type="text" class="form-control"
                                            placeholder="金額" @input="onMoneyInput('furnitureB', $event)" />
                                    </div>
                                </div>
                                <div class="row g-2 align-items-end mb-2">
                                    <div class="col-4">
                                        <label class="form-label mb-0">家電（甲方）</label>
                                        <input :value="formatMoney(form.applianceA)" type="text" class="form-control"
                                            placeholder="金額" @input="onMoneyInput('applianceA', $event)" />
                                    </div>
                                    <div class="col-4">
                                        <label class="form-label mb-0">家電（乙方）</label>
                                        <input :value="formatMoney(form.applianceB)" type="text" class="form-control"
                                            placeholder="金額" @input="onMoneyInput('applianceB', $event)" />
                                    </div>
                                </div>
                                <div class="row g-2 align-items-end mb-2">
                                    <div class="col-4">
                                        <label class="form-label mb-0">驗屋費用（甲方）</label>
                                        <input :value="formatMoney(form.inspectionA)" type="text" class="form-control"
                                            placeholder="金額" @input="onMoneyInput('inspectionA', $event)" />
                                    </div>
                                    <div class="col-4">
                                        <label class="form-label mb-0">驗屋費用（乙方）</label>
                                        <input :value="formatMoney(form.inspectionB)" type="text" class="form-control"
                                            placeholder="金額" @input="onMoneyInput('inspectionB', $event)" />
                                    </div>
                                </div>
                                <small class="form-text text-muted d-block" v-if="preMoveTotals.text">
                                    {{ preMoveTotals.text }}
                                </small>
                            </div>

                            <div class="mb-3 ps-3 border-start border-light border-opacity-25">
                                <h6 class="mb-2">其他雜項支出</h6>
                                <div class="row g-2 align-items-end mb-2">
                                    <div class="col-4">
                                        <label class="form-label mb-0">清潔費（甲方）</label>
                                        <input :value="formatMoney(form.cleaningA)" type="text" class="form-control"
                                            placeholder="金額" @input="onMoneyInput('cleaningA', $event)" />
                                    </div>
                                    <div class="col-4">
                                        <label class="form-label mb-0">清潔費（乙方）</label>
                                        <input :value="formatMoney(form.cleaningB)" type="text" class="form-control"
                                            placeholder="金額" @input="onMoneyInput('cleaningB', $event)" />
                                    </div>
                                </div>
                                <div class="row g-2 align-items-end mb-2">
                                    <div class="col-4">
                                        <label class="form-label mb-0">搬家費用（甲方）</label>
                                        <input :value="formatMoney(form.movingA)" type="text" class="form-control"
                                            placeholder="金額" @input="onMoneyInput('movingA', $event)" />
                                    </div>
                                    <div class="col-4">
                                        <label class="form-label mb-0">搬家費用（乙方）</label>
                                        <input :value="formatMoney(form.movingB)" type="text" class="form-control"
                                            placeholder="金額" @input="onMoneyInput('movingB', $event)" />
                                    </div>
                                </div>
                                <small class="form-text text-muted d-block" v-if="miscTotals.text">
                                    {{ miscTotals.text }}
                                </small>
                            </div>

                            <div class="mb-3 ps-3 border-start border-light border-opacity-25">
                                <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                                    <h6 class="mb-0">每月貸款負擔</h6>
                                    <router-link class="btn btn-outline-light btn-sm loan-calculator-link"
                                        to="/tools/monthly-loan">
                                        前往負擔試算
                                    </router-link>
                                </div>
                                <p class="small text-muted">方案與利率由負擔試算頁套用；每月負擔金額仍可手動調整。</p>
                                <div class="loan-plan-summary mb-3">
                                    <div class="loan-plan-summary-core">
                                        <div class="loan-plan-header">
                                            <span class="loan-plan-badge">
                                                {{ form.loanPlan === 'regular' ? '一般首購' : '新青安 3.0' }}
                                            </span>
                                            <span class="loan-remainder">
                                                尾差 1 元歸
                                                <strong>{{ form.loanRemainderRecipient === 'B' ? '乙方' : '甲方' }}</strong>
                                            </span>
                                        </div>
                                        <div class="loan-rate-grid" :class="{ 'loan-rate-grid-regular': form.loanPlan === 'regular' }">
                                            <div v-if="form.loanPlan === 'regular'" class="loan-rate-item">
                                                貸款年限
                                                <strong>{{ form.regularLoanYears }} 年</strong>
                                            </div>
                                            <div v-if="form.loanPlan === 'regular'" class="loan-rate-item">
                                                適用年利率
                                                <strong>{{ formatRate(form.regularLoanRate) }}%</strong>
                                            </div>
                                            <template v-else>
                                                <div class="loan-rate-item">
                                                    青安年限
                                                    <strong>{{ form.youthLoanYears }} 年</strong>
                                                </div>
                                                <div class="loan-rate-item">
                                                    前 3 年利率
                                                    <strong>{{ formatRate(form.youthPreferentialRate) }}%</strong>
                                                </div>
                                                <div class="loan-rate-item">
                                                    完全退場利率
                                                    <strong>{{ formatRate(form.youthOriginalRate) }}%</strong>
                                                </div>
                                                <div class="loan-rate-item">
                                                    一般貸款年限
                                                    <strong>{{ form.generalLoanYears }} 年</strong>
                                                </div>
                                                <div class="loan-rate-item">
                                                    一般貸款利率
                                                    <strong>{{ formatRate(form.generalLoanRate) }}%</strong>
                                                </div>
                                            </template>
                                        </div>
                                    </div>
                                </div>
                                <div v-if="form.loanPlan === 'regular'" class="row g-2 mb-3">
                                    <div class="col-12">
                                        <strong class="small">每月負擔</strong>
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label mb-0">甲方每月負擔</label>
                                        <input :value="formatMoney(form.monthlyLoanA)" type="text" class="form-control"
                                            inputmode="numeric" placeholder="金額"
                                            @input="onMoneyInput('monthlyLoanA', $event)" />
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label mb-0">乙方每月負擔</label>
                                        <input :value="formatMoney(form.monthlyLoanB)" type="text" class="form-control"
                                            inputmode="numeric" placeholder="金額"
                                            @input="onMoneyInput('monthlyLoanB', $event)" />
                                    </div>
                                </div>
                                <div v-else class="loan-payment-periods">
                                    <div v-for="period in youthPaymentPeriods" :key="period.label"
                                        class="loan-payment-period">
                                        <strong class="loan-payment-period-title">{{ period.label }}</strong>
                                        <div class="row g-2">
                                            <div class="col-md-6">
                                                <label class="form-label mb-0">甲方每月負擔</label>
                                                <input :value="formatMoney(form[period.aKey])" type="text"
                                                    class="form-control" inputmode="numeric" placeholder="金額"
                                                    @input="onMoneyInput(period.aKey, $event)" />
                                            </div>
                                            <div class="col-md-6">
                                                <label class="form-label mb-0">乙方每月負擔</label>
                                                <input :value="formatMoney(form[period.bKey])" type="text"
                                                    class="form-control" inputmode="numeric" placeholder="金額"
                                                    @input="onMoneyInput(period.bKey, $event)" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>

                        <div class="mb-3">
                            <label class="form-label">產權登記方式</label>
                            <textarea v-model="form.ownership" rows="2" class="form-control"
                                placeholder="例如：按出資比例共有，或各二分之一共有，如另有約定可補充。"></textarea>
                        </div>

                        <h5 class="mb-3 mt-4 fw-bold">
                            <i class="mdi mdi-cash-multiple me-2 text-light opacity-75" />
                            貸款與日常費用
                        </h5>
                        <div class="ps-4">
                            <div class="mb-3">
                                <label class="form-label">貸款責任與繳款方式</label>
                                <textarea v-model="form.loan" rows="3" class="form-control"
                                    placeholder="例如：貸款總額新台幣〇〇〇萬元，每月本息由雙方依出資比例負擔，如一方代繳得請求償還並計息等。"></textarea>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">管理費、稅費與修繕費</label>
                                <textarea v-model="form.expenses" rows="3" class="form-control"
                                    placeholder="例如：管理費、房屋稅、地價稅、保險費及必要修繕費，均依出資比例分擔。"></textarea>
                            </div>
                        </div>

                        <h5 class="mb-3 mt-4 fw-bold">
                            <i class="mdi mdi-alert-outline me-2 text-light opacity-75" />
                            出售、關係變動與風險
                        </h5>
                        <div class="ps-4">
                            <div class="mb-3">
                                <label class="form-label">出售或分割機制</label>
                                <textarea v-model="form.saleMechanism" rows="3" class="form-control"
                                    placeholder="例如：未經雙方書面同意不得單方出售；一方欲出售持分時，另一方享有優先承買權，價格依鑑價公司估價等。"></textarea>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">關係終止時處理方式</label>
                                <textarea v-model="form.relationshipEnd" rows="3" class="form-control"
                                    placeholder="例如：優先由一方買回對方持分，無法買回則合意出售並按出資比例分配價金。"></textarea>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">一方死亡時之處理</label>
                                <textarea v-model="form.deathArrangement" rows="3" class="form-control"
                                    placeholder="例如：存活一方得優先向繼承人買回持分，價格依鑑價結果計算，並建議另立遺囑配合。"></textarea>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">重大違約與其他風險提醒（選填）</label>
                                <textarea v-model="form.breach" rows="3" class="form-control"
                                    placeholder="例如：惡意拒繳貸款、私自設定抵押、故意損害房屋時之處理方式，可約定強制出售或損害賠償等。"></textarea>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
            <div class="col-md-5 mb-3">
                <div class="card card-soft">
                    <div class="card-body">
                        <h5 class="mb-3">共同購屋協議草稿（預覽）</h5>
                        <p class="small text-muted mb-3">以下內容會依照左側填寫自動更新，並作為 PDF 範例文字。</p>
                        <p class="mb-0" style="white-space: pre-line">
                            {{ previewText }}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, reactive } from 'vue';
import { useDocumentDraft } from '../../composables/useDocumentDraft';
import { DOCUMENT_BY_KEY } from '../../constants/documents';
import { consumeLoanCalculatorResult } from '../../services/loanTransfer';
import { formatRate } from '../../services/loanCalculator';

const documentMeta = DOCUMENT_BY_KEY.jointPurchase;

const form = reactive({
    partnerA: '',
    partnerB: '',
    location: '',
    landNumber: '',
    buildingDetail: '',
    totalPrice: null,
    downContractA: null,
    downContractB: null,
    downStage1A: null,
    downStage1B: null,
    downStage2A: null,
    downStage2B: null,
    downAgencyA: null,
    downAgencyB: null,
    handoverA: null,
    handoverB: null,
    decorationA: null,
    decorationB: null,
    furnitureA: null,
    furnitureB: null,
    applianceA: null,
    applianceB: null,
    inspectionA: null,
    inspectionB: null,
    cleaningA: null,
    cleaningB: null,
    movingA: null,
    movingB: null,
    rentA: null,
    rentB: null,
    monthlyLoanA: null,
    monthlyLoanB: null,
    monthlyLoanYear4A: null,
    monthlyLoanYear4B: null,
    monthlyLoanYear5A: null,
    monthlyLoanYear5B: null,
    monthlyLoanYear6A: null,
    monthlyLoanYear6B: null,
    monthlyLoanAfterExitA: null,
    monthlyLoanAfterExitB: null,
    loanPlan: 'regular',
    regularLoanAmount: null,
    regularLoanYears: 30,
    youthLoanYears: 40,
    generalLoanYears: 30,
    loanGraceYears: 0,
    generalLoanGraceYears: 0,
    regularLoanRate: 2.2,
    youthPreferentialRate: 1.775,
    youthOriginalRate: 2.275,
    generalLoanRate: 2.2,
    loanRemainderRecipient: 'A',
    ownership: '',
    loan: '',
    expenses: '',
    saleMechanism: '',
    relationshipEnd: '',
    deathArrangement: '',
    breach: '',
});

const youthPaymentPeriods = [
    { label: '第 1–3 年', aKey: 'monthlyLoanA', bKey: 'monthlyLoanB' },
    { label: '第 4 年', aKey: 'monthlyLoanYear4A', bKey: 'monthlyLoanYear4B' },
    { label: '第 5 年', aKey: 'monthlyLoanYear5A', bKey: 'monthlyLoanYear5B' },
    { label: '第 6 年', aKey: 'monthlyLoanYear6A', bKey: 'monthlyLoanYear6B' },
    { label: '完全退場後（第 7 年起）', aKey: 'monthlyLoanAfterExitA', bKey: 'monthlyLoanAfterExitB' },
];

const asNumber = (value) => {
    const num = Number(value);
    return Number.isFinite(num) ? num : 0;
};

const formatPercent = (value) => `${asNumber(value).toFixed(1).replace(/\.0$/, '')}%`;

const formatMoney = (value) => {
    if (value === null || value === undefined || value === '') {
        return '';
    }
    const num = Number(value);
    if (Number.isNaN(num)) {
        return '';
    }
    return num.toLocaleString('zh-TW');
};

const onMoneyInput = (key, event) => {
    const raw = String(event.target.value || '').replace(/,/g, '');
    if (raw === '') {
        form[key] = null;
        event.target.value = '';
        return;
    }
    const num = Number(raw);
    if (Number.isNaN(num)) {
        event.target.value = raw.replace(/[^\d.]/g, '');
        return;
    }
    form[key] = num;
    event.target.value = formatMoney(num);
};

const applyLoanCalculatorResult = () => {
    const result = consumeLoanCalculatorResult();
    if (!result) return;
    try {
        const assignNumberIfPresent = (key, value) => {
            if (value !== null && value !== undefined && Number.isFinite(Number(value))) {
                form[key] = Number(value);
            }
        };
        assignNumberIfPresent('totalPrice', result.totalPrice);
        assignNumberIfPresent('regularLoanAmount', result.regularLoanAmount);
        assignNumberIfPresent('loanGraceYears', result.graceYears);
        assignNumberIfPresent('generalLoanGraceYears', result.generalGraceYears);
        assignNumberIfPresent('regularLoanYears', result.regularLoanYears);
        assignNumberIfPresent('youthLoanYears', result.youthLoanYears);
        assignNumberIfPresent('generalLoanYears', result.generalLoanYears);
        form.loanPlan = result.loanPlan === 'youth' ? 'youth' : 'regular';
        form.loanRemainderRecipient = result.remainderRecipient === 'B' ? 'B' : 'A';
        assignNumberIfPresent('regularLoanRate', result.regularLoanRate);
        assignNumberIfPresent('youthPreferentialRate', result.youthPreferentialRate);
        assignNumberIfPresent('youthOriginalRate', result.youthOriginalRate);
        assignNumberIfPresent('generalLoanRate', result.generalLoanRate);
        form.monthlyLoanA = asNumber(result.firstYearA);
        form.monthlyLoanB = asNumber(result.firstYearB);
        form.monthlyLoanYear4A = asNumber(result.year4A);
        form.monthlyLoanYear4B = asNumber(result.year4B);
        form.monthlyLoanYear5A = asNumber(result.year5A);
        form.monthlyLoanYear5B = asNumber(result.year5B);
        form.monthlyLoanYear6A = asNumber(result.year6A);
        form.monthlyLoanYear6B = asNumber(result.year6B);
        form.monthlyLoanAfterExitA = asNumber(result.afterExitA);
        form.monthlyLoanAfterExitB = asNumber(result.afterExitB);
    } catch (e) {
        console.error(e);
    }
};

const computePairTotals = (label, keysA, keysB) => {
    const a = keysA.reduce((sum, key) => sum + asNumber(form[key]), 0);
    const b = keysB.reduce((sum, key) => sum + asNumber(form[key]), 0);
    const sum = a + b;
    if (sum <= 0) {
        return { a: 0, b: 0, text: '' };
    }
    const aRatio = sum > 0 ? (a / sum) * 100 : 0;
    const bRatio = sum > 0 ? (b / sum) * 100 : 0;
    const text =
        `${label}：甲方約 ${a.toLocaleString('zh-TW')} 元（${formatPercent(aRatio)}），` +
        `乙方約 ${b.toLocaleString('zh-TW')} 元（${formatPercent(bRatio)}）。`;
    return { a, b, text, aRatio, bRatio };
};

const downPaymentTotals = computed(() => {
    return computePairTotals(
        '購屋款合計',
        ['downContractA', 'downStage1A', 'downStage2A', 'downAgencyA', 'handoverA'],
        ['downContractB', 'downStage1B', 'downStage2B', 'downAgencyB', 'handoverB'],
    );
});

const preMoveTotals = computed(() => {
    return computePairTotals(
        '入住前支出合計',
        ['decorationA', 'furnitureA', 'applianceA', 'inspectionA'],
        ['decorationB', 'furnitureB', 'applianceB', 'inspectionB'],
    );
});

const miscTotals = computed(() => {
    return computePairTotals(
        '其他雜項支出合計',
        ['cleaningA', 'movingA'],
        ['cleaningB', 'movingB'],
    );
});

const contributionSummary = computed(() => {
    const total = asNumber(form.totalPrice);
    const oneTimeA =
        downPaymentTotals.value.a +
        preMoveTotals.value.a +
        miscTotals.value.a;
    const oneTimeB =
        downPaymentTotals.value.b +
        preMoveTotals.value.b +
        miscTotals.value.b;
    const oneTimeSum = oneTimeA + oneTimeB;
    if (total <= 0 || oneTimeSum <= 0) {
        return {
            total: 0,
            oneTimeA: 0,
            oneTimeB: 0,
            oneTimeSum: 0,
            aRatio: 0,
            bRatio: 0,
        };
    }
    const aRatio = (oneTimeA / oneTimeSum) * 100;
    const bRatio = (oneTimeB / oneTimeSum) * 100;
    return {
        total,
        oneTimeA,
        oneTimeB,
        oneTimeSum,
        aRatio,
        bRatio,
    };
});

function buildContributionText() {
    const summary = contributionSummary.value;
    const parts = [];

    const addPairDetail = (label, a, b) => {
        const va = asNumber(a);
        const vb = asNumber(b);
        if (va <= 0 && vb <= 0) {
            return;
        }
        parts.push(
            `${label}：甲方約新台幣 ${va.toLocaleString('zh-TW')} 元，乙方約新台幣 ${vb.toLocaleString(
                'zh-TW',
            )} 元。`,
        );
    };

    if (summary.total > 0) {
        parts.push(`(一) 房屋總價：新台幣 ${summary.total.toLocaleString('zh-TW')} 元。`);
    }

    if (summary.oneTimeSum > 0) {
        parts.push(
            `(二) 截至入住前累積出資：甲方約新台幣 ${summary.oneTimeA.toLocaleString(
                'zh-TW',
            )} 元（約 ${formatPercent(summary.aRatio)}），乙方約新台幣 ${summary.oneTimeB.toLocaleString(
                'zh-TW',
            )} 元（約 ${formatPercent(summary.bRatio)}）。`,
        );

        const anyDown = downPaymentTotals.value.a > 0 || downPaymentTotals.value.b > 0;
        if (anyDown) {
            parts.push('　1. 頭期款明細：');
            addPairDetail('　　・簽約金', form.downContractA, form.downContractB);
            addPairDetail('　　・工程款一', form.downStage1A, form.downStage1B);
            addPairDetail('　　・工程款二', form.downStage2A, form.downStage2B);
            addPairDetail('　　・代收款', form.downAgencyA, form.downAgencyB);
            addPairDetail('　　・交屋款', form.handoverA, form.handoverB);
        }

        const anyPreMove = preMoveTotals.value.a > 0 || preMoveTotals.value.b > 0;
        if (anyPreMove) {
            parts.push('　2. 入住前支出明細：');
            addPairDetail('　　・裝潢款', form.decorationA, form.decorationB);
            addPairDetail('　　・家具', form.furnitureA, form.furnitureB);
            addPairDetail('　　・家電', form.applianceA, form.applianceB);
            addPairDetail('　　・驗屋費用', form.inspectionA, form.inspectionB);
        }

        const anyMisc = miscTotals.value.a > 0 || miscTotals.value.b > 0;
        if (anyMisc) {
            parts.push('　3. 其他雜項支出明細：');
            addPairDetail('　　・清潔費', form.cleaningA, form.cleaningB);
            addPairDetail('　　・搬家費用', form.movingA, form.movingB);
        }
    }

    if (!parts.length) {
        return '本標的物總價款及雙方出資比例，由甲乙雙方依實際出資情形協議約定，原則上以出資比例為準。';
    }

    return parts.join('\n');
}

const previewText = computed(() => {
    const a = form.partnerA || '甲方（姓名待填）';
    const b = form.partnerB || '乙方（姓名待填）';

    const locationText =
        form.location.trim() ||
        '坐落地點：＿＿＿＿＿＿（建議填寫完整地址）。';
    const landNumberText =
        form.landNumber.trim() ||
        '地號／建號：＿＿＿＿＿＿。';
    const buildingDetailText =
        form.buildingDetail.trim() ||
        '建物面積與車位：＿＿＿＿＿＿（如有車位或其他附屬設備，可於此載明）。';

    const contributionText = buildContributionText();

    const ownershipText =
        form.ownership.trim() ||
        '產權登記原則上以出資比例共有，如雙方同意各二分之一或其他比例，得另行載明。';

    const loanText =
        form.loan.trim() ||
        '如需辦理銀行貸款，貸款總額由雙方共同決定，每月本息依出資比例或另行約定之比例分擔；如一方代為繳納，他方應返還其代墊款項，必要時得約定合理利息。';
    const firstYearLoanTotal = asNumber(form.monthlyLoanA) + asNumber(form.monthlyLoanB);
    const afterExitLoanTotal = asNumber(form.monthlyLoanAfterExitA) + asNumber(form.monthlyLoanAfterExitB);
    const youthPaymentText = youthPaymentPeriods
        .map((period) => {
            const partyA = asNumber(form[period.aKey]);
            const partyB = asNumber(form[period.bKey]);
            if (partyA + partyB <= 0) return '';
            return `${period.label}：甲方新台幣 ${partyA.toLocaleString('zh-TW')} 元、乙方新台幣 ${partyB.toLocaleString('zh-TW')} 元`;
        })
        .filter(Boolean)
        .join('；');
    let loanBurdenText = '';
    if (form.loanPlan === 'regular' && firstYearLoanTotal > 0) {
        const priceText = asNumber(form.totalPrice) > 0
            ? `房屋總價新台幣 ${asNumber(form.totalPrice).toLocaleString('zh-TW')} 元，`
            : '';
        const loanAmountText = asNumber(form.regularLoanAmount) > 0
            ? `貸款金額新台幣 ${asNumber(form.regularLoanAmount).toLocaleString('zh-TW')} 元，`
            : '';
        loanBurdenText = `\n貸款方案：一般首購，${priceText}${loanAmountText}貸款年限 ${asNumber(form.regularLoanYears)} 年，適用年利率 ${formatRate(form.regularLoanRate)}%，寬限期 ${asNumber(form.loanGraceYears)} 年。每月貸款負擔概算為甲方新台幣 ${asNumber(form.monthlyLoanA).toLocaleString('zh-TW')} 元、乙方新台幣 ${asNumber(form.monthlyLoanB).toLocaleString('zh-TW')} 元；整數元尾差歸${form.loanRemainderRecipient === 'B' ? '乙方' : '甲方'}。實際金額仍以銀行核貸及計息結果為準。`;
    }
    if (form.loanPlan === 'youth' && (firstYearLoanTotal > 0 || afterExitLoanTotal > 0)) {
        loanBurdenText = `\n貸款方案：新青安 3.0，青安貸款年限 ${asNumber(form.youthLoanYears)} 年、寬限期 ${asNumber(form.loanGraceYears)} 年，前 3 年優惠年利率 ${formatRate(form.youthPreferentialRate)}%，補貼完全退場後年利率 ${formatRate(form.youthOriginalRate)}%；搭配之一般貸款年限 ${asNumber(form.generalLoanYears)} 年、年利率 ${formatRate(form.generalLoanRate)}%，寬限期 ${asNumber(form.generalLoanGraceYears)} 年。每月貸款負擔概算如下：${youthPaymentText}；整數元尾差歸${form.loanRemainderRecipient === 'B' ? '乙方' : '甲方'}。實際金額仍以銀行核貸及計息結果為準。`;
    }

    const expensesText =
        form.expenses.trim() ||
        '管理費、房屋稅、地價稅、保險費及必要修繕費用，原則上均依出資比例由雙方共同負擔，若有特殊修繕或裝潢支出，得另行協議。';

    const saleMechanismText =
        form.saleMechanism.trim() ||
        '未經雙方書面同意，任何一方不得單獨出售或設定抵押其持分。如一方有意出售持分，另一方享有優先承買權，價格可依雙方同意之鑑價公司估價作為計算基礎。';

    const relationshipEndText =
        form.relationshipEnd.trim() ||
        '如雙方關係終止，原則上優先由其中一方依合理價格買回他方持分；如雙方均不願或無力買回時，得合意出售標的物，並按出資比例分配價金。';

    const deathArrangementText =
        form.deathArrangement.trim() ||
        '如一方死亡，存活之一方得在合理期間內，以雙方同意之鑑價結果為基礎，優先向繼承人買回其持分。雙方並應另行立遺囑，以減少與繼承人共同共有所生之糾紛。';

    const breachText =
        form.breach.trim() ||
        '如一方有惡意拒繳貸款、私自設定抵押或故意損害房屋等重大違約情形，另一方得請求損害賠償，並得協議強制出售、買回其持分或採取其他必要之法律途徑。';

    return `一、立約人
甲方：${a}
乙方：${b}
雙方基於共同出資購置不動產之事實，為明確權利義務，依民法相關規定訂立本協議。

二、標的物
${locationText}
${landNumberText}
${buildingDetailText}

三、出資比例與產權登記
${contributionText}
${ownershipText}

四、貸款責任
${loanText}${loanBurdenText}

五、日常費用負擔
${expensesText}

六、出售或分割機制
${saleMechanismText}

七、關係終止時之處理
${relationshipEndText}

八、一方死亡時之處理
${deathArrangementText}

九、重大違約
${breachText}

十、爭議解決與公證建議
如有爭議，雙方應先本於誠信原則協商處理；協商不成時，以＿＿地方法院為第一審管轄法院。
為提升本協議之證明力與安定性，強烈建議雙方攜帶本協議內容洽公證人，依實際需求調整條文並辦理公證。`;
});

const {
    downloading,
    error,
    lastSavedText,
    onDownload,
    onSaveDraft,
    saving,
    showFloatingSave,
} = useDocumentDraft({
    type: documentMeta.type,
    title: documentMeta.draftTitle,
    form,
    previewText,
    afterLoad: applyLoanCalculatorResult,
});
</script>

<style scoped>
.loan-plan-summary {
    padding: 0.3rem;
    border-radius: 1rem;
    background: rgba(255, 255, 255, 0.08);
    box-shadow:
        inset 0 0 0 1px rgba(255, 255, 255, 0.1),
        0 0.65rem 1.5rem rgba(17, 27, 48, 0.12);
}

.loan-calculator-link {
    position: relative;
}

.loan-calculator-link::after {
    content: '';
    position: absolute;
    inset: -0.3rem;
    border: 2px solid rgba(255, 255, 255, 0.88);
    border-radius: inherit;
    box-shadow: 0 0 0.8rem rgba(255, 255, 255, 0.55);
    pointer-events: none;
    animation: loan-calculator-link-breathe 2s ease-in-out infinite;
}

@keyframes loan-calculator-link-breathe {
    0%,
    100% {
        opacity: 0.38;
        transform: scale(0.97);
    }

    50% {
        opacity: 1;
        transform: scale(1.04);
    }
}

@media (prefers-reduced-motion: reduce) {
    .loan-calculator-link::after {
        animation: none;
        opacity: 0.72;
    }
}

.loan-plan-summary-core {
    overflow: hidden;
    border-radius: 0.75rem;
    background: linear-gradient(145deg, rgba(35, 51, 78, 0.72), rgba(31, 43, 67, 0.58));
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.loan-plan-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.8rem 0.9rem;
}

.loan-plan-badge {
    color: #ffe2a8;
    font-size: 0.85rem;
    font-weight: 800;
    letter-spacing: 0.02em;
}

.loan-remainder {
    display: inline-flex;
    align-items: baseline;
    gap: 0.35rem;
    color: rgba(255, 255, 255, 0.64);
    font-size: 0.76rem;
}

.loan-remainder strong {
    color: #ffffff;
    font-size: 0.9rem;
}

.loan-rate-grid {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    border-top: 1px solid rgba(255, 255, 255, 0.09);
}

.loan-rate-grid-regular {
    grid-template-columns: repeat(2, minmax(0, 1fr));
}

.loan-rate-item {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 0.25rem;
    min-width: 0;
    padding: 0.75rem 0.9rem 0.85rem;
    color: rgba(255, 255, 255, 0.58);
    font-size: 0.72rem;
    letter-spacing: 0.02em;
}

.loan-rate-item + .loan-rate-item {
    border-left: 1px solid rgba(255, 255, 255, 0.09);
}

.loan-rate-item strong {
    color: #fff;
    font-size: 1.05rem;
    font-variant-numeric: tabular-nums;
}

@media (max-width: 575.98px) {
    .loan-rate-grid,
    .loan-rate-grid-regular {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}

@media (max-width: 420px) {
    .loan-plan-header {
        align-items: flex-start;
        flex-direction: column;
        gap: 0.3rem;
    }

    .loan-rate-item {
        padding-inline: 0.6rem;
    }
}

.loan-payment-periods {
    display: grid;
    gap: 0.85rem;
}

.loan-payment-period {
    padding: 0.85rem;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 0.75rem;
    background: rgba(255, 255, 255, 0.04);
}

.loan-payment-period-title {
    display: block;
    margin-bottom: 0.55rem;
    color: #ffd88a;
    font-size: 0.9rem;
}
</style>

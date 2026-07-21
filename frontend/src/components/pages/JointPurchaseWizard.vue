<template>
    <div class="wizard-container text-light">
        <teleport to="body">
            <button v-if="showFloatingSave" type="button" class="save-button-position btn btn-outline-light btn-sm me-2"
                :disabled="saving" @click="onSaveDraft">
                <span v-if="saving">儲存中…</span>
                <span v-else>儲存</span>
            </button>
        </teleport>
        <div class="d-flex justify-content-between align-items-start mb-3">
            <div>
                <h3 class="mb-1">共同購屋協議</h3>
                <p class="mb-0">釐清共同出資買房時的權利義務與風險分擔。</p>
            </div>
            <div class="text-end">
                <p v-if="lastSavedText" class="mb-1 small text-light opacity-75">
                    上次編輯：{{ lastSavedText }}
                </p>
                <div class="d-flex justify-content-end">
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
                                    <router-link class="btn btn-outline-light btn-sm" to="/tools/monthly-loan">
                                        前往負擔試算
                                    </router-link>
                                </div>
                                <p class="small text-muted">方案與利率由負擔試算頁套用；每月負擔金額仍可手動調整。</p>
                                <div class="rounded border border-light border-opacity-25 p-3 mb-3">
                                    <div v-if="form.loanPlan === 'regular'"
                                        class="d-flex flex-wrap align-items-end gap-3">
                                        <span class="badge rounded-pill text-bg-light px-3 py-2">
                                            一般首購
                                        </span>
                                        <div class="compact-rate-field">
                                            <label class="form-label mb-0">適用年利率</label>
                                            <div class="input-group">
                                                <input :value="asNumber(form.regularLoanRate).toFixed(3)" type="text"
                                                    class="form-control" readonly />
                                                <span class="input-group-text">%</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div v-else class="d-flex flex-wrap align-items-end gap-3">
                                        <span class="badge rounded-pill text-bg-light px-3 py-2">
                                            新青安 3.0
                                        </span>
                                        <div class="compact-rate-field">
                                            <label class="form-label mb-0">前 3 年優惠利率</label>
                                            <div class="input-group">
                                                <input :value="asNumber(form.youthPreferentialRate).toFixed(3)" type="text"
                                                    class="form-control" readonly />
                                                <span class="input-group-text">%</span>
                                            </div>
                                        </div>
                                        <div class="compact-rate-field">
                                            <label class="form-label mb-0">完全退場後利率</label>
                                            <div class="input-group">
                                                <input :value="asNumber(form.youthOriginalRate).toFixed(3)" type="text"
                                                    class="form-control" readonly />
                                                <span class="input-group-text">%</span>
                                            </div>
                                        </div>
                                        <div class="compact-rate-field">
                                            <label class="form-label mb-0">搭配一般貸款年利率</label>
                                            <div class="input-group">
                                                <input :value="asNumber(form.generalLoanRate).toFixed(3)" type="text"
                                                    class="form-control" readonly />
                                                <span class="input-group-text">%</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="row g-2 mb-3">
                                    <div class="col-12">
                                        <strong class="small">{{ form.loanPlan === 'regular' ? '每月負擔' : '第一年每月負擔' }}</strong>
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
                                <div v-if="form.loanPlan === 'youth'" class="row g-2">
                                    <div class="col-12"><strong class="small">利息補貼完全退場後</strong></div>
                                    <div class="col-md-6">
                                        <label class="form-label mb-0">甲方每月負擔</label>
                                        <input :value="formatMoney(form.monthlyLoanAfterExitA)" type="text"
                                            class="form-control" inputmode="numeric" placeholder="金額"
                                            @input="onMoneyInput('monthlyLoanAfterExitA', $event)" />
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label mb-0">乙方每月負擔</label>
                                        <input :value="formatMoney(form.monthlyLoanAfterExitB)" type="text"
                                            class="form-control" inputmode="numeric" placeholder="金額"
                                            @input="onMoneyInput('monthlyLoanAfterExitB', $event)" />
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

                        <p v-if="error" class="text-danger mt-2 mb-0">{{ error }}</p>
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
import { LOAN_CALCULATOR_TRANSFER_KEY } from '../../constants/loanCalculator';

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
    monthlyLoanAfterExitA: null,
    monthlyLoanAfterExitB: null,
    loanPlan: 'regular',
    regularLoanRate: 2.2,
    youthPreferentialRate: 1.775,
    youthOriginalRate: 2.275,
    generalLoanRate: 2.2,
    ownership: '',
    loan: '',
    expenses: '',
    saleMechanism: '',
    relationshipEnd: '',
    deathArrangement: '',
    breach: '',
});

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
    const raw = window.sessionStorage.getItem(LOAN_CALCULATOR_TRANSFER_KEY);
    if (!raw) return;
    try {
        const result = JSON.parse(raw);
        const assignNumberIfPresent = (key, value) => {
            if (value !== null && value !== undefined && Number.isFinite(Number(value))) {
                form[key] = Number(value);
            }
        };
        form.loanPlan = result.loanPlan === 'youth' ? 'youth' : 'regular';
        assignNumberIfPresent('regularLoanRate', result.regularLoanRate);
        assignNumberIfPresent('youthPreferentialRate', result.youthPreferentialRate);
        assignNumberIfPresent('youthOriginalRate', result.youthOriginalRate);
        assignNumberIfPresent('generalLoanRate', result.generalLoanRate);
        form.monthlyLoanA = asNumber(result.firstYearA);
        form.monthlyLoanB = asNumber(result.firstYearB);
        form.monthlyLoanAfterExitA = asNumber(result.afterExitA);
        form.monthlyLoanAfterExitB = asNumber(result.afterExitB);
    } catch (e) {
        console.error(e);
    } finally {
        window.sessionStorage.removeItem(LOAN_CALCULATOR_TRANSFER_KEY);
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
    let loanBurdenText = '';
    if (form.loanPlan === 'regular' && firstYearLoanTotal > 0) {
        loanBurdenText = `\n貸款方案：一般首購，適用年利率 ${asNumber(form.regularLoanRate).toFixed(3)}%。每月貸款負擔概算為甲方新台幣 ${asNumber(form.monthlyLoanA).toLocaleString('zh-TW')} 元、乙方新台幣 ${asNumber(form.monthlyLoanB).toLocaleString('zh-TW')} 元。實際金額仍以銀行核貸及計息結果為準。`;
    }
    if (form.loanPlan === 'youth' && (firstYearLoanTotal > 0 || afterExitLoanTotal > 0)) {
        loanBurdenText = `\n貸款方案：新青安 3.0，前 3 年優惠年利率 ${asNumber(form.youthPreferentialRate).toFixed(3)}%，補貼完全退場後年利率 ${asNumber(form.youthOriginalRate).toFixed(3)}%，搭配之一般貸款年利率 ${asNumber(form.generalLoanRate).toFixed(3)}%。第一年每月貸款負擔概算為甲方新台幣 ${asNumber(form.monthlyLoanA).toLocaleString('zh-TW')} 元、乙方新台幣 ${asNumber(form.monthlyLoanB).toLocaleString('zh-TW')} 元；利息補貼完全退場後，甲方約新台幣 ${asNumber(form.monthlyLoanAfterExitA).toLocaleString('zh-TW')} 元、乙方約新台幣 ${asNumber(form.monthlyLoanAfterExitB).toLocaleString('zh-TW')} 元。實際金額仍以銀行核貸及計息結果為準。`;
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
.compact-rate-field {
    width: 11.5rem;
    max-width: 100%;
}
</style>

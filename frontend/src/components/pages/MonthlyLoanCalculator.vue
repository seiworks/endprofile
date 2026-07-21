<template>
    <div class="container py-5 fade-in-up">
        <div class="calculator-shell text-light">
            <div class="d-flex flex-column flex-lg-row justify-content-between align-items-lg-end gap-3 mb-4">
                <div>
                    <p class="calculator-kicker mb-2">購屋試算工具</p>
                    <h1 class="calculator-title mb-2">每月貸款負擔試算</h1>
                    <p class="mb-0 text-light opacity-75">輸入貸款條件，快速比較每月總繳款與雙方分攤金額。</p>
                </div>
                <div class="d-flex flex-wrap gap-2">
                    <button type="button" class="btn highlight-action-button" @click="applyToJointPurchase">
                        <i class="mdi mdi-check-circle-outline me-1" />
                        套用
                    </button>
                    <router-link class="btn btn-outline-light calculator-back-button" to="/endprofile/joint-purchase">
                        返回共同購屋協議
                    </router-link>
                </div>
            </div>

            <div class="row g-4">
                <div class="col-lg-7">
                    <div class="card card-soft h-100">
                        <div class="card-body">
                            <p class="small text-light opacity-75 mb-3">欄位已帶入示範值，請依銀行實際核貸條件調整。</p>
                            <div class="d-flex gap-2 mb-4" role="group" aria-label="貸款方案">
                                <button type="button" class="btn flex-fill"
                                    :class="form.loanType === 'regular' ? 'btn-light' : 'btn-outline-light'"
                                    @click="form.loanType = 'regular'">
                                    一般首購
                                </button>
                                <button type="button" class="btn flex-fill"
                                    :class="form.loanType === 'youth' ? 'btn-light' : 'btn-outline-light'"
                                    @click="form.loanType = 'youth'">
                                    新青安＋一般貸款
                                </button>
                            </div>

                            <div class="row g-3 mb-4">
                                <div class="col-md-7">
                                    <label class="form-label">房屋總價</label>
                                    <div class="input-group">
                                        <input :value="formatMoney(form.totalPrice)" type="text" class="form-control"
                                            inputmode="numeric" placeholder="例如：12,000,000"
                                            @input="onMoneyInput('totalPrice', $event)" />
                                        <span class="input-group-text">元</span>
                                    </div>
                                </div>
                                <div class="col-md-5">
                                    <label class="form-label">貸款成數</label>
                                    <div class="input-group">
                                        <input v-model.number="form.ltv" type="number" min="0" max="100"
                                            class="form-control" />
                                        <span class="input-group-text">%</span>
                                    </div>
                                </div>
                            </div>

                            <div v-if="form.loanType === 'regular'" class="loan-section">
                                <h5 class="mb-3">一般貸款條件</h5>
                                <div class="row g-3">
                                    <div class="col-md-6">
                                        <label class="form-label">貸款總額</label>
                                        <input :value="formatMoney(estimatedLoanAmount)" type="text"
                                            class="form-control" readonly />
                                    </div>
                                    <div class="col-6 col-md-3">
                                        <label class="form-label">年利率</label>
                                        <div class="input-group">
                                            <input v-model.number="form.regularRate" type="number" min="0" step="0.001"
                                                class="form-control" />
                                            <span class="input-group-text">%</span>
                                        </div>
                                    </div>
                                    <div class="col-6 col-md-3">
                                        <label class="form-label">貸款年限</label>
                                        <div class="input-group">
                                            <input v-model.number="form.regularYears" type="number" min="1"
                                                class="form-control" />
                                            <span class="input-group-text">年</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div v-else class="loan-section">
                                <h5 class="mb-3">新青安與一般貸款條件</h5>
                                <div class="loan-subsection mb-3">
                                    <div class="loan-subsection-title">
                                        <i class="mdi mdi-home-heart me-2" />
                                        新青安 3.0
                                    </div>
                                    <div class="row g-3">
                                        <div class="col-12 col-md-7">
                                            <label class="form-label">青安貸款金額</label>
                                            <div class="input-group">
                                                <input :value="formatMoney(form.youthAmount)" type="text"
                                                    class="form-control" inputmode="numeric"
                                                    @input="onMoneyInput('youthAmount', $event)" />
                                                <span class="input-group-text">元</span>
                                            </div>
                                        </div>
                                        <div class="col-12 col-md-5">
                                            <label class="form-label">貸款年限</label>
                                            <div class="input-group">
                                                <input v-model.number="form.youthYears" type="number" min="1"
                                                    class="form-control" />
                                                <span class="input-group-text">年</span>
                                            </div>
                                        </div>
                                        <div class="col-12 col-md-6">
                                            <label class="form-label">優惠利率</label>
                                            <div class="input-group">
                                                <input v-model.number="form.youthPreferentialRate" type="number" min="0"
                                                    step="0.001" class="form-control" />
                                                <span class="input-group-text">%</span>
                                            </div>
                                        </div>
                                        <div class="col-12 col-md-6">
                                            <label class="form-label">完全退場後利率</label>
                                            <div class="input-group">
                                                <input v-model.number="form.youthOriginalRate" type="number" min="0"
                                                    step="0.001" class="form-control" />
                                                <span class="input-group-text">%</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="loan-subsection">
                                    <div class="loan-subsection-title">
                                        <i class="mdi mdi-bank-outline me-2" />
                                        一般貸款
                                    </div>
                                    <div class="row g-3">
                                        <div class="col-12 col-md-6">
                                            <label class="form-label">一般貸款金額</label>
                                            <div class="input-group">
                                                <input :value="formatMoney(generalLoanAmount)" type="text"
                                                    class="form-control" readonly />
                                                <span class="input-group-text">元</span>
                                            </div>
                                        </div>
                                        <div class="col-12 col-sm-6 col-md-3">
                                            <label class="form-label">年利率</label>
                                            <div class="input-group">
                                                <input v-model.number="form.generalRate" type="number" min="0"
                                                    step="0.001" class="form-control" />
                                                <span class="input-group-text">%</span>
                                            </div>
                                        </div>
                                        <div class="col-12 col-sm-6 col-md-3">
                                            <label class="form-label">貸款年限</label>
                                            <div class="input-group">
                                                <input v-model.number="form.generalYears" type="number" min="1"
                                                    class="form-control" />
                                                <span class="input-group-text">年</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <hr class="border-light border-opacity-25 my-4" />

                            <h5 class="mb-3">雙方分攤比例</h5>
                            <div class="row g-3">
                                <div class="col-6">
                                    <label class="form-label">甲方</label>
                                    <div class="input-group">
                                        <input v-model.number="form.shareA" type="number" min="0" max="100"
                                            class="form-control" />
                                        <span class="input-group-text">%</span>
                                    </div>
                                </div>
                                <div class="col-6">
                                    <label class="form-label">乙方</label>
                                    <div class="input-group">
                                        <input :value="shareB" type="number" class="form-control" readonly />
                                        <span class="input-group-text">%</span>
                                    </div>
                                </div>
                            </div>
                            <div class="mt-3">
                                <span class="form-label d-block mb-2">整數元無法平分時，多 1 元給</span>
                                <div class="d-flex gap-2" role="group" aria-label="尾差金額歸屬">
                                    <button type="button" class="btn flex-fill"
                                        :class="form.remainderRecipient === 'A' ? 'btn-light' : 'btn-outline-light'"
                                        @click="form.remainderRecipient = 'A'">
                                        甲方（預設）
                                    </button>
                                    <button type="button" class="btn flex-fill"
                                        :class="form.remainderRecipient === 'B' ? 'btn-light' : 'btn-outline-light'"
                                        @click="form.remainderRecipient = 'B'">
                                        乙方
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-lg-5">
                    <div class="card result-card h-100">
                        <div class="card-body d-flex flex-column">
                            <p class="calculator-kicker mb-2">試算結果</p>
                            <p class="small text-light opacity-75 mb-2">
                                {{ form.loanType === 'regular' ? '每月合計負擔' : '第一年每月合計負擔' }}
                            </p>
                            <p class="result-amount mb-4">{{ formatCurrency(firstYearMonthly) }}</p>

                            <div class="result-row">
                                <span>{{ form.loanType === 'regular' ? '甲方每月負擔' : '第一年・甲方' }}</span>
                                <strong>{{ formatCurrency(firstYearA) }}</strong>
                            </div>
                            <div class="result-row">
                                <span>{{ form.loanType === 'regular' ? '乙方每月負擔' : '第一年・乙方' }}</span>
                                <strong>{{ formatCurrency(firstYearB) }}</strong>
                            </div>
                            <template v-if="form.loanType === 'youth'">
                                <div class="result-row">
                                    <span>完全退場後・合計</span>
                                    <strong>{{ formatCurrency(afterExitMonthly) }}</strong>
                                </div>
                                <div class="result-row">
                                    <span>完全退場後・甲方</span>
                                    <strong>{{ formatCurrency(afterExitA) }}</strong>
                                </div>
                                <div class="result-row">
                                    <span>完全退場後・乙方</span>
                                    <strong>{{ formatCurrency(afterExitB) }}</strong>
                                </div>
                                <div class="result-note mt-4">
                                    <strong class="d-block text-light mb-2">青安 3.0 逐年退場概算</strong>
                                    <div v-for="stage in youthStages" :key="stage.year"
                                        class="d-flex justify-content-between gap-3 mb-1">
                                        <span>第 {{ stage.year }} 年（{{ formatRate(stage.rate) }}%）</span>
                                        <span>{{ formatCurrency(stage.totalMonthly) }}</span>
                                    </div>
                                </div>
                            </template>
                            <div class="result-note mt-auto">
                                本試算採本息平均攤還<span
                                    v-if="form.loanType === 'youth'">並按年重算剩餘本金</span>；未計入寬限期、開辦費、保險或銀行個別計息規則，結果僅供規劃參考。
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { setLoanCalculatorResult } from '../../services/loanTransfer';
import {
    calculateMonthlyPayment, calculateYouthStages, formatRate, splitPayment,
} from '../../services/loanCalculator';

const router = useRouter();

const form = reactive({
    loanType: 'regular',
    totalPrice: 0,
    ltv: 80,
    regularRate: 3.0,
    regularYears: 30,
    youthAmount: 10000000,
    youthPreferentialRate: 1.775,
    youthOriginalRate: 2.275,
    youthYears: 30,
    generalRate: 3,
    generalYears: 30,
    shareA: 50,
    remainderRecipient: 'A',
});

const asNumber = (value) => {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
};

const clamp = (value, min, max) => Math.min(Math.max(asNumber(value), min), max);

const estimatedLoanAmount = computed(() =>
    Math.round(Math.max(asNumber(form.totalPrice), 0) * clamp(form.ltv, 0, 100) / 100),
);
const youthLoanAmount = computed(() => Math.min(Math.max(asNumber(form.youthAmount), 0), estimatedLoanAmount.value));
const generalLoanAmount = computed(() => Math.max(estimatedLoanAmount.value - youthLoanAmount.value, 0));
const shareA = computed(() => clamp(form.shareA, 0, 100));
const shareB = computed(() => 100 - shareA.value);

const regularMonthly = computed(() =>
    calculateMonthlyPayment(estimatedLoanAmount.value, form.regularRate, form.regularYears),
);
const generalMonthly = computed(() =>
    calculateMonthlyPayment(generalLoanAmount.value, form.generalRate, form.generalYears),
);
const youthStages = computed(() => calculateYouthStages({
    youthAmount: youthLoanAmount.value,
    youthYears: form.youthYears,
    preferentialRate: form.youthPreferentialRate,
    originalRate: form.youthOriginalRate,
    generalMonthly: generalMonthly.value,
}));

const firstYearMonthly = computed(() => form.loanType === 'regular'
    ? Math.round(regularMonthly.value)
    : youthStages.value[0]?.totalMonthly || 0,
);
const afterExitMonthly = computed(() => form.loanType === 'regular'
    ? firstYearMonthly.value
    : youthStages.value[6]?.totalMonthly || 0,
);
const firstYearSplit = computed(() => splitPayment(firstYearMonthly.value, shareA.value, form.remainderRecipient));
const afterExitSplit = computed(() => splitPayment(afterExitMonthly.value, shareA.value, form.remainderRecipient));
const firstYearA = computed(() => firstYearSplit.value.partyA);
const firstYearB = computed(() => firstYearSplit.value.partyB);
const afterExitA = computed(() => afterExitSplit.value.partyA);
const afterExitB = computed(() => afterExitSplit.value.partyB);

const formatMoney = (value) => {
    if (value === null || value === undefined || value === '') return '';
    return Math.round(asNumber(value)).toLocaleString('zh-TW');
};

const formatCurrency = (value) => `NT$ ${formatMoney(value)}`;

const onMoneyInput = (key, event) => {
    const raw = String(event.target.value || '').replace(/,/g, '').replace(/[^\d.]/g, '');
    form[key] = raw === '' ? null : asNumber(raw);
    event.target.value = raw === '' ? '' : formatMoney(form[key]);
};

const applyToJointPurchase = () => {
    setLoanCalculatorResult({
        loanPlan: form.loanType,
        regularLoanRate: form.regularRate,
        youthPreferentialRate: form.youthPreferentialRate,
        youthOriginalRate: form.youthOriginalRate,
        generalLoanRate: form.generalRate,
        firstYearA: firstYearA.value,
        firstYearB: firstYearB.value,
        afterExitA: afterExitA.value,
        afterExitB: afterExitB.value,
        remainderRecipient: form.remainderRecipient,
    });
    router.push({ name: 'joint-purchase' });
};
</script>

<style scoped>
.calculator-shell {
    max-width: 1120px;
    margin: 0 auto;
}

.calculator-kicker {
    color: #ffd88a;
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
}

.calculator-title {
    font-size: clamp(2rem, 5vw, 3.4rem);
    line-height: 1.05;
}

.calculator-back-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 42px;
    padding: 0.58rem 1.2rem;
    line-height: 1.2;
    text-align: center;
}

.loan-section {
    padding: 1.25rem;
    border: 1px solid rgba(255, 255, 255, 0.16);
    border-radius: 1rem;
    background: rgba(255, 255, 255, 0.04);
}

.loan-subsection {
    padding: 1rem;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 0.85rem;
    background: rgba(17, 20, 38, 0.2);
}

.loan-subsection-title {
    margin-bottom: 1rem;
    color: #ffd88a;
    font-weight: 700;
}

.result-card {
    border-radius: 18px;
    color: #fff;
    border: 1px solid rgba(255, 216, 138, 0.35);
    background: linear-gradient(145deg, rgba(70, 48, 96, 0.96), rgba(33, 46, 76, 0.96));
}

.result-amount {
    color: #ffd88a;
    font-size: clamp(2rem, 5vw, 3.25rem);
    font-weight: 700;
    line-height: 1;
}

.result-row {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    padding: 1rem 0;
    border-top: 1px solid rgba(255, 255, 255, 0.14);
}

.result-note {
    padding: 1rem;
    border-radius: 0.75rem;
    background: rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.72);
    font-size: 0.86rem;
}
</style>

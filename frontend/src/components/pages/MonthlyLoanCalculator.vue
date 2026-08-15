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
                            <p class="small text-light opacity-75 mb-3">
                                房屋總價會自動保存在這台電腦，請依銀行實際核貸條件調整。
                            </p>
                            <div class="d-flex gap-2 mb-4" role="group" aria-label="貸款方案">
                                <button type="button" class="btn calculator-split-button"
                                    :class="form.loanType === 'regular' ? 'btn-light' : 'btn-outline-light'"
                                    @click="form.loanType = 'regular'">
                                    一般首購
                                </button>
                                <button type="button" class="btn calculator-split-button"
                                    :class="form.loanType === 'youth' ? 'btn-light' : 'btn-outline-light'"
                                    @click="form.loanType = 'youth'">
                                    新青安＋一般貸款
                                </button>
                            </div>

                            <div class="row g-3 mb-4">
                                <div class="col-md-3">
                                    <label class="form-label">房屋總價</label>
                                    <div class="input-group">
                                        <input :value="formatTenThousand(form.totalPrice)" type="text"
                                            class="form-control" inputmode="decimal" placeholder="例如：1,720"
                                            @input="onTenThousandInput('totalPrice', $event)" />
                                        <span class="input-group-text">萬元</span>
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <label class="form-label">貸款成數</label>
                                    <div class="input-group">
                                        <input :value="formatLoanRatio(form.ltv)" type="number" min="0" max="100"
                                            step="1" class="form-control" @input="onLtvInput" />
                                        <span class="input-group-text">%</span>
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <label class="form-label">自備款</label>
                                    <div class="input-group">
                                        <input :value="formatTenThousand(form.downPayment)" type="text"
                                            class="form-control" inputmode="decimal" placeholder="例如：344"
                                            @input="onTenThousandInput('downPayment', $event)" />
                                        <span class="input-group-text">萬元</span>
                                    </div>
                                </div>
                                <div v-if="form.loanType === 'youth'" class="col-md-3">
                                    <label class="form-label">
                                        {{ form.loanType === 'youth' ? '新青安寬限期' : '寬限期' }}
                                    </label>
                                    <select v-model.number="form.graceYears" class="form-select">
                                        <option v-for="year in 6" :key="year - 1" :value="year - 1">
                                            {{ year === 1 ? '無寬限期' : `${year - 1} 年` }}
                                        </option>
                                    </select>
                                </div>
                            </div>

                            <div v-if="form.loanType === 'regular'" class="loan-section">
                                <h5 class="mb-3">一般貸款條件</h5>
                                <div class="row g-3">
                                    <div class="col-md-3">
                                        <label class="form-label">貸款總額</label>
                                        <div class="input-group">
                                            <input :value="formatTenThousand(regularLoanAmount)" type="text"
                                                class="form-control" inputmode="decimal"
                                                @input="onRegularLoanAmountInput" />
                                            <span class="input-group-text">萬元</span>
                                        </div>
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
                                    <div class="col-6 col-md-3">
                                        <label class="form-label">寬限期</label>
                                        <select v-model.number="form.graceYears" class="form-select">
                                            <option v-for="year in 6" :key="year - 1" :value="year - 1">
                                                {{ year === 1 ? '無寬限期' : `${year - 1} 年` }}
                                            </option>
                                        </select>
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
                                                <input :value="formatTenThousand(form.youthAmount)" type="text"
                                                    class="form-control" inputmode="decimal"
                                                    @input="onTenThousandInput('youthAmount', $event)" />
                                                <span class="input-group-text">萬元</span>
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
                                        <div class="col-12 col-md-3">
                                            <label class="form-label">一般貸款金額</label>
                                            <div class="input-group">
                                                <input :value="formatTenThousand(generalLoanAmount)" type="text"
                                                    class="form-control" inputmode="decimal"
                                                    @input="onGeneralLoanAmountInput" />
                                                <span class="input-group-text">萬元</span>
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
                                            <label class="form-label">一般房貸寬限期</label>
                                            <select v-model.number="form.generalGraceYears" class="form-select">
                                                <option v-for="year in 6" :key="year - 1" :value="year - 1">
                                                    {{ year === 1 ? '無寬限期' : `${year - 1} 年` }}
                                                </option>
                                            </select>
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
                                    <button type="button" class="btn calculator-split-button"
                                        :class="form.remainderRecipient === 'A' ? 'btn-light' : 'btn-outline-light'"
                                        @click="form.remainderRecipient = 'A'">
                                        甲方（預設）
                                    </button>
                                    <button type="button" class="btn calculator-split-button"
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
                                {{ form.loanType === 'regular' && form.graceYears > 0
                                    ? '寬限期內每月合計負擔'
                                    : form.loanType === 'regular' ? '每月合計負擔' : '第一年每月合計負擔' }}
                            </p>
                            <p class="result-amount" :class="form.loanType === 'youth' ? 'mb-3' : 'mb-4'">
                                {{ formatCurrency(firstYearMonthly) }}
                            </p>
                            <div class="result-row result-interest-row mb-3">
                                <span>可能支付的總利息</span>
                                <strong>{{ formatCurrency(possibleTotalInterest) }}</strong>
                            </div>
                            <div v-if="form.loanType === 'youth'" class="result-exit-summary mb-4">
                                <p class="small text-light opacity-75 mb-1">退場後每月合計負擔</p>
                                <p class="result-exit-amount mb-0">{{ formatCurrency(afterExitMonthly) }}</p>
                            </div>

                            <div class="result-row">
                                <span>{{ form.loanType === 'regular' ? '甲方每月負擔' : '第一年・甲方' }}</span>
                                <strong>{{ formatCurrency(firstYearA) }}</strong>
                            </div>
                            <div class="result-row">
                                <span>{{ form.loanType === 'regular' ? '乙方每月負擔' : '第一年・乙方' }}</span>
                                <strong>{{ formatCurrency(firstYearB) }}</strong>
                            </div>
                            <template v-if="form.loanType === 'regular' && form.graceYears > 0">
                                <div class="result-row">
                                    <span>寬限期後・合計</span>
                                    <strong>{{ formatCurrency(regularAfterGraceMonthly) }}</strong>
                                </div>
                                <div class="result-row">
                                    <span>寬限期後・甲方</span>
                                    <strong>{{ formatCurrency(regularAfterGraceA) }}</strong>
                                </div>
                                <div class="result-row">
                                    <span>寬限期後・乙方</span>
                                    <strong>{{ formatCurrency(regularAfterGraceB) }}</strong>
                                </div>
                            </template>
                            <template v-if="form.loanType === 'youth'">
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
                            <div class="result-note mt-4">
                                <strong class="d-block text-light mb-2">新青安 3.0／一般首購比較</strong>
                                <div class="d-flex justify-content-between gap-3 mb-1">
                                    <span>一般首購</span>
                                    <span>{{ formatCurrency(regularComparisonMonthly) }}</span>
                                </div>
                                <div class="d-flex justify-content-between gap-3 mb-1">
                                    <span>新青安第一年</span>
                                    <span>{{ formatCurrency(youthFirstYearMonthly) }}</span>
                                </div>
                                <div class="d-flex justify-content-between gap-3 mb-1">
                                    <span>新青安完全退場後</span>
                                    <span>{{ formatCurrency(youthAfterExitMonthly) }}</span>
                                </div>
                                <div class="d-flex justify-content-between gap-3 mb-1">
                                    <span>新青安每月{{ regularComparisonDifference >= 0 ? '少付' : '多付' }}（第一年）</span>
                                    <span>{{ formatCurrency(Math.abs(regularComparisonDifference)) }}</span>
                                </div>
                                <div class="d-flex justify-content-between gap-3">
                                    <span>新青安每月{{ regularAfterExitDifference >= 0 ? '少付' : '多付' }}（退場後）</span>
                                    <span>{{ formatCurrency(Math.abs(regularAfterExitDifference)) }}</span>
                                </div>
                                <small class="d-block text-light opacity-75 mt-2">
                                    以相同貸款總額、一般首購利率、年限及寬限期試算。
                                </small>
                            </div>
                            <div class="result-note mt-4">
                                寬限期內僅計利息，期滿後於剩餘年限採本息平均攤還<span
                                    v-if="form.loanType === 'youth'">並按年重算剩餘本金</span>；未計入開辦費、保險或銀行個別計息規則，結果僅供規劃參考。
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, reactive, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { setLoanCalculatorResult } from '../../services/loanTransfer';
import {
    calculateLoanAmount, calculateLoanBreakdownFromLtv, calculateMonthlyPaymentWithGrace, calculateYouthStages,
    calculateTotalInterestWithGrace, calculateYouthTotalInterest, formatRate, splitPayment,
} from '../../services/loanCalculator';

const router = useRouter();
const store = useStore();

const form = reactive({
    loanType: 'regular',
    totalPrice: 0,
    downPayment: 0,
    ltv: 80,
    graceYears: 0,
    regularRate: 3.0,
    regularYears: 30,
    youthAmount: 10000000,
    youthPreferentialRate: 1.775,
    youthOriginalRate: 2.275,
    youthYears: 40,
    generalRate: 3,
    generalYears: 30,
    generalGraceYears: 0,
    shareA: 50,
    remainderRecipient: 'A',
});

const userProfile = store.state.user.profile;
const calculatorStorageOwner = userProfile?.id || userProfile?._id || userProfile?.email;
const calculatorSettingsStorageKey = calculatorStorageOwner
    ? `endprofile.loanCalculator.settings.v2.${encodeURIComponent(calculatorStorageOwner)}`
    : null;
const calculatorStorageKey = calculatorStorageOwner
    ? `endprofile.loanCalculator.totalPrice.v1.${encodeURIComponent(calculatorStorageOwner)}`
    : null;
const calculatorDownPaymentStorageKey = calculatorStorageOwner
    ? `endprofile.loanCalculator.downPayment.v1.${encodeURIComponent(calculatorStorageOwner)}`
    : null;
const generalLoanStorageKey = calculatorStorageOwner
    ? `endprofile.loanCalculator.generalTerms.v1.${encodeURIComponent(calculatorStorageOwner)}`
    : null;
const legacyCalculatorStorageKey = calculatorStorageOwner
    ? `endprofile.loanCalculator.v1.${calculatorStorageOwner}`
    : null;

const restoreSavedLoanInputs = () => {
    if (!calculatorSettingsStorageKey) return;
    try {
        const savedSettings = JSON.parse(localStorage.getItem(calculatorSettingsStorageKey) || 'null');
        if (savedSettings && typeof savedSettings === 'object' && !Array.isArray(savedSettings)) {
            Object.keys(form).forEach((key) => {
                if (Object.prototype.hasOwnProperty.call(savedSettings, key)) {
                    form[key] = savedSettings[key];
                }
            });
            form.ltv = Math.round(Math.min(Math.max(Number(form.ltv) || 0, 0), 100));
            return;
        }

        const savedValue = localStorage.getItem(calculatorStorageKey);
        const legacySettings = legacyCalculatorStorageKey
            ? JSON.parse(localStorage.getItem(legacyCalculatorStorageKey) || 'null')
            : null;
        const totalPrice = Number(savedValue ?? legacySettings?.totalPrice);
        if (Number.isFinite(totalPrice) && totalPrice >= 0) form.totalPrice = totalPrice;

        const savedDownPayment = Number(localStorage.getItem(calculatorDownPaymentStorageKey));
        if (Number.isFinite(savedDownPayment) && savedDownPayment >= 0) form.downPayment = savedDownPayment;

        const legacyLtv = Number(legacySettings?.ltv);
        if (Number.isFinite(legacyLtv) && legacyLtv >= 0 && legacyLtv <= 100) form.ltv = Math.round(legacyLtv);

        const savedGeneralTerms = JSON.parse(localStorage.getItem(generalLoanStorageKey) || 'null');
        const generalRate = Number(savedGeneralTerms?.generalRate);
        const generalYears = Number(savedGeneralTerms?.generalYears);
        if (Number.isFinite(generalRate) && generalRate >= 0) form.generalRate = generalRate;
        if (Number.isFinite(generalYears) && generalYears >= 1) form.generalYears = generalYears;
    } catch (error) {
        console.error('Failed to restore saved loan calculator inputs', error);
    }
};

restoreSavedLoanInputs();

watch(form, () => {
    if (!calculatorSettingsStorageKey) return;
    try {
        localStorage.setItem(calculatorSettingsStorageKey, JSON.stringify(form));
    } catch (error) {
        console.error('Failed to save loan calculator settings', error);
    }
}, { deep: true });

const asNumber = (value) => {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
};

const estimatedLoanAmount = computed(() =>
    Math.round(calculateLoanAmount(form.totalPrice, form.downPayment)),
);
const regularLoanAmount = computed(() => estimatedLoanAmount.value);
const youthLoanAmount = computed(() => Math.min(Math.max(asNumber(form.youthAmount), 0), estimatedLoanAmount.value));
const calculatedGeneralLoanAmount = computed(() => Math.max(estimatedLoanAmount.value - youthLoanAmount.value, 0));
const generalLoanAmount = computed(() => calculatedGeneralLoanAmount.value);
const clamp = (value, min, max) => Math.min(Math.max(asNumber(value), min), max);
const shareA = computed(() => clamp(form.shareA, 0, 100));
const shareB = computed(() => 100 - shareA.value);

const regularMonthly = computed(() =>
    calculateMonthlyPaymentWithGrace(
        regularLoanAmount.value,
        form.regularRate,
        form.regularYears,
        form.graceYears,
    ),
);
const regularComparisonMonthly = computed(() => Math.round(
    calculateMonthlyPaymentWithGrace(
        estimatedLoanAmount.value,
        form.regularRate,
        form.regularYears,
        form.graceYears,
    ),
));
const regularAfterGraceMonthly = computed(() => Math.round(
    calculateMonthlyPaymentWithGrace(
        regularLoanAmount.value,
        form.regularRate,
        form.regularYears,
        form.graceYears,
        asNumber(form.graceYears) * 12,
    ),
));
const regularAfterGraceSplit = computed(() =>
    splitPayment(regularAfterGraceMonthly.value, shareA.value, form.remainderRecipient),
);
const regularAfterGraceA = computed(() => regularAfterGraceSplit.value.partyA);
const regularAfterGraceB = computed(() => regularAfterGraceSplit.value.partyB);
const youthStages = computed(() => calculateYouthStages({
    youthAmount: youthLoanAmount.value,
    youthYears: form.youthYears,
    youthGraceYears: form.graceYears,
    preferentialRate: form.youthPreferentialRate,
    originalRate: form.youthOriginalRate,
    generalAmount: generalLoanAmount.value,
    generalRate: form.generalRate,
    generalYears: form.generalYears,
    generalGraceYears: form.generalGraceYears,
}));
const youthFirstYearMonthly = computed(() => youthStages.value[0]?.totalMonthly || 0);
const youthAfterExitMonthly = computed(() => youthStages.value[6]?.totalMonthly || 0);
const regularTotalInterest = computed(() => calculateTotalInterestWithGrace(
    regularLoanAmount.value,
    form.regularRate,
    form.regularYears,
    form.graceYears,
));
const youthTotalInterest = computed(() => calculateYouthTotalInterest({
    principal: youthLoanAmount.value,
    years: form.youthYears,
    graceYears: form.graceYears,
    preferentialRate: form.youthPreferentialRate,
    originalRate: form.youthOriginalRate,
}));
const generalTotalInterest = computed(() => calculateTotalInterestWithGrace(
    generalLoanAmount.value,
    form.generalRate,
    form.generalYears,
    form.generalGraceYears,
));
const possibleTotalInterest = computed(() => Math.round(
    form.loanType === 'regular'
        ? regularTotalInterest.value
        : youthTotalInterest.value + generalTotalInterest.value,
));

const firstYearMonthly = computed(() => form.loanType === 'regular'
    ? Math.round(regularMonthly.value)
    : youthFirstYearMonthly.value,
);
const regularComparisonDifference = computed(() => regularComparisonMonthly.value - youthFirstYearMonthly.value);
const regularAfterExitDifference = computed(() => regularComparisonMonthly.value - youthAfterExitMonthly.value);
const afterExitMonthly = computed(() => form.loanType === 'regular'
    ? firstYearMonthly.value
    : youthAfterExitMonthly.value,
);
const firstYearSplit = computed(() => splitPayment(firstYearMonthly.value, shareA.value, form.remainderRecipient));
const afterExitSplit = computed(() => splitPayment(afterExitMonthly.value, shareA.value, form.remainderRecipient));
const youthStageSplits = computed(() => youthStages.value.map((stage) => ({
    ...stage,
    ...splitPayment(stage.totalMonthly, shareA.value, form.remainderRecipient),
})));
const firstYearA = computed(() => firstYearSplit.value.partyA);
const firstYearB = computed(() => firstYearSplit.value.partyB);
const afterExitA = computed(() => afterExitSplit.value.partyA);
const afterExitB = computed(() => afterExitSplit.value.partyB);

const formatMoney = (value) => {
    if (value === null || value === undefined || value === '') return '';
    return Math.round(asNumber(value)).toLocaleString('zh-TW');
};

const formatCurrency = (value) => `NT$ ${formatMoney(value)}`;

const formatTenThousand = (value) => {
    if (value === null || value === undefined || value === '') return '';
    return (asNumber(value) / 10000).toLocaleString('zh-TW', { maximumFractionDigits: 4 });
};

const formatLoanRatio = (value) => Math.round(clamp(value, 0, 100));

const onTenThousandInput = (key, event) => {
    const raw = String(event.target.value || '').replace(/,/g, '').replace(/[^\d.]/g, '');
    form[key] = raw === '' ? null : asNumber(raw) * 10000;
    event.target.value = raw === '' ? '' : formatTenThousand(form[key]);
    if (key === 'totalPrice') {
        form.downPayment = calculateLoanBreakdownFromLtv(form.totalPrice, form.ltv).downPayment;
    }
};

const onLtvInput = (event) => {
    form.ltv = Math.round(clamp(event.target.value, 0, 100));
    form.downPayment = calculateLoanBreakdownFromLtv(form.totalPrice, form.ltv).downPayment;
};

const setDownPaymentFromLoanAmount = (loanAmount) => {
    const totalPrice = Math.max(asNumber(form.totalPrice), 0);
    const safeLoanAmount = Math.min(Math.max(asNumber(loanAmount), 0), totalPrice);
    form.downPayment = Math.round(totalPrice - safeLoanAmount);
};

const onRegularLoanAmountInput = (event) => {
    const raw = String(event.target.value || '').replace(/,/g, '').replace(/[^\d.]/g, '');
    setDownPaymentFromLoanAmount(raw === '' ? 0 : asNumber(raw) * 10000);
    event.target.value = formatTenThousand(regularLoanAmount.value);
};

const onGeneralLoanAmountInput = (event) => {
    const raw = String(event.target.value || '').replace(/,/g, '').replace(/[^\d.]/g, '');
    const generalAmount = raw === '' ? 0 : asNumber(raw) * 10000;
    setDownPaymentFromLoanAmount(asNumber(form.youthAmount) + generalAmount);
    event.target.value = formatTenThousand(generalLoanAmount.value);
};

const applyToJointPurchase = () => {
    setLoanCalculatorResult({
        totalPrice: form.totalPrice,
        downPayment: form.downPayment,
        regularLoanAmount: regularLoanAmount.value,
        loanPlan: form.loanType,
        graceYears: form.graceYears,
        generalGraceYears: form.generalGraceYears,
        regularLoanYears: form.regularYears,
        youthLoanYears: form.youthYears,
        generalLoanYears: form.generalYears,
        regularLoanRate: form.regularRate,
        youthPreferentialRate: form.youthPreferentialRate,
        youthOriginalRate: form.youthOriginalRate,
        generalLoanRate: form.generalRate,
        firstYearA: firstYearA.value,
        firstYearB: firstYearB.value,
        year4A: youthStageSplits.value[3]?.partyA || 0,
        year4B: youthStageSplits.value[3]?.partyB || 0,
        year5A: youthStageSplits.value[4]?.partyA || 0,
        year5B: youthStageSplits.value[4]?.partyB || 0,
        year6A: youthStageSplits.value[5]?.partyA || 0,
        year6B: youthStageSplits.value[5]?.partyB || 0,
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

.calculator-split-button {
    flex: 1 1 0;
    min-width: 0;
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

.result-exit-summary {
    padding: 0.85rem 1rem;
    border-left: 3px solid rgba(255, 216, 138, 0.9);
    border-radius: 0.65rem;
    background: rgba(255, 255, 255, 0.08);
}

.result-exit-amount {
    color: #ffffff;
    font-size: clamp(1.55rem, 3.5vw, 2.2rem);
    font-weight: 700;
    line-height: 1.1;
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

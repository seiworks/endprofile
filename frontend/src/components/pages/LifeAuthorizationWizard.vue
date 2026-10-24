<template>
    <div class="wizard-container text-light">
        <teleport to="body">
            <button v-if="showFloatingSave" type="button" class="save-button-position btn highlight-action-button"
                :disabled="saving || loadStatus !== 'ready'" @click="onSaveDraft">
                <span v-if="saving">儲存中…</span>
                <span v-else>儲存</span>
            </button>
        </teleport>
        <div class="wizard-header mb-3">
            <div class="wizard-heading">
                <h3 class="mb-1">生活授權書</h3>
                <p class="mb-0">在你無法親自處理時，預先授權信任的人代為管理生活與財務事務。</p>
            </div>
            <div class="wizard-actions">
                <p v-if="lastSavedText" class="wizard-last-saved mb-1 small text-light opacity-75">
                    上次編輯：{{ lastSavedText }}
                </p>
                <div class="wizard-action-buttons">
                    <button type="button" class="btn btn-outline-light btn-sm me-2" :disabled="saving || loadStatus !== 'ready'"
                        @click="onSaveDraft">
                        <span v-if="saving">儲存中…</span>
                        <span v-else>儲存</span>
                    </button>
                    <button type="button" class="btn btn-outline-light btn-sm pdf-icon-btn" @click="onDownload"
                        :disabled="downloading || loadStatus !== 'ready'" title="下載 PDF 範例">
                        <span v-if="downloading">產生中…</span>
                        <span v-else>
                            PDF
                            <i class="mdi mdi-file-download-outline" />
                        </span>
                    </button>
                </div>
                <div v-if="loadStatus !== 'ready' || error" class="wizard-action-error mt-2" role="alert">
                    <i v-if="loadStatus !== 'loading'" class="mdi mdi-alert-circle-outline" aria-hidden="true"></i>
                    <span v-if="loadStatus === 'loading'">載入中…</span>
                    <span v-else-if="loadStatus === 'load-error'">載入失敗，請<router-link to="/">返回首頁</router-link>或<button type="button" class="btn btn-link p-0 align-baseline" @click="reloadDraft">重試</button>。</span>
                    <span v-else-if="loadStatus === 'locked'">密文解密失敗，請<router-link to="/">返回首頁</router-link>重新登入並使用原密碼解鎖。</span>
                    <span v-else>{{ error }}</span>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-md-7 mb-3">
                <div class="card card-soft">
                    <div class="card-body">
                        <h5 class="mb-3 fw-bold">
                            <i class="mdi mdi-account-box-outline me-2 text-light opacity-75" />
                            當事人資訊
                        </h5>
                        <div class="ps-4">
                            <div class="mb-3">
                                <label class="form-label">授權人姓名</label>
                                <input v-model="form.principalName" type="text" class="form-control"
                                    placeholder="例如：王小明" />
                            </div>
                            <div class="mb-3">
                                <label class="form-label">被授權人姓名</label>
                                <input v-model="form.agentName" type="text" class="form-control"
                                    placeholder="例如：林小潔（同居伴侶）" />
                            </div>
                        </div>

                        <h5 class="mb-3 mt-4 fw-bold">
                            <i class="mdi mdi-script-text-outline me-2 text-light opacity-75" />
                            授權用途與情境
                        </h5>
                        <div class="ps-4">
                            <div class="mb-3">
                                <label class="form-label">授權觸發情境</label>
                                <textarea v-model="form.scenario" rows="2" class="form-control"
                                    placeholder="例如：當本人因重病、昏迷或其他狀況，致無法親自處理銀行與生活事務時。"></textarea>
                            </div>
                        </div>

                        <h5 class="mb-3 mt-4 fw-bold">
                            <i class="mdi mdi-bank-outline me-2 text-light opacity-75" />
                            銀行與財務授權範圍
                        </h5>
                        <div class="ps-4">
                            <div class="mb-3">
                                <label class="form-label">可代為處理的銀行與帳戶事項</label>
                                <textarea v-model="form.bankScope" rows="3" class="form-control"
                                    placeholder="例如：代為管理本人名下銀行帳戶、臨櫃提領、匯款、ATM 提款、繳納信用卡與貸款等。"></textarea>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">授權金額上限或使用原則（選填）</label>
                                <textarea v-model="form.amountLimit" rows="2" class="form-control"
                                    placeholder="例如：每月得在新臺幣〇〇萬元額度內，支應醫療費、生活費與必要支出。"></textarea>
                            </div>
                        </div>

                        <h5 class="mb-3 mt-4 fw-bold">
                            <i class="mdi mdi-hospital-box-outline me-2 text-light opacity-75" />
                            生活與醫療相關授權（選填）
                        </h5>
                        <div class="ps-4">
                            <div class="mb-3">
                                <label class="form-label">日常生活支出與契約處理</label>
                                <textarea v-model="form.lifeScope" rows="2" class="form-control"
                                    placeholder="例如：代為支付房貸、水電、保險費，並辦理相關繳費與續約事宜。"></textarea>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">醫療費用與相關支出處理</label>
                                <textarea v-model="form.medicalScope" rows="2" class="form-control"
                                    placeholder="例如：代為支付住院費、手術費及其他必要醫療費用，並持本授權書向醫療機構說明。"></textarea>
                            </div>
                        </div>

                        <h5 class="mb-3 mt-4 fw-bold">
                            <i class="mdi mdi-timer-sand me-2 text-light opacity-75" />
                            期間、限制與其他約定
                        </h5>
                        <div class="ps-4">
                            <div class="mb-3">
                                <label class="form-label">授權期間</label>
                                <textarea v-model="form.duration" rows="2" class="form-control"
                                    placeholder="例如：自簽署日起至本人恢復自主處理能力、或本人明確撤銷為止。"></textarea>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">帳務紀錄與共識（選填）</label>
                                <textarea v-model="form.recording" rows="2" class="form-control"
                                    placeholder="例如：由被授權人盡可能保留支出明細，並與其他家人適時說明用途，以減少爭議。"></textarea>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">其他特別說明（選填）</label>
                                <textarea v-model="form.otherNotes" rows="2" class="form-control"
                                    placeholder="例如：本授權書宜搭配遺囑、意定監護契約與預立醫療決定書一併考量。"></textarea>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
            <div class="col-md-5 mb-3">
                <div class="card card-soft">
                    <div class="card-body">
                        <h5 class="mb-3">生活授權書草稿（預覽）</h5>
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

const documentMeta = DOCUMENT_BY_KEY.lifeAuthorization;

const form = reactive({
    principalName: '',
    agentName: '',
    scenario: '',
    bankScope: '',
    amountLimit: '',
    lifeScope: '',
    medicalScope: '',
    duration: '',
    recording: '',
    otherNotes: '',
});

const previewText = computed(() => {
    const principal = form.principalName || '＿＿＿＿＿＿（授權人姓名待填）';
    const agent = form.agentName || '＿＿＿＿＿＿（被授權人姓名待填）';

    const scenarioText =
        form.scenario.trim() ||
        '當本人因疾病、昏迷、失能或其他情形，致一時無法親自處理銀行與日常生活相關事務時。';

    const bankScopeText =
        form.bankScope.trim() ||
        '代為管理本人名下銀行帳戶，包括臨櫃提領、存款、匯款、ATM 提款、轉帳及繳納信用卡、貸款或其他必要之金融費用等。';

    const amountLimitText =
        form.amountLimit.trim() ||
        '授權金額以合理支應本人醫療費用、生活費用及相關必要支出為限，如需大額提領或異常交易，應盡可能事先與本人或家人溝通。';

    const lifeScopeText =
        form.lifeScope.trim() ||
        '代為支付房貸、水電、瓦斯、管理費、保險費及其他日常生活必要支出，並得視需要辦理相關契約之續約或終止。';

    const medicalScopeText =
        form.medicalScope.trim() ||
        '代為支付住院費、手術費及其他醫療相關費用，並得持本授權書向醫療機構說明支付來源與用途。';

    const durationText =
        form.duration.trim() ||
        '本授權自簽署之日起生效，至本人恢復足以自行處理相關事務之能力、或本人明確以書面撤銷為止。';

    const recordingText =
        form.recording.trim() ||
        '被授權人應盡可能保留支出明細與使用記錄，於適當時機向本人或其他家人說明用途，以降低日後誤解或爭議之可能。';

    const otherNotesText =
        form.otherNotes.trim() ||
        '本授權書之設計，宜與遺囑、意定監護契約及預立醫療決定書等文件一併考量，以更完整反映本人對財產與醫療自主之整體規劃。';

    return `授權人：${principal}
被授權人：${agent}

一、授權目的與情境
為避免本人於重病、昏迷或暫時無法親自處理事務時，家人或親友因缺乏正式授權而難以及時支付醫療費與生活費，本人特此授權上開被授權人，於下列情形發生時，得代為處理相關事務：
${scenarioText}

二、銀行與財務相關授權範圍
本人同意，被授權人得為下列行為：
（一）代為管理本人名下銀行帳戶及相關金融往來，內容包括但不限於下列事項：
${bankScopeText}

（二）授權金額上限或使用原則如下：
${amountLimitText}

三、生活與醫療相關授權
（一）日常生活支出與契約處理：
${lifeScopeText}

（二）醫療費用與相關支出處理：
${medicalScopeText}

四、授權期間與終止
授權期間說明如下：
${durationText}

五、帳務紀錄與爭議預防
${recordingText}

六、其他說明
${otherNotesText}

本生活授權書為協助日後與金融機構、醫療機構或相關單位溝通之用，正式版本仍建議洽詢專業法律服務，必要時得採書面或錄影方式制作，並視需求辦理公證，以強化其證明力。`;
});

const {
    downloading,
    error,
    lastSavedText,
    loadStatus,
    onDownload,
    onSaveDraft,
    reloadDraft,
    saving,
    showFloatingSave,
} = useDocumentDraft({
    type: documentMeta.type,
    title: documentMeta.draftTitle,
    form,
    previewText,
});
</script>

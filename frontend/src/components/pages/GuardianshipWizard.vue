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
                <h3 class="mb-1">意定監護契約</h3>
                <p class="mb-0">指定失智或昏迷時，最信任的監護人與決策原則。</p>
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
                            <i class="mdi mdi-account-child-circle me-2 text-light opacity-75" />
                            基本資訊
                        </h5>
                        <div class="ps-4">
                            <div class="mb-3">
                                <label class="form-label">本人姓名</label>
                                <input v-model="form.principalName" type="text" class="form-control"
                                    placeholder="例如：王小明" />
                            </div>
                            <div class="mb-3">
                                <label class="form-label">主要監護人姓名</label>
                                <input v-model="form.guardianName" type="text" class="form-control"
                                    placeholder="例如：王小華（配偶）" />
                            </div>
                            <div class="mb-3">
                                <label class="form-label">備任監護人（選填）</label>
                                <input v-model="form.backupGuardianName" type="text" class="form-control"
                                    placeholder="例如：王小強（弟弟）" />
                            </div>
                        </div>

                        <h5 class="mb-3 mt-4 fw-bold">
                            <i class="mdi mdi-shield-account-outline me-2 text-light opacity-75" />
                            監護範圍
                        </h5>
                        <div class="ps-4">
                            <div class="form-check">
                                <input id="scope-medical" v-model="form.scopes" class="form-check-input" type="checkbox"
                                    value="醫療決策" />
                                <label class="form-check-label" for="scope-medical">醫療決策與手術同意</label>
                            </div>
                            <div class="form-check">
                                <input id="scope-finance" v-model="form.scopes" class="form-check-input" type="checkbox"
                                    value="財務與財產管理" />
                                <label class="form-check-label" for="scope-finance">財務與財產管理</label>
                            </div>
                            <div class="form-check">
                                <input id="scope-life" v-model="form.scopes" class="form-check-input" type="checkbox"
                                    value="日常生活安排" />
                                <label class="form-check-label" for="scope-life">日常生活安排與照顧</label>
                            </div>
                            <div class="mb-3 mt-3">
                                <label class="form-label">其他特別授權（選填）</label>
                                <input v-model="form.scopeOther" type="text" class="form-control"
                                    placeholder="例如：數位帳號與社群媒體相關決定" />
                            </div>
                        </div>

                        <h5 class="mb-3 mt-4 fw-bold">
                            <i class="mdi mdi-clipboard-text-outline me-2 text-light opacity-75" />
                            決策原則（選填）
                        </h5>
                        <div class="ps-4">
                            <div class="mb-3">
                                <label class="form-label">醫療與生命維持的偏好</label>
                                <textarea v-model="form.medicalPreference" rows="3" class="form-control"
                                    placeholder="例如：盡可能減輕痛苦，當無合理康復可能時，可考慮不再進行侵入性治療等。"></textarea>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">財務與資產運用的原則</label>
                                <textarea v-model="form.financePreference" rows="3" class="form-control"
                                    placeholder="例如：以照顧本人生活與醫療需求為優先，其次才是繼承分配等。"></textarea>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">其他希望監護人遵守的事項</label>
                                <textarea v-model="form.otherNotes" rows="3" class="form-control"
                                    placeholder="例如：希望盡量維持原本的生活習慣與社交圈等。"></textarea>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
            <div class="col-md-5 mb-3">
                <div class="card card-soft">
                    <div class="card-body">
                        <h5 class="mb-3">意定監護契約草稿（預覽）</h5>
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

const documentMeta = DOCUMENT_BY_KEY.guardianship;

const form = reactive({
    principalName: '',
    guardianName: '',
    backupGuardianName: '',
    scopes: ['醫療決策', '財務與財產管理', '日常生活安排'],
    scopeOther: '',
    medicalPreference: '',
    financePreference: '',
    otherNotes: '',
});

const previewText = computed(() => {
    const principal = form.principalName || '（本人姓名待填）';
    const guardian = form.guardianName || '（主要監護人待填）';

    const scopeList = [...form.scopes];
    if (form.scopeOther.trim()) {
        scopeList.push(form.scopeOther.trim());
    }
    const scopeText =
        scopeList.length > 0 ? scopeList.join('、') : '日後由監護人與家人共同商議決定';

    const medicalText =
        form.medicalPreference.trim() ||
        '關於醫療與生命維持措施，我希望在兼顧治療效果與生活品質的前提下，由監護人與醫療團隊共同評估與決定。';

    const financeText =
        form.financePreference.trim() ||
        '關於財務與財產管理，我希望優先用於本人之生活照顧與醫療費用，其餘部分依法律規定與家人共識處理。';

    const otherNotesText =
        form.otherNotes.trim() ||
        '監護人應基於對本人長期之理解，做出最符合本人人格與價值觀之決定。';

    return `一、指定監護人
本人 ${principal}，於將來如因疾病、失智、意外或其他原因，致無法充分表達或判斷自身意思時，指定 ${guardian} 為本人之主要監護人。`
        + (form.backupGuardianName
            ? `如 ${guardian} 因任何原因無法或不適合擔任監護人時，由 ${form.backupGuardianName} 接任監護人之職務。`
            : '') +
        `

二、監護範圍
監護人得就下列事項為本人作出必要決定與處理：${scopeText}。

三、決策原則
（一）醫療與生命維持：
${medicalText}

（二）財務與資產運用：
${financeText}

（三）其他原則：
${otherNotesText}

四、最終說明
本意定監護契約之目的，在於於本人將來喪失判斷能力時，仍能依本人一貫之價值觀與生活態度，作出尊重本人尊嚴與利益之決定。`;
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
});
</script>

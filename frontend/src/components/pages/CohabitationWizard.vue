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
                <h3 class="mb-1">授權書／同居協議</h3>
                <p class="mb-0">設定房貸、水電、生活費分擔與房產居住權利。</p>
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
            </div>
        </div>
        <div class="row">
            <div class="col-md-7 mb-3">
                <div class="card card-soft">
                    <div class="card-body">
                        <h5 class="mb-3 fw-bold">
                            <i class="mdi mdi-account-heart-outline me-2 text-light opacity-75" />
                            基本資訊
                        </h5>
                        <div class="ps-4">
                            <div class="mb-3">
                                <label class="form-label">同居雙方姓名</label>
                                <input v-model="form.partnerA" type="text" class="form-control mb-2"
                                    placeholder="甲方，例如：王小明" />
                                <input v-model="form.partnerB" type="text" class="form-control"
                                    placeholder="乙方，例如：林小潔" />
                            </div>
                        </div>

                        <h5 class="mb-3 mt-4 fw-bold">
                            <i class="mdi mdi-cash-multiple me-2 text-light opacity-75" />
                            生活費與費用分擔
                        </h5>
                        <div class="ps-4">
                            <div class="mb-3">
                                <label class="form-label">房貸分擔方式</label>
                                <textarea v-model="form.rentSharing" rows="2" class="form-control"
                                    placeholder="例如：雙方各自負擔一半，或由其中一方負擔，另一方以其他方式分擔等。"></textarea>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">水電、瓦斯、網路等生活費</label>
                                <textarea v-model="form.expenseSharing" rows="2" class="form-control"
                                    placeholder="例如：由共同帳戶支付，雙方每月固定匯入一定金額等。"></textarea>
                            </div>
                        </div>

                        <h5 class="mb-3 mt-4 fw-bold">
                            <i class="mdi mdi-home-heart me-2 text-light opacity-75" />
                            居住與房產權利
                        </h5>
                        <div class="ps-4">
                            <div class="mb-3">
                                <label class="form-label">房屋所有權與居住權安排</label>
                                <textarea v-model="form.propertyUsage" rows="3" class="form-control"
                                    placeholder="例如：一方為所有權人，但雙方同意在關係存續期間都可安心居住等。"></textarea>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">其他想一起約定的事項（選填）</label>
                                <textarea v-model="form.otherNotes" rows="3" class="form-control"
                                    placeholder="例如：若日後關係變動時的基本處理方式、訪客規則、寵物照顧、重要決策的討論方式等。"></textarea>
                            </div>
                        </div>

                        <p v-if="error" class="text-danger mt-2 mb-0">{{ error }}</p>
                    </div>
                </div>
            </div>
            <div class="col-md-5 mb-3">
                <div class="card card-soft">
                    <div class="card-body">
                        <h5 class="mb-3">同居協議草稿（預覽）</h5>
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

const documentMeta = DOCUMENT_BY_KEY.cohabitation;

const form = reactive({
    partnerA: '',
    partnerB: '',
    rentSharing: '',
    expenseSharing: '',
    propertyUsage: '',
    breakupArrangement: '',
    otherNotes: '',
});

const previewText = computed(() => {
    const a = form.partnerA || '甲方（姓名待填）';
    const b = form.partnerB || '乙方（姓名待填）';

    const rentText =
        form.rentSharing.trim() ||
        '雙方就房貸之負擔，以公平、合理且兼顧彼此收入狀況之方式協調辦理。';

    const expenseText =
        form.expenseSharing.trim() ||
        '水電、瓦斯、網路及日常生活費用，由雙方共同分擔，具體比例得依實際開銷與收入情形調整。';

    const propertyText =
        form.propertyUsage.trim() ||
        '如居住之房屋為一方所有，雙方同意在關係存續期間，另一方亦得安心居住，並就重要處分事宜事先協商。';

    const otherNotesText =
        form.otherNotes.trim() ||
        '雙方同意以開放溝通、彼此尊重與互相體諒為同居生活之基本原則。';

    return `一、當事人
本同居協議由 ${a} 與 ${b} 共同訂立，雙方同意在平等、互相尊重與自願之基礎下，共同生活並遵守以下約定。

二、生活費與費用分擔
關於房貸之負擔：
${rentText}

關於水電、瓦斯、網路及其他生活費用：
${expenseText}

三、居住與房產權利
雙方就居住空間與房屋相關權利之基本理解如下：
${propertyText}

四、其他約定事項
${otherNotesText}

本協議內容可因雙方生活狀況或需求變化而經協商修正，其目的在於讓彼此在共享生活空間時，更加清楚且安心。`;
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

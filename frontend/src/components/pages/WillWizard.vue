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
                <h3 class="mb-1">預立遺囑</h3>
                <p class="mb-0">這裡會一步一步引導你整理資產與想照顧的人。</p>
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
                            基本資訊
                        </h5>
                        <div class="ps-4">
                            <div class="mb-3">
                                <label class="form-label">立遺囑人姓名</label>
                                <input v-model="form.testatorName" type="text" class="form-control"
                                    placeholder="例如：王小明" />
                            </div>
                            <div class="mb-3">
                                <label class="form-label">遺囑執行人（選填）</label>
                                <input v-model="form.executorName" type="text" class="form-control"
                                    placeholder="例如：王小華（配偶）" />
                            </div>
                        </div>

                        <h5 class="mb-3 mt-4 fw-bold">
                            <i class="mdi mdi-account-group-outline me-2 text-light opacity-75" />
                            家人與受益人
                        </h5>
                        <div class="ps-4">
                            <div class="mb-3">
                                <label class="form-label">想特別照顧的人</label>
                                <textarea v-model="form.beneficiaries" rows="3" class="form-control"
                                    placeholder="例如：配偶王小華、子女王小安、王小恩等，盡量簡單描述關係即可。"></textarea>
                            </div>
                        </div>

                        <h5 class="mb-3 mt-4 fw-bold">
                            <i class="mdi mdi-clipboard-text-outline me-2 text-light opacity-75" />
                            主要財產概況（簡述即可）
                        </h5>
                        <div class="ps-4">
                            <div class="mb-3">
                                <label class="form-label">不動產（房屋、土地等）</label>
                                <textarea v-model="form.realEstate" rows="2" class="form-control"
                                    placeholder="例如：位於〇〇的自住房屋一戶，老家土地一筆等。"></textarea>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">金融資產（存款、投資、保單等）</label>
                                <textarea v-model="form.financialAssets" rows="2" class="form-control"
                                    placeholder="例如：銀行存款、證券帳戶、基金、保險身故給付等。"></textarea>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">其他重要動產</label>
                                <textarea v-model="form.movableAssets" rows="2" class="form-control"
                                    placeholder="例如：車輛、貴重收藏、藝術品等。"></textarea>
                            </div>
                        </div>

                        <h5 class="mb-3 mt-4 fw-bold">
                            <i class="mdi mdi-gift-outline me-2 text-light opacity-75" />
                            特別交代事項（選填）
                        </h5>
                        <div class="ps-4">
                            <div class="mb-3">
                                <label class="form-label">特別指定給某人的財產（不動產）</label>
                                <textarea v-model="form.specialRealEstate" rows="2" class="form-control"
                                    placeholder="例如：將老家房子指定給某位家人或伴侶。"></textarea>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">特別指定給某人的財產（金融資產）</label>
                                <textarea v-model="form.specialFinancial" rows="2" class="form-control"
                                    placeholder="例如：某一銀行帳戶或投資資產指定給特定對象。"></textarea>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">特別指定給某人的財產（其他動產）</label>
                                <textarea v-model="form.specialMovable" rows="2" class="form-control"
                                    placeholder="例如：車輛、收藏品或具紀念性的物品指定給特定對象。"></textarea>
                            </div>
                        </div>

                        <h5 class="mb-3 mt-4 fw-bold">
                            <i class="mdi mdi-flower-outline me-2 text-light opacity-75" />
                            喪禮與身後安排偏好
                        </h5>
                        <div class="ps-4">
                            <div class="mb-3">
                                <label class="form-label">喪禮規模與氛圍</label>
                                <textarea v-model="form.funeralScale" rows="2" class="form-control"
                                    placeholder="例如：希望以簡單溫馨、小規模的家人親友聚會為主，不鋪張。"></textarea>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">宗教信仰與儀式類型</label>
                                <textarea v-model="form.funeralReligion" rows="2" class="form-control"
                                    placeholder="例如：以佛教／道教／基督宗教／無宗教簡單追思為主，有無特別希望的儀式。"></textarea>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">儀式地點與靈堂布置</label>
                                <textarea v-model="form.funeralLocation" rows="2" class="form-control"
                                    placeholder="例如：希望在殯儀館、教會或家中設靈，整體布置以溫暖簡單為主。"></textarea>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">音樂、照片與想被記得的樣子</label>
                                <textarea v-model="form.funeralMusic" rows="2" class="form-control"
                                    placeholder="例如：希望播放哪些歌曲、放哪些生活照片，讓大家記得我日常的樣子。"></textarea>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">家屬與賓客服裝與禮儀</label>
                                <textarea v-model="form.funeralDressCode" rows="2" class="form-control"
                                    placeholder="例如：不一定要全黑，以素雅舒適為主，不需要過度鞠躬下跪等禮數。"></textarea>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">訃聞與通知對象清單</label>
                                <div v-for="(contact, index) in form.funeralContacts" :key="index"
                                    class="border border-light border-opacity-25 rounded-3 p-2 mb-2">
                                    <div class="row g-2">
                                        <div class="col-md-4">
                                            <label class="form-label mb-1">姓名</label>
                                            <input v-model="contact.name" type="text"
                                                class="form-control form-control-sm" placeholder="例如：王小華" />
                                        </div>
                                        <div class="col-md-4">
                                            <label class="form-label mb-1">電話</label>
                                            <input v-model="contact.phone" type="text"
                                                class="form-control form-control-sm" placeholder="例如：09xx-xxx-xxx" />
                                        </div>
                                        <div class="col-md-4">
                                            <label class="form-label mb-1">社群帳號／其它</label>
                                            <input v-model="contact.social" type="text"
                                                class="form-control form-control-sm" placeholder="例如：Line／IG／Email" />
                                        </div>
                                    </div>
                                    <div class="d-flex justify-content-end mt-2">
                                        <button type="button" class="btn btn-sm btn-outline-light"
                                            @click="removeFuneralContact(index)">
                                            移除
                                        </button>
                                    </div>
                                </div>
                                <button type="button" class="btn btn-sm btn-outline-light ml-2"
                                    @click="addFuneralContact">
                                    新增通知對象
                                </button>
                                <small class="form-text text-muted d-block mt-1">
                                    可填寫姓名與聯絡方式，例如電話與主要社群帳號，協助家人日後通知適當的親友或單位。
                                </small>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">香儀、花禮與捐款安排</label>
                                <textarea v-model="form.funeralMoney" rows="2" class="form-control"
                                    placeholder="例如：可收香儀但不必多，部分轉作公益捐款；花籃以不過度鋪張為原則等。"></textarea>
                            </div>

                            <div class="mb-3">
                                <label class="form-label">器官捐贈或遺體捐贈意願</label>
                                <textarea v-model="form.organDonation" rows="2" class="form-control"
                                    placeholder="例如：願意器官捐贈／遺體捐贈作為醫學或教學用途，或暫不考慮。"></textarea>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">遺體處理方式（火葬、土葬、海葬、樹葬等）</label>
                                <textarea v-model="form.burialType" rows="2" class="form-control"
                                    placeholder="例如：希望以火葬為主，再視情況選擇海葬、樹葬或塔位安置。"></textarea>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">骨灰安置地點與形式</label>
                                <textarea v-model="form.burialPlace" rows="2" class="form-control"
                                    placeholder="例如：安置於何處的靈骨塔、樹葬區，或撒放於某個具意義的地方。"></textarea>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">墓碑、牌位或紀念文字</label>
                                <textarea v-model="form.tombText" rows="2" class="form-control"
                                    placeholder="例如：希望刻上的字句、想留給後人看到的一句話。"></textarea>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">年忌、祭拜與日常紀念方式</label>
                                <textarea v-model="form.memorialRituals" rows="2" class="form-control"
                                    placeholder="例如：不用每年一定拜拜，家人偶爾一起吃飯、到某個地方走走，就當作紀念。"></textarea>
                            </div>

                            <div class="mb-3">
                                <label class="form-label">其他想留給家人的話</label>
                                <textarea v-model="form.otherNotes" rows="3" class="form-control"
                                    placeholder="例如：感謝、祝福、或對家人關係的期望等。"></textarea>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
            <div class="col-md-5 mb-3">
                <div class="card card-soft">
                    <div class="card-body">
                        <h5 class="mb-3">預立遺囑草稿（預覽）</h5>
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

const documentMeta = DOCUMENT_BY_KEY.will;

const form = reactive({
    testatorName: '',
    executorName: '',
    beneficiaries: '',
    realEstate: '',
    financialAssets: '',
    movableAssets: '',
    specialRealEstate: '',
    specialFinancial: '',
    specialMovable: '',
    funeralScale: '',
    funeralReligion: '',
    funeralLocation: '',
    funeralMusic: '',
    funeralDressCode: '',
    funeralNotice: '',
    funeralMoney: '',
    funeralContacts: [],
    organDonation: '',
    burialType: '',
    burialPlace: '',
    tombText: '',
    memorialRituals: '',
    otherNotes: '',
});

const previewText = computed(() => {
    const testator = form.testatorName || '（立遺囑人姓名待填）';
    const executor = form.executorName.trim();

    const beneficiariesText =
        form.beneficiaries.trim() ||
        '本人之配偶、子女及依法得繼承之親屬。';

    const realEstateText =
        form.realEstate.trim() ||
        '本人名下如有自住房屋、老家或其他不動產，均屬遺產範圍之一部分。';

    const financialAssetsText =
        form.financialAssets.trim() ||
        '包括銀行存款、證券帳戶、基金、退休金及保險身故給付等金融資產。';

    const movableAssetsText =
        form.movableAssets.trim() ||
        '如車輛、家電、家具、收藏品及其他具價值之動產，亦屬遺產一部分。';

    const specialRealEstateText =
        form.specialRealEstate.trim() ||
        '如日後有特別想指定給特定親友之不動產，將再與專業人士討論並補充於正式遺囑。';

    const specialFinancialText =
        form.specialFinancial.trim() ||
        '如有特定金融資產希望留給特定對象，得於正式遺囑中個別載明。';

    const specialMovableText =
        form.specialMovable.trim() ||
        '如有具紀念性或特別意義之物品想交付特定親友，得於正式遺囑中指明受贈人。';

    const funeralFormText = (() => {
        const scaleText =
            form.funeralScale.trim() ||
            '喪禮規模以家人可負擔、溫馨為原則，不需過度鋪張。';
        const religionText =
            form.funeralReligion.trim() ||
            '儀式型態可依本人平日信仰或家人信仰為主，如無特定宗教，以簡單追思聚會代替。';
        const locationText =
            form.funeralLocation.trim() ||
            '儀式地點可由家人視方便性與實際情況決定，例如殯儀館、教會或其他合適場所，重點在於讓親友告別與陪伴。';
        const musicText =
            form.funeralMusic.trim() ||
            '如能準備幾首曾陪伴本人度過人生重要時刻的歌曲，或播放生活照片回顧，讓大家記得本人日常、自在的一面即可。';
        const dressCodeText =
            form.funeralDressCode.trim() ||
            '家人與前來致意的親友不必拘泥於全黑服裝，以素雅、舒適為主，不需要求繁複禮儀。若能以平常相處的自在狀態來告別，即足夠珍貴。';
        const contacts =
            Array.isArray(form.funeralContacts) && form.funeralContacts.length > 0
                ? form.funeralContacts
                : [];

        let contactsBlock;
        if (contacts.length > 0) {
            const lines = contacts.map((c, index) => {
                const name = (c.name || '').trim() || '姓名待填';
                const phone = (c.phone || '').trim();
                const social = (c.social || '').trim();
                const contactPieces = [];
                if (phone) contactPieces.push(`電話：${phone}`);
                if (social) contactPieces.push(`聯絡方式：${social}`);
                const contactStr = contactPieces.length > 0 ? `，${contactPieces.join('，')}` : '';
                return `　${index + 1}. ${name}${contactStr}`;
            });
            contactsBlock = `訃聞與通知對象清單：\n${lines.join('\n')}\n\n其餘皆不通知。`;
        } else {
            contactsBlock =
                '訃聞與通知對象清單：\n可由家人斟酌決定並通知最適合知情與參與告別之親友或相關單位，方式不拘，可為電話、訊息或社群貼文等。';
        }

        const moneyText =
            form.funeralMoney.trim() ||
            '如親友有心致送香儀或花禮，金額不必多，部分得視家人意願轉作公益捐款或支應喪葬相關必要費用，以實際幫助取代形式鋪張。';

        return (
            `喪禮規模與氛圍：\n${scaleText}\n\n` +
            `宗教信仰與儀式類型：\n${religionText}\n\n` +
            `儀式地點與靈堂布置：\n${locationText}\n\n` +
            `音樂、照片與想被記得的樣子：\n${musicText}\n\n` +
            `家屬與賓客服裝與禮儀：\n${dressCodeText}\n\n` +
            `${contactsBlock}\n\n` +
            `香儀、花禮與捐款安排：\n${moneyText}`
        );
    })();

    const burialPreferenceText = (() => {
        const organText =
            form.organDonation.trim() ||
            '如於法律與醫療條件允許且家人亦能接受之情況下，可由家人視當時狀況考慮器官或遺體捐贈事宜，以延續生命或作為醫療、教學之用；如當時不適合，則尊重家人與醫療團隊之專業判斷。';
        const burialTypeText =
            form.burialType.trim() ||
            '遺體處理方式可以火葬為主要考量，並由家人依環境保護、經濟負擔與信仰習慣綜合衡量，如海葬、樹葬或其他合乎規定之方式，皆可討論。土葬與否亦由家人斟酌。';
        const burialPlaceText =
            form.burialPlace.trim() ||
            '骨灰安置地點可由家人共同討論，選擇交通便利、負擔得起且讓家人安心之處，如公營或民營靈骨塔、樹葬區或其他合法空間；如家人認為適當，也可選擇撒放於具有共同回憶之自然環境中。';
        const tombText =
            form.tombText.trim() ||
            '如需設置墓碑或牌位，其上文字可簡單載明姓名、生卒年月日，如家人有合適的短句、祝福或感謝之語，亦可酌量加入，不需過多修飾。重要的是能讓後來的人一眼看出「這是誰」。';
        const memorialText =
            form.memorialRituals.trim() ||
            '年忌或祭拜方式不必成為家人壓力，可由家人依生活步調與心情安排：可以在重要日子一起吃頓飯、到曾經常去的地方走走，或各自以思念、祈禱、寫信等方式紀念即可，不一定要有固定儀式。';

        return (
            `器官捐贈或遺體捐贈意願：\n${organText}\n\n` +
            `遺體處理方式（火葬、土葬、海葬、樹葬等）：\n${burialTypeText}\n\n` +
            `骨灰安置地點與形式：\n${burialPlaceText}\n\n` +
            `墓碑、牌位或紀念文字：\n${tombText}\n\n` +
            `年忌、祭拜與日常紀念方式：\n${memorialText}`
        );
    })();

    const otherNotesText =
        form.otherNotes.trim() ||
        '希望家人彼此扶持、互相理解，將照顧彼此與延續家人情感放在爭取財產之前。';

    return `一、立遺囑人
本人 ${testator}，於完全清楚且意思表示自由之狀態下，立下本遺囑，以作為本人身後事與財產分配之依據。`
        + (executor
            ? `

二、遺囑執行人
本人指定 ${executor} 為本遺囑之遺囑執行人，負責協助處理本人身後事務與本遺囑所載各項事項之實現。`
            : `

二、遺囑執行人
如家人有需要，可另由最適合之家人或親友，依法律程序擔任遺囑執行之角色。`) +
        `

三、家人與受益人
本人主要希望照顧與關心之親友如下：
${beneficiariesText}

四、財產概況
本人目前之主要財產概況如下：
（一）不動產部分：
${realEstateText}

（二）金融資產部分：
${financialAssetsText}

（三）其他動產部分：
${movableAssetsText}

五、特別交代事項
關於特別贈與或指定分配之意向如下：
（一）不動產之特別指定：
${specialRealEstateText}

（二）金融資產之特別指定：
${specialFinancialText}

（三）其他動產之特別指定：
${specialMovableText}

六、喪禮與身後安排
本人對喪禮形式與遺體處理之基本想法如下：
（一）喪禮形式與儀式：
${funeralFormText}

（二）遺體處理與安葬方式：
${burialPreferenceText}

七、對家人的期望
${otherNotesText}

本遺囑係本人基於現階段之生活狀況與家庭關係所做之安排，將來如有重大變化，本人得依實際情形再行修正。`;
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

function addFuneralContact() {
    form.funeralContacts.push({
        name: '',
        relation: '',
        phone: '',
        social: '',
    });
}

function removeFuneralContact(index) {
    if (!Array.isArray(form.funeralContacts)) return;
    form.funeralContacts.splice(index, 1);
}
</script>

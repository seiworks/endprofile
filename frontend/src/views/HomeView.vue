<template>
    <div class="container py-5 fade-in-up">
        <h1 class="mb-3 text-light">人生 EndProfile</h1>
        <p class="mb-4 text-light">
            這裡會協助你一步一步完成預立遺囑、授權書／同居協議、共同購屋協議、生活授權，以及意定監護契約。
        </p>
        <div class="row g-3">
            <div class="col-md-3">
                <div class="card h-100 card-soft">
                    <div class="card-body d-flex flex-column justify-content-between">
                        <div>
                            <h5 class="card-title">預立遺囑</h5>
                            <p class="card-text">整理財產與想照顧的人，生成遺囑草稿。</p>
                        </div>
                        <div class="d-flex justify-content-between align-items-center mt-2">
                            <router-link class="btn btn-outline-light btn-sm" to="/endprofile/will">開始</router-link>
                            <small v-if="lastWillDate" class="text-light opacity-75 small">
                                上次編輯：{{ lastWillDate }}
                            </small>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card h-100 card-soft">
                    <div class="card-body d-flex flex-column justify-content-between">
                        <div>
                            <h5 class="card-title">授權書／同居協議</h5>
                            <p class="card-text">約定生活費、房產使用權與其它相關重要授權。</p>
                        </div>
                        <div class="d-flex justify-content-between align-items-center mt-2">
                            <router-link class="btn btn-outline-light btn-sm" to="/endprofile/cohabitation">
                                開始
                            </router-link>
                            <small v-if="lastCohabitationDate" class="text-light opacity-75 small">
                                上次編輯：{{ lastCohabitationDate }}
                            </small>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card h-100 card-soft">
                    <div class="card-body d-flex flex-column justify-content-between">
                        <div>
                            <h5 class="card-title">共同購屋協議</h5>
                            <p class="card-text">釐清共同出資買房時的持分、貸款與出場機制。</p>
                        </div>
                        <div class="d-flex justify-content-between align-items-center mt-2">
                            <router-link class="btn btn-outline-light btn-sm" to="/endprofile/joint-purchase">
                                開始
                            </router-link>
                            <small v-if="lastJointPurchaseDate" class="text-light opacity-75 small">
                                上次編輯：{{ lastJointPurchaseDate }}
                            </small>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card h-100 card-soft">
                    <div class="card-body d-flex flex-column justify-content-between">
                        <div>
                            <h5 class="card-title">生活授權</h5>
                            <p class="card-text">預先授權信任的人，在你不方便時協助處理帳戶與生活支出。</p>
                        </div>
                        <div class="d-flex justify-content-between align-items-center mt-2">
                            <router-link class="btn btn-outline-light btn-sm" to="/endprofile/life-authorization">
                                開始
                            </router-link>
                            <small v-if="lastLifeAuthorizationDate" class="text-light opacity-75 small">
                                上次編輯：{{ lastLifeAuthorizationDate }}
                            </small>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card h-100 card-soft">
                    <div class="card-body d-flex flex-column justify-content-between">
                        <div>
                            <h5 class="card-title">意定監護契約</h5>
                            <p class="card-text">指定最信任的人，在你失能時替你作決定。</p>
                        </div>
                        <div class="d-flex justify-content-between align-items-center mt-2">
                            <router-link class="btn btn-outline-light btn-sm" to="/endprofile/guardianship">
                                開始
                            </router-link>
                            <small v-if="lastGuardianshipDate" class="text-light opacity-75 small">
                                上次編輯：{{ lastGuardianshipDate }}
                            </small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';
import axios from 'axios';

const lastUpdated = ref({
    WILL: '',
    COHABITATION: '',
    JOINT_PURCHASE: '',
    LIFE_AUTHORIZATION: '',
    GUARDIANSHIP: '',
});

const formatDate = (isoString) => {
    if (!isoString) {
        return '';
    }
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) {
        return '';
    }
    const pad = (n) => n.toString().padStart(2, '0');
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    return `${year}/${month}/${day}`;
};

const lastWillDate = computed(() => formatDate(lastUpdated.value.WILL));
const lastCohabitationDate = computed(() => formatDate(lastUpdated.value.COHABITATION));
const lastJointPurchaseDate = computed(() => formatDate(lastUpdated.value.JOINT_PURCHASE));
const lastLifeAuthorizationDate = computed(() => formatDate(lastUpdated.value.LIFE_AUTHORIZATION));
const lastGuardianshipDate = computed(() => formatDate(lastUpdated.value.GUARDIANSHIP));

const loadLastUpdated = async () => {
    try {
        const response = await axios.get('/api/documents');
        const docs = Array.isArray(response.data) ? response.data : [];
        const setType = (type) => {
            const doc = docs.find((d) => d.type === type);
            lastUpdated.value[type] = doc && doc.updatedAt ? doc.updatedAt : '';
        };
        setType('WILL');
        setType('COHABITATION');
        setType('JOINT_PURCHASE');
        setType('LIFE_AUTHORIZATION');
        setType('GUARDIANSHIP');
    } catch (e) {
        console.error(e);
    }
};

onMounted(() => {
    loadLastUpdated();
});
</script>

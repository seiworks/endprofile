<template>
    <div class="container py-5 fade-in-up">
        <h1 class="mb-3 text-light">人生 EndProfile</h1>
        <p class="mb-4 text-light">
            這裡會協助你一步一步完成預立遺囑、授權書／同居協議、共同購屋協議、生活授權，以及意定監護契約。
        </p>
        <div class="row g-3 home-document-grid">
            <div v-for="document in DOCUMENTS" :key="document.type" class="col-6 col-md-3">
                <div class="card h-100 card-soft">
                    <div class="card-body d-flex flex-column justify-content-between">
                        <div>
                            <h5 class="card-title">{{ document.title }}</h5>
                            <p class="card-text">{{ document.description }}</p>
                        </div>
                        <div class="home-card-footer d-flex justify-content-between align-items-center mt-2">
                            <router-link class="btn btn-outline-light btn-sm" :to="document.route">開始</router-link>
                            <small v-if="lastUpdatedText(document.type)" class="text-light opacity-75 small">
                                上次編輯：{{ lastUpdatedText(document.type) }}
                            </small>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-6 col-md-3">
                <div class="card h-100 card-soft home-loan-card">
                    <div class="card-body d-flex flex-column justify-content-between">
                        <div>
                            <div class="home-loan-card-kicker mb-2">
                                <i class="mdi mdi-calculator-variant-outline" aria-hidden="true"></i>
                                購屋工具
                            </div>
                            <h5 class="card-title">每月貸款試算</h5>
                            <p class="card-text">試算貸款、寬限期與雙方每月分攤金額。</p>
                        </div>
                        <div class="home-card-footer d-flex justify-content-between align-items-center mt-2">
                            <router-link class="btn btn-outline-light btn-sm" to="/tools/monthly-loan">
                                開始試算
                            </router-link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { DOCUMENTS } from '../constants/documents';

const lastUpdated = ref({});

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
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    return `${year}/${month}/${day} ${hours}:${minutes}`;
};

const lastUpdatedText = (type) => formatDate(lastUpdated.value[type]);

const loadLastUpdated = async () => {
    try {
        const response = await axios.get('/api/documents');
        const docs = Array.isArray(response.data) ? response.data : [];
        DOCUMENTS.forEach((document) => {
            const doc = docs.find((d) => d.type === document.type);
            lastUpdated.value[document.type] = doc && doc.updatedAt ? doc.updatedAt : '';
        });
    } catch (e) {
        console.error(e);
    }
};

onMounted(() => {
    loadLastUpdated();
});
</script>

<style scoped>
.home-loan-card {
    position: relative;
    isolation: isolate;
}

.home-loan-card::after {
    content: '';
    position: absolute;
    inset: -0.25rem;
    z-index: -1;
    border: 1px solid rgba(255, 255, 255, 0.55);
    border-radius: 1.25rem;
    box-shadow: 0 0 0.8rem rgba(255, 255, 255, 0.22);
    pointer-events: none;
    animation: home-loan-card-breathe 3.2s ease-in-out infinite;
}

.home-loan-card-kicker {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    color: #ffd88a;
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.08em;
}

@keyframes home-loan-card-breathe {
    0%,
    100% {
        opacity: 0.28;
        transform: scale(0.995);
    }

    50% {
        opacity: 0.62;
        transform: scale(1.004);
    }
}

@media (prefers-reduced-motion: reduce) {
    .home-loan-card::after {
        animation: none;
        opacity: 0.8;
    }
}

@media (max-width: 767.98px) {
    .home-document-grid {
        --bs-gutter-x: 0.75rem;
        --bs-gutter-y: 0.75rem;
    }

    .home-document-grid .card-body {
        padding: 1rem;
    }

    .home-document-grid .card-title {
        font-size: 1rem;
    }

    .home-document-grid .card-text {
        font-size: 0.85rem;
        line-height: 1.45;
    }

    .home-card-footer {
        align-items: flex-start !important;
        flex-direction: column;
        gap: 0.55rem;
    }

    .home-card-footer .btn {
        width: 100%;
    }
}
</style>

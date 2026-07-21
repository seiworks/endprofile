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
    return `${year}/${month}/${day}`;
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

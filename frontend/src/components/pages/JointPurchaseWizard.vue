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
                                <h6 class="mb-2">每月貸款負擔</h6>

                                <div class="mb-2">
                                    <div class="form-check form-check-inline">
                                        <input v-model="form.loanType" class="form-check-input" type="radio"
                                            id="loanTypeRegular" value="regular">
                                        <label class="form-check-label" for="loanTypeRegular">一般首購</label>
                                    </div>
                                    <div class="form-check form-check-inline">
                                        <input v-model="form.loanType" class="form-check-input" type="radio"
                                            id="loanTypeYouth" value="youth">
                                        <label class="form-check-label" for="loanTypeYouth">新青安</label>
                                    </div>
                                </div>

                                <div v-if="form.loanType === 'regular'" class="mb-3">
                                    <div class="row g-2 align-items-end mb-2">
                                        <div class="col-md-3 col-6">
                                            <label class="form-label mb-0">貸款成數</label>
                                            <div class="input-group">
                                                <input v-model.number="form.regularLtv" type="number" min="0" max="100"
                                                    class="form-control" />
                                                <span class="input-group-text">%</span>
                                            </div>
                                        </div>
                                        <div class="col-md-5 col-6">
                                            <label class="form-label mb-0">貸款總額</label>
                                            <input :value="formatMoney(form.regularAmount)" type="text"
                                                class="form-control" placeholder="金額"
                                                @input="onMoneyInput('regularAmount', $event)" />
                                        </div>
                                    </div>
                                    <div class="row g-2 align-items-end">
                                        <div class="col-md-3 col-6">
                                            <label class="form-label mb-0">利率</label>
                                            <div class="input-group">
                                                <input v-model.number="form.regularRate" type="number" step="0.001"
                                                    class="form-control" />
                                                <span class="input-group-text">%</span>
                                            </div>
                                        </div>
                                        <div class="col-md-3 col-6">
                                            <label class="form-label mb-0">年限</label>
                                            <div class="input-group">
                                                <input v-model.number="form.regularYears" type="number"
                                                    class="form-control" />
                                                <span class="input-group-text">年</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div v-else class="mb-3">
                                    <div class="row g-2 align-items-end mb-2">
                                        <div class="col-md-4 col-6">
                                            <label class="form-label mb-0">整體貸款成數</label>
                                            <div class="input-group">
                                                <input v-model.number="form.youthGeneralLtv" type="number" min="0"
                                                    max="100" class="form-control" />
                                                <span class="input-group-text">%</span>
                                            </div>
                                        </div>
                                        <div class="col-md-4 col-6">
                                            <label class="form-label mb-0">整體貸款年限</label>
                                            <div class="input-group">
                                                <input v-model.number="form.youthYears" type="number"
                                                    class="form-control" />
                                                <span class="input-group-text">年</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="row g-2 align-items-end mb-2">
                                        <div class="col-12">
                                            <label class="form-label mb-0">青安貸款金額</label>
                                            <input :value="formatMoney(form.youthAmount)" type="text"
                                                class="form-control" placeholder="金額"
                                                @input="onMoneyInput('youthAmount', $event)" />
                                        </div>
                                    </div>

                                    <div class="row g-2 align-items-end mb-2">
                                        <div class="col-12">
                                            <label class="form-label mb-0">第一段利率</label>
                                            <div class="row g-1">
                                                <div class="col-3">
                                                    <input v-model.number="form.youthFirstFromMonth" type="number"
                                                        class="form-control" placeholder="起" />
                                                </div>
                                                <div class="col-1 d-flex align-items-center justify-content-center">
                                                    <span class="small text-muted">~</span>
                                                </div>
                                                <div class="col-3">
                                                    <input v-model.number="form.youthFirstToMonth" type="number"
                                                        class="form-control" placeholder="迄" />
                                                </div>
                                                <div class="col-2 d-flex align-items-center justify-content-center">
                                                    <span class="small text-muted">月</span>
                                                </div>
                                                <div class="col-3">
                                                    <div class="input-group">
                                                        <input v-model.number="form.youthFirstRate" type="number"
                                                            step="0.001" class="form-control" />
                                                        <span class="input-group-text">%</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="row g-2 align-items-end mb-2">
                                        <div class="col-12">
                                            <label class="form-label mb-0">第二段利率</label>
                                            <div class="row g-1">
                                                <div class="col-3">
                                                    <input v-model.number="form.youthSecondFromMonth" type="number"
                                                        class="form-control" placeholder="起" />
                                                </div>
                                                <div class="col-1 d-flex align-items-center justify-content-center">
                                                    <span class="small text-muted">~</span>
                                                </div>
                                                <div class="col-3">
                                                    <input v-model.number="form.youthSecondToMonth" type="number"
                                                        class="form-control" placeholder="迄" />
                                                </div>
                                                <div class="col-2 d-flex align-items-center justify-content-center">
                                                    <span class="small text-muted">月</span>
                                                </div>
                                                <div class="col-3">
                                                    <div class="input-group">
                                                        <input v-model.number="form.youthSecondRate" type="number"
                                                            step="0.001" class="form-control" />
                                                        <span class="input-group-text">%</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="row g-2 align-items-end mb-2">
                                        <div class="col-md-8 col-12">
                                            <label class="form-label mb-0">一般貸款金額（自動計算，可覆寫）</label>
                                            <input :value="formatMoney(form.youthGeneralAmount)" type="text"
                                                class="form-control" placeholder="自動計算，可手動修改"
                                                @input="onMoneyInput('youthGeneralAmount', $event)" />
                                        </div>
                                        <div class="col-md-4 col-6">
                                            <label class="form-label mb-0">一般貸款利率</label>
                                            <div class="input-group">
                                                <input v-model.number="form.youthGeneralRate" type="number" step="0.001"
                                                    class="form-control" />
                                                <span class="input-group-text">%</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="row g-2 align-items-end mb-2">
                                        <div class="col-md-4 col-6">
                                            <label class="form-label mb-0">一般貸款年限</label>
                                            <div class="input-group">
                                                <input v-model.number="form.youthGeneralYears" type="number"
                                                    class="form-control" />
                                                <span class="input-group-text">年</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="mt-2">
                                    <div class="row g-2 align-items-end mb-2">
                                        <div class="col-md-4 col-6">
                                            <label class="form-label mb-0">甲方分攤比例</label>
                                            <div class="input-group">
                                                <input v-model.number="form.monthlyShareA" type="number" min="0"
                                                    max="100" class="form-control" />
                                                <span class="input-group-text">%</span>
                                            </div>
                                        </div>
                                        <div class="col-md-4 col-6">
                                            <label class="form-label mb-0">乙方分攤比例</label>
                                            <div class="input-group">
                                                <input v-model.number="form.monthlyShareB" type="number" min="0"
                                                    max="100" class="form-control" />
                                                <span class="input-group-text">%</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="small text-muted mb-1">每月貸款負擔為</div>
                                    <div class="row g-2 align-items-end mb-2">
                                        <div class="col-md-4 col-6">
                                            <label class="form-label mb-0">甲方每月負擔</label>
                                            <input :value="formatMoney(form.monthlyLoanA)" type="text"
                                                class="form-control" placeholder="金額"
                                                @input="onMoneyInput('monthlyLoanA', $event)" />
                                        </div>
                                        <div class="col-md-4 col-6">
                                            <label class="form-label mb-0">乙方每月負擔</label>
                                            <input :value="formatMoney(form.monthlyLoanB)" type="text"
                                                class="form-control" placeholder="金額"
                                                @input="onMoneyInput('monthlyLoanB', $event)" />
                                        </div>
                                        <div class="col-md-4 col-12">
                                            <label class="form-label mb-0">合計每月負擔</label>
                                            <input :value="formatMoney(loanTotals.a + loanTotals.b)" type="text"
                                                class="form-control" placeholder="自動計算" readonly />
                                        </div>
                                    </div>
                                    <small class="form-text text-muted d-block" v-if="loanTotals.text">
                                        {{ loanTotals.text }}
                                    </small>
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
                        <div v-if="contributionSummary.oneTimeSum > 0 || loanTotals.a > 0 || loanTotals.b > 0"
                            class="mb-3">

                        </div>
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
import { computed, reactive, ref, onMounted, onUnmounted, watch } from 'vue';
import axios from 'axios';
import { downloadDocumentPdf } from '../../services/pdf';

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
    monthlyShareA: 50,
    monthlyShareB: 50,
    loanType: 'regular',
    regularLtv: null,
    regularAmount: null,
    regularRate: null,
    regularYears: null,
    youthAmount: null,
    youthFirstFromMonth: null,
    youthFirstToMonth: null,
    youthFirstRate: null,
    youthSecondFromMonth: null,
    youthSecondToMonth: null,
    youthSecondRate: null,
    youthYears: null,
    youthGeneralLtv: null,
    youthGeneralAmount: null,
    youthGeneralRate: null,
    youthGeneralYears: null,
    ownership: '',
    loan: '',
    expenses: '',
    saleMechanism: '',
    relationshipEnd: '',
    deathArrangement: '',
    breach: '',
});

const downloading = ref(false);
const saving = ref(false);
const error = ref('');
const lastSavedAt = ref('');
const documentId = ref('');
const showFloatingSave = ref(false);

const handleScroll = () => {
    if (typeof window === 'undefined') {
        return;
    }
    showFloatingSave.value = window.scrollY > 200;
};
const isAutoUpdatingMonthly = ref(false);

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

const computeMonthlyPayment = (principal, annualRate, years) => {
    const P = Number(principal) || 0;
    const rYear = Number(annualRate) || 0;
    const y = Number(years) || 0;
    if (P <= 0 || y <= 0) {
        return 0;
    }
    const n = y * 12;
    const r = rYear > 0 ? (rYear / 100) / 12 : 0;
    if (r <= 0) {
        return P / n;
    }
    return (P * r) / (1 - Math.pow(1 + r, -n));
};

watch(
    () => [form.totalPrice, form.regularLtv],
    ([total, ltv]) => {
        const t = Number(total) || 0;
        const p = Number(ltv) || 0;
        if (t > 0 && p > 0) {
            form.regularAmount = Math.round((t * p) / 100);
        }
    },
);

watch(
    () => [form.totalPrice, form.youthGeneralLtv, form.youthAmount],
    ([total, ltv, youthAmount]) => {
        const t = Number(total) || 0;
        const p = Number(ltv) || 0;
        const y = Number(youthAmount) || 0;
        if (t > 0 && p > 0) {
            const overall = Math.round((t * p) / 100);
            const general = Math.max(overall - y, 0);
            form.youthGeneralAmount = general;
        } else {
            form.youthGeneralAmount = 0;
        }
    },
);

const downPaymentTotals = computed(() => {
    const a =
        (Number(form.downContractA) || 0) +
        (Number(form.downStage1A) || 0) +
        (Number(form.downStage2A) || 0) +
        (Number(form.downAgencyA) || 0) +
        (Number(form.handoverA) || 0);
    const b =
        (Number(form.downContractB) || 0) +
        (Number(form.downStage1B) || 0) +
        (Number(form.downStage2B) || 0) +
        (Number(form.downAgencyB) || 0) +
        (Number(form.handoverB) || 0);
    const sum = a + b;
    if (sum <= 0) {
        return { a: 0, b: 0, text: '' };
    }
    const aRatio = sum > 0 ? (a / sum) * 100 : 0;
    const bRatio = sum > 0 ? (b / sum) * 100 : 0;
    const fmtP = (n) => `${n.toFixed(1).replace(/\.0$/, '')}%`;
    const fmtAmt = (n) => n.toLocaleString('zh-TW');
    const text =
        `購屋款合計：甲方約 ${fmtAmt(a)} 元（${fmtP(aRatio)}），` +
        `乙方約 ${fmtAmt(b)} 元（${fmtP(bRatio)}）。`;
    return { a, b, text, aRatio, bRatio };
});

const preMoveTotals = computed(() => {
    const a =
        (Number(form.decorationA) || 0) +
        (Number(form.furnitureA) || 0) +
        (Number(form.applianceA) || 0) +
        (Number(form.inspectionA) || 0);
    const b =
        (Number(form.decorationB) || 0) +
        (Number(form.furnitureB) || 0) +
        (Number(form.applianceB) || 0) +
        (Number(form.inspectionB) || 0);
    const sum = a + b;
    if (sum <= 0) {
        return { a: 0, b: 0, text: '' };
    }
    const aRatio = sum > 0 ? (a / sum) * 100 : 0;
    const bRatio = sum > 0 ? (b / sum) * 100 : 0;
    const fmtP = (n) => `${n.toFixed(1).replace(/\.0$/, '')}%`;
    const fmtAmt = (n) => n.toLocaleString('zh-TW');
    const text =
        `入住前支出合計：甲方約 ${fmtAmt(a)} 元（${fmtP(aRatio)}），` +
        `乙方約 ${fmtAmt(b)} 元（${fmtP(bRatio)}）。`;
    return { a, b, text, aRatio, bRatio };
});

const miscTotals = computed(() => {
    const a =
        (Number(form.cleaningA) || 0) +
        (Number(form.movingA) || 0);
    const b =
        (Number(form.cleaningB) || 0) +
        (Number(form.movingB) || 0);
    const sum = a + b;
    if (sum <= 0) {
        return { a: 0, b: 0, text: '' };
    }
    const aRatio = sum > 0 ? (a / sum) * 100 : 0;
    const bRatio = sum > 0 ? (b / sum) * 100 : 0;
    const fmtP = (n) => `${n.toFixed(1).replace(/\.0$/, '')}%`;
    const fmtAmt = (n) => n.toLocaleString('zh-TW');
    const text =
        `其他雜項支出合計：甲方約 ${fmtAmt(a)} 元（${fmtP(aRatio)}），` +
        `乙方約 ${fmtAmt(b)} 元（${fmtP(bRatio)}）。`;
    return { a, b, text, aRatio, bRatio };
});

const loanTotals = computed(() => {
    const a = Number(form.monthlyLoanA) || 0;
    const b = Number(form.monthlyLoanB) || 0;
    const sum = a + b;
    if (sum <= 0) {
        return { a: 0, b: 0, text: '' };
    }
    const aRatio = sum > 0 ? (a / sum) * 100 : 0;
    const bRatio = sum > 0 ? (b / sum) * 100 : 0;
    const fmtP = (n) => `${n.toFixed(1).replace(/\.0$/, '')}%`;
    const fmtAmt = (n) => n.toLocaleString('zh-TW');
    const text =
        `每月貸款合計：甲方約 ${fmtAmt(a)} 元（${fmtP(aRatio)}），` +
        `乙方約 ${fmtAmt(b)} 元（${fmtP(bRatio)}）。`;
    return { a, b, text, aRatio, bRatio };
});

const contributionSummary = computed(() => {
    const total = Number(form.totalPrice) || 0;
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

watch(
    () => [
        form.loanType,
        form.regularAmount,
        form.regularRate,
        form.regularYears,
        form.monthlyShareA,
        form.monthlyShareB,
    ],
    ([loanType, amount, rate, years, shareAInput, shareBInput]) => {
        if (loanType !== 'regular') {
            return;
        }
        const monthly = computeMonthlyPayment(amount, rate, years);
        if (monthly <= 0) {
            return;
        }
        const sA = Number(shareAInput) || 0;
        const sB = Number(shareBInput) || 0;
        let sum = sA + sB;
        if (sum <= 0) {
            sum = 100;
        }
        const shareA = sA / sum;
        const shareB = sB / sum;
        const aMonthly = Math.round(monthly * shareA);
        const bMonthly = Math.round(monthly * shareB);
        isAutoUpdatingMonthly.value = true;
        form.monthlyLoanA = aMonthly;
        form.monthlyLoanB = bMonthly;
        isAutoUpdatingMonthly.value = false;
    },
);

watch(
    () => [
        form.loanType,
        form.youthAmount,
        form.youthYears,
        form.youthFirstRate,
        form.youthSecondRate,
        form.youthGeneralAmount,
        form.youthGeneralRate,
        form.youthGeneralYears,
        form.monthlyShareA,
        form.monthlyShareB,
    ],
    ([
        loanType,
        youthAmount,
        youthYears,
        youthFirstRate,
        youthSecondRate,
        youthGeneralAmount,
        youthGeneralRate,
        youthGeneralYears,
        shareAInput,
        shareBInput,
    ]) => {
        if (loanType !== 'youth') {
            return;
        }
        const baseYouthRate =
            Number(youthSecondRate) || Number(youthFirstRate) || 0;
        const youthMonthly = computeMonthlyPayment(
            youthAmount,
            baseYouthRate,
            youthYears,
        );
        const generalMonthly = computeMonthlyPayment(
            youthGeneralAmount,
            youthGeneralRate,
            youthGeneralYears,
        );
        const totalMonthly = youthMonthly + generalMonthly;
        if (totalMonthly <= 0) {
            return;
        }
        const sA = Number(shareAInput) || 0;
        const sB = Number(shareBInput) || 0;
        let sum = sA + sB;
        if (sum <= 0) {
            sum = 100;
        }
        const shareA = sA / sum;
        const shareB = sB / sum;
        const aMonthly = Math.round(totalMonthly * shareA);
        const bMonthly = Math.round(totalMonthly * shareB);
        isAutoUpdatingMonthly.value = true;
        form.monthlyLoanA = aMonthly;
        form.monthlyLoanB = bMonthly;
        isAutoUpdatingMonthly.value = false;
    },
);

watch(
    () => [form.loanType, form.monthlyLoanA, form.monthlyLoanB],
    ([loanType, a, b]) => {
        if (!loanType || isAutoUpdatingMonthly.value) {
            return;
        }
        const va = Number(a) || 0;
        const vb = Number(b) || 0;
        const sum = va + vb;
        if (sum <= 0) {
            return;
        }
        const ratioA = (va / sum) * 100;
        const ratioB = (vb / sum) * 100;
        form.monthlyShareA = Math.round(ratioA);
        form.monthlyShareB = Math.round(ratioB);
    },
);

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

    const contributionText = (() => {
        const summary = contributionSummary.value;
        const fmtAmt = (n) => n.toLocaleString('zh-TW');
        const fmtP = (n) => `${n.toFixed(1).replace(/\.0$/, '')}%`;
        const parts = [];

        const addPairDetail = (label, a, b, indent) => {
            const va = Number(a) || 0;
            const vb = Number(b) || 0;
            if (va <= 0 && vb <= 0) {
                return;
            }
            parts.push(
                `${indent}${label}：甲方約新台幣 ${fmtAmt(
                    va,
                )} 元，乙方約新台幣 ${fmtAmt(vb)} 元。`,
            );
        };

        if (summary.total > 0) {
            parts.push(`(一) 房屋總價：新台幣 ${fmtAmt(summary.total)} 元。`);
        }

        if (summary.oneTimeSum > 0) {
            parts.push(
                `(二) 截至入住前累積出資：甲方約新台幣 ${fmtAmt(
                    summary.oneTimeA,
                )} 元（約 ${fmtP(
                    summary.aRatio,
                )}），乙方約新台幣 ${fmtAmt(
                    summary.oneTimeB,
                )} 元（約 ${fmtP(summary.bRatio)}）。`,
            );

            const anyDown =
                (Number(form.downContractA) || 0) +
                (Number(form.downContractB) || 0) +
                (Number(form.downStage1A) || 0) +
                (Number(form.downStage1B) || 0) +
                (Number(form.downStage2A) || 0) +
                (Number(form.downStage2B) || 0) +
                (Number(form.downAgencyA) || 0) +
                (Number(form.downAgencyB) || 0) +
                (Number(form.handoverA) || 0) +
                (Number(form.handoverB) || 0) >
                0;
            if (anyDown) {
                parts.push('　1. 頭期款明細：');
                addPairDetail(
                    '　　・簽約金',
                    form.downContractA,
                    form.downContractB,
                    '',
                );
                addPairDetail(
                    '　　・工程款一',
                    form.downStage1A,
                    form.downStage1B,
                    '',
                );
                addPairDetail(
                    '　　・工程款二',
                    form.downStage2A,
                    form.downStage2B,
                    '',
                );
                addPairDetail(
                    '　　・代收款',
                    form.downAgencyA,
                    form.downAgencyB,
                    '',
                );
                addPairDetail(
                    '　　・交屋款',
                    form.handoverA,
                    form.handoverB,
                    '',
                );
            }

            const anyPreMove =
                (Number(form.decorationA) || 0) +
                (Number(form.decorationB) || 0) +
                (Number(form.furnitureA) || 0) +
                (Number(form.furnitureB) || 0) +
                (Number(form.applianceA) || 0) +
                (Number(form.applianceB) || 0) +
                (Number(form.inspectionA) || 0) +
                (Number(form.inspectionB) || 0) >
                0;
            if (anyPreMove) {
                parts.push('　2. 入住前支出明細：');
                addPairDetail(
                    '　　・裝潢款',
                    form.decorationA,
                    form.decorationB,
                    '',
                );
                addPairDetail(
                    '　　・家具',
                    form.furnitureA,
                    form.furnitureB,
                    '',
                );
                addPairDetail(
                    '　　・家電',
                    form.applianceA,
                    form.applianceB,
                    '',
                );
                addPairDetail(
                    '　　・驗屋費用',
                    form.inspectionA,
                    form.inspectionB,
                    '',
                );
            }

            const anyMisc =
                (Number(form.cleaningA) || 0) +
                (Number(form.cleaningB) || 0) +
                (Number(form.movingA) || 0) +
                (Number(form.movingB) || 0) >
                0;
            if (anyMisc) {
                parts.push('　3. 其他雜項支出明細：');
                addPairDetail(
                    '　　・清潔費',
                    form.cleaningA,
                    form.cleaningB,
                    '',
                );
                addPairDetail(
                    '　　・搬家費用',
                    form.movingA,
                    form.movingB,
                    '',
                );
            }
        }

        const monthlyA = Number(loanTotals.value.a) || 0;
        const monthlyB = Number(loanTotals.value.b) || 0;
        if (monthlyA > 0 || monthlyB > 0) {
            const loanYears = 30;
            const months = loanYears * 12;
            const totalLoanA = monthlyA * months;
            const totalLoanB = monthlyB * months;
            const overallA = summary.oneTimeA + totalLoanA;
            const overallB = summary.oneTimeB + totalLoanB;
            const overallSum = overallA + overallB;
            const overallRatioA =
                overallSum > 0 ? (overallA / overallSum) * 100 : 0;
            const overallRatioB =
                overallSum > 0 ? (overallB / overallSum) * 100 : 0;

            parts.push(
                `(三) 若依目前每月貸款分擔情形持續繳納 ${loanYears} 年，概算雙方出資約為甲方新台幣 ${fmtAmt(
                    overallA,
                )} 元（約 ${fmtP(
                    overallRatioA,
                )}），乙方新台幣 ${fmtAmt(
                    overallB,
                )} 元（約 ${fmtP(overallRatioB)}），其中：`,
            );

            if (summary.oneTimeSum > 0) {
                parts.push(
                    `　1. 入住前之總出資：約甲方新台幣 ${fmtAmt(
                        summary.oneTimeA,
                    )} 元（約 ${fmtP(
                        summary.aRatio,
                    )}），乙方新台幣 ${fmtAmt(
                        summary.oneTimeB,
                    )} 元（約 ${fmtP(summary.bRatio)}）。`,
                );
            }

            const loanSum = totalLoanA + totalLoanB;
            if (loanSum > 0) {
                const loanRatioA =
                    loanSum > 0 ? (totalLoanA / loanSum) * 100 : 0;
                const loanRatioB =
                    loanSum > 0 ? (totalLoanB / loanSum) * 100 : 0;
                const index = summary.oneTimeSum > 0 ? 2 : 1;
                parts.push(
                    `　${index}. 貸款部分累積出資：約甲方新台幣 ${fmtAmt(
                        totalLoanA,
                    )} 元（約 ${fmtP(
                        loanRatioA,
                    )}），乙方新台幣 ${fmtAmt(
                        totalLoanB,
                    )} 元（約 ${fmtP(loanRatioB)}）。`,
                );
            }
        }

        if (!parts.length) {
            return '本標的物總價款及雙方出資比例，由甲乙雙方依實際出資情形協議約定，原則上以出資比例為準。';
        }

        return parts.join('\n');
    })();

    const ownershipText =
        form.ownership.trim() ||
        '產權登記原則上以出資比例共有，如雙方同意各二分之一或其他比例，得另行載明。';

    const loanText =
        form.loan.trim() ||
        '如需辦理銀行貸款，貸款總額由雙方共同決定，每月本息依出資比例或另行約定之比例分擔；如一方代為繳納，他方應返還其代墊款項，必要時得約定合理利息。';

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
${loanText}

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

const lastSavedText = computed(() => {
    if (!lastSavedAt.value) {
        return '';
    }
    const date = new Date(lastSavedAt.value);
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
});

async function onSaveDraft() {
    if (saving.value) {
        return;
    }
    saving.value = true;
    error.value = '';
    try {
        const structuredData = JSON.parse(JSON.stringify(form));
        const payload = {
            title: '共同購屋協議',
            structuredData,
            draftText: previewText.value,
            status: 'DRAFT',
        };
        let response;
        if (documentId.value) {
            response = await axios.patch(`/api/documents/${documentId.value}`, payload);
        } else {
            response = await axios.post('/api/documents', {
                type: 'JOINT_PURCHASE',
                ...payload,
            });
        }
        const doc = response && response.data;
        if (doc && doc._id) {
            documentId.value = doc._id;
        }
        if (doc && doc.updatedAt) {
            lastSavedAt.value = doc.updatedAt;
        }
    } catch (e) {
        console.error(e);
        error.value = '儲存失敗，請稍後再試。';
    } finally {
        saving.value = false;
    }
}

async function loadDraft() {
    try {
        const response = await axios.get('/api/documents');
        const docs = Array.isArray(response.data) ? response.data : [];
        const doc = docs.find((d) => d.type === 'JOINT_PURCHASE');
        if (!doc) {
            return;
        }
        documentId.value = doc._id;
        if (doc.updatedAt) {
            lastSavedAt.value = doc.updatedAt;
        }
        const data = doc.structuredData || {};
        Object.keys(data).forEach((key) => {
            if (Object.prototype.hasOwnProperty.call(form, key)) {
                form[key] = data[key];
            }
        });
    } catch (e) {
        console.error(e);
    }
}

onMounted(() => {
    if (typeof window !== 'undefined') {
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
    }
    loadDraft();
});

onUnmounted(() => {
    if (typeof window !== 'undefined') {
        window.removeEventListener('scroll', handleScroll);
    }
});

async function onDownload() {
    downloading.value = true;
    error.value = '';
    try {
        const title = '共同購屋協議';
        await downloadDocumentPdf({ type: 'JOINT_PURCHASE', title, content: previewText.value });
    } catch (e) {
        error.value = '下載 PDF 失敗，請稍後再試。';
    } finally {
        downloading.value = false;
    }
}
</script>

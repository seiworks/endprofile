# EndProfile 網頁版 App（PWA）變更紀錄

本文件自 **2026-08-15** 起，專門記錄 EndProfile 網頁版 App（PWA）的修改。

## 範圍約定

- 現階段只修改及追蹤網頁版 App（PWA）。
- local 版目前暫不修改。
- PWA 的程式、設定、資料結構或操作流程若有變更，均應記錄於本文件。
- 若某項修改也需要套用至 local 版，必須另外確認後才執行，不能自動同步。
- 每筆紀錄應註明影響範圍、修改內容及驗證結果，方便日後判斷兩個版本的差異。

## 變更紀錄

### 2026-08-15

#### 貸款試算顯示可能支付的總利息

- 修改原因：讓使用者除了每月負擔外，也能了解整個貸款期間可能支付的利息總額。
- 修改內容：一般首購納入寬限期與本息攤還利息；新青安納入逐年退場利率及搭配的一般貸款利息。
- 影響範圍：PWA 貸款試算結果、貸款計算服務及 smoke test。
- PWA 專屬設定／行為：在試算結果顯示「可能支付的總利息」。
- local 版：未修改。
- 驗證結果：貸款 smoke test 與前端 production build 均通過。
- 相關檔案：`frontend/src/components/pages/MonthlyLoanCalculator.vue`、`frontend/src/services/loanCalculator.js`、`frontend/scripts/loan-calculator-smoke.mjs`。

#### 建立 PWA 專用變更紀錄

- 新增本文件，作為網頁版 App（PWA）的變更紀錄起點。
- 確認目前開發範圍以 PWA 為主，local 版維持現狀。
- 本次沒有修改任何 PWA 或 local 版功能程式碼。

## 後續紀錄格式

新增 PWA 修改時，請依日期在「變更紀錄」最上方加入：

```md
### YYYY-MM-DD

#### 修改項目名稱

- 修改原因：
- 修改內容：
- 影響範圍：
- PWA 專屬設定／行為：
- local 版：未修改
- 驗證結果：
- 相關檔案：
```

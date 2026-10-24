# EndProfile 系統優化規格

- 日期：2026-10-23
- 狀態：提案，尚未實作；涉及 API、schema、帳號復原或保存時機的項目須先確認。
- 程式基準：`83e92b2`，初版規格檢查開始時工作目錄乾淨；接手檢查時僅有 README 修改及本規格未追蹤，無應用程式變更。
- 範圍：個人電腦 localhost 使用的五種文件 Wizard、草稿、帳號、舊密文轉換、瀏覽器 PDF 與驗證流程。

## 1. 結論與目標

優先改善資料保存可靠性，再改善輸入處理、PDF 效能與維護成本。沿用 Vue 3 Composition API、Vuex、Express route、Mongoose、MongoDB 與既有 UI framework，不以重寫系統作為優化前提。

本規格交付可拆分的需求、程式證據、驗收條件與實作順序；不表示缺陷已修復，也不授權部署、安裝依賴或修改既有安全模型。優先級 P0 為資料保護，P1 為穩定性與主要體驗，P2 為量測後改善。

### 已具備的能力

- 文件 API 使用登入驗證與 owner 查詢；列表已排除表單、內文與密文。
- Cookie 為 HttpOnly、SameSite=Strict，登入最長七天，登出與重設密碼會撤銷既有 Session。
- Wizard 共用 `useDocumentDraft`，已有手動保存、站內離頁保存與閒置 30 分鐘保存。
- 五種文件內文由前端計算；PDF 由 `frontend/src/services/pdf.js` 使用 PDF-lib 產生。
- Wizard 路由已有 lazy import，貸款計算與舊密文有 smoke test。
- `backend/routes/ai.js` 僅為本地範例，且目前未掛載於 `server.js`；不具正式 AI 整合。

### 非本次範圍

公開部署、雲端同步、正式 AI／法律內容審核、多人協作、新文件類型、更換框架、全面加密重設計及刪除歷史資料。此規格不評斷文件法律效力。

## 2. 問題與證據

以下是原始碼審查結果；除建置與 smoke 結果外，尚未以瀏覽器或真實 MongoDB 重現。

| ID／優先級 | 證據位置 | 現況與影響 |
| --- | --- | --- |
| OPT-01／P0 | `frontend/src/composables/useDocumentDraft.js:130–158`、`backend/routes/documents.js:156–164` | 載入／解密失敗只寫 console，finally 仍設定 `loadComplete=true`；解密前已設定文件 ID。後續編輯保存可能 PATCH 空白／不完整內容，且一般 PATCH 會移除密文。若列表載入失敗，則可能另建同類文件。 |
| OPT-02／P0 | `frontend/src/composables/useDocumentDraft.js:88–127,182–186` | 保存進行中再次保存會直接共用舊 Promise；第一次請求送出後再編輯並離頁，舊請求成功就可能允許離開，最新修改尚未保存。 |
| OPT-03／P1 | `backend/routes/documents.js:156–165`、`backend/models/Document.js:31–34` | 已有 `version` 遞增，但更新條件沒有版本檢查；兩分頁編輯同文件會後寫覆蓋前寫。 |
| OPT-04／P1 | `backend/server.js:36,68–74`、`backend/routes/documents.js:14–16,69–70,80–92,134–138,157–164` | 全域 JSON 上限 256 KiB（262,144 bytes），route 卻設定內文 2,000,000 字元、表單 4,000,000 bytes 上限；在目前 HTTP 管線中到達這兩個大小拒絕分支前，就會被 parser 擋下並回通用 500，壞 JSON 亦回 500。非空但全為空白的標題通過 route：POST trim 成空字串後觸發 Mongoose required 驗證，回 500；PATCH 未啟用更新驗證，會將空字串送往資料庫。無效 ObjectId 也落入 500。 |
| OPT-05／P1 | `frontend/src/services/pdf.js:1–2,34–38,63–76` | PDF 套件靜態匯入共用草稿模組、每次完整嵌入約 5.4 MB 字型；長標題未換行，簽名區未保證整組同頁。具體耗時與輸出大小尚待量測。 |
| OPT-06／P2 | `frontend/src/services/documentMigration.js:5–16`、`backend/routes/documents.js:36–40` | 每次轉換檢查會依序讀取所有文件詳細內容；列表無分頁，只有 userId 單欄索引，排序與大量文件效能待量測。 |
| OPT-07／P1 | `backend/routes/auth.js:107–120`、`SECURITY.md` | 只知道 Email 即可重設密碼是已記載的本機產品設計；localhost 並非帳號持有人驗證。不得將現況視為可公開部署的安全方案。 |
| OPT-08／P1 | `package.json`、`frontend/scripts/pdf-smoke.mjs`、`docs/ai/architecture.md`、`docs/ai/frontend.md` | verify 未包含 PDF smoke，且該 smoke 另行組裝 PDF，未測實際下載 service。架構文件仍寫 PDFKit，前端規範仍寫 proxy 4000，實際是瀏覽器 PDF、4001。 |

## 3. 功能與技術需求

### OPT-01：載入失敗及舊密文保護

1. 草稿狀態明確區分 loading、ready、load-error、locked；僅成功取得列表且確認沒有對應文件時，才允許新建。
2. loading 時禁止編輯，load-error／locked 時禁止保存與以空白內容下載；顯示原因、重試與返回入口。不得把失敗快照當作已載入成功。
3. 解密失敗不得呼叫一般 PATCH、POST 或移除 `encryptedPayload`；後端一般 PATCH 對仍有密文的文件須拒絕，合法轉換統一走 migrate。
4. migrate 只有成功解密後才送出；保留 `updatedAt`，成功後才切換成明文編輯。並行轉換遇 409 時重新讀取，禁止自動以空白資料重送。
5. `structuredData` 為 Wizard 表單來源，`draftText` 為目前模板的衍生內文；載入時不因模板重算而默默改寫舊文件。舊內文是否須提供歷史保留／預覽比對列入產品決策。

驗收：列表失敗、詳細資料失敗、解密失敗三種情境都不可寫入；原文件與密文逐欄不變。成功空列表可正常新建；轉換成功保留時間，失敗保留密文。以兩個帳號驗證越權仍不得讀取／修改。

相容性：一般 PATCH 拒絕密文文件將新增錯誤情境；須同步修改前端與測試，並確認所有 consumers 後實施。

### OPT-02：保存完成條件與離頁防護

1. 同一文件保存序列化。請求成功只更新該請求快照，若當前快照仍不同，離頁流程須保存剩餘變更後再判定可離開。
2. 失敗時保留表單與 dirty 狀態、阻止離頁並提供重試；401 顯示 Session 過期，不能清除尚未保存內容或陷入重試迴圈。
3. 站內導航等待最後一份快照保存完成；等待期間有新修改時繼續排入，不以舊 Promise 成功判定完成。關閉編輯或顯示保存中狀態，避免無限新增修改。
4. dirty 時註冊 `beforeunload` 提醒，保存後解除。關閉分頁不保證非同步保存成功，不以 unload request 宣稱已保存。
5. 保持目前手動、站內離頁與閒置 30 分鐘行為；是否增加輸入停止後短時間保存，另經產品確認。提醒不新增明文 localStorage 備份。

驗收：A 請求尚未完成→輸入 B→立即導航，重開須見 B；保存失敗留在原頁且資料仍在；無修改不發請求；連點保存不重複建立；dirty 關閉有提醒，保存後沒有。測試重試、401、元件卸載與計時器清理。

### OPT-03：版本衝突保護（API 變更，待確認）

建議使用既有 `version`，不新增資料欄位。PATCH 攜帶 `expectedVersion`，後端以 `_id + userId + version` 原子更新並遞增版本。owner 查詢不存在回 404，存在但版本不同回 409；不得洩露其他帳號文件是否存在。

前端保存成功更新版本；409 保留本機內容、顯示衝突，使用者可先複製未保存文字再選擇載入伺服器版，不自動覆蓋或合併。缺版本的舊文件先盤點，再定義回填；不可直接假設全部資料都有 version。

驗收：兩個頁面讀 v1，A 保存成 v2，B 帶 v1 保存得到 409，DB 仍為 A 內容。缺少／非整數／負版本回 400；測試舊文件與越權。migrate 同步檢查競態，不與一般 PATCH 互相覆蓋。

發布：前後端作為同一次本機版本更新；不保留可無條件寫入的舊客戶端旁路。回復舊版本前須停寫、備份並確認不會再次移除未解密密文。

### OPT-04：輸入與錯誤處理一致

- 暫保留 256 KiB（262,144 bytes）整體 request 上限，文件化 UTF-8 JSON bytes 與欄位長度是不同限制；前端先檢查完整序列化 payload bytes，後端仍為權威。不直接放大全域 body limit。現有 2,000,000 字元／4,000,000 bytes 常數的「超大欄位拒絕分支」在此管線不可達；型別與序列化檢查仍有效，不能將整個驗證函式視為死碼。實作時統一限制來源與文件，不對外承諾可保存這麼大的欄位。
- parser 超限回 413，壞 JSON 回 400；保留 `{ message }` 錯誤格式。僅未知伺服器錯誤回 500。
- POST／PATCH 的 title trim 後長度均為 1–200；兩者都須在 route 層明確拒絕全空白標題並回 400，不能只依賴 create 的 required 驗證。PATCH 啟用 `runValidators: true` 作為第二層防護，先以現有資料 fixtures 確認相容性；不得為修正新請求而批次改寫歷史資料。文件 ID 先檢查格式，格式錯回 400，不存在／他人文件回 404。
- 五種 structuredData 逐步加入與現有表單對應的型別與範圍檢查；草稿允許未填完整，不把完成文件必填規則套用到草稿。先盤點舊資料再收緊，不靜默丟棄欄位。
- 日誌只記 route、錯誤類型與必要技術訊息，避免直接輸出可能夾帶文件內容、帳密或 Cookie 的完整 error／request。

驗收：POST／PATCH 空白標題均回 400，既有文件 title、version 與 updatedAt 不變；PATCH 驗證失敗不寫入。另測壞 ID、null body、錯型別、壞 JSON、UTF-8 中文 JSON payload 的 262,143／262,144／262,145 bytes 邊界：前兩者在其他資料合法時可通過大小檢查，最後一者回 413。錯誤回應及日誌無文件正文、token 或密碼。有效既有草稿仍可保存。

### OPT-05：PDF 載入、排版與效能

1. 下載時動態 import PDF service，避免開啟 Wizard 即載入 PDF-lib／fontkit；保持下載中狀態及失敗可重試。
2. 先測現況，再比較字型 subset 與完整嵌入；只有五種文件中文、標點、生僻字的正確性檢查通過才採 subset。可快取唯讀字型 bytes，不跨文件重用 PDF font object。
3. 標題按可用寬度換行；簽名與日期區塊先計算所需高度，能同頁時整組保留，不能時換頁。正文保持段落與換頁。
4. 使用合成資料，量測五類文件各 1,000／10,000 中文字的冷／熱下載各五次，記錄瀏覽器版本、機器、p50／p95、檔案 bytes、頁數及錯誤；不得把使用者內容送外部量測服務。

驗收：Wizard 初次載入的依賴鏈不包含 PDF 套件；相同 10,000 字 fixture 輸出大小目標降低至少 50%，p95 產生時間不得比基準增加超過 10%。若字型相容性不符則保留完整嵌入，記錄未達標原因。五類 PDF 必須可開啟、中文完整、標題不超界、簽名日期可見；缺字型與下載失敗有錯誤回饋。

上述數值為提案驗收目標，尚非實測成果；實作時先提交基準。PDF 測試須使用實際 renderer／下載 service，不能只測另一份示意 PDF。

### OPT-06：查詢與轉換成本（量測後決定）

先以隔離 MongoDB 合成 5／100／1,000 份文件，量測列表耗時、回傳 bytes、登入轉換檢查請求數及 explain。若排序成本明顯，再評估 `{ userId: 1, updatedAt: -1 }` 索引；新增索引屬 schema／操作變更，先確認並保留回復方案。

短期不改列表回傳陣列。若需要 pagination 或密文候選查詢，另提出相容 API，完整同步首頁、Wizard、migration consumers；列表仍禁止包含內文與密文。建議用輕量轉換狀態篩選候選，避免每次讀取全部文件正文，但不得跳過尚未轉換文件。

驗收目標：在相同 fixtures 下，優化後 p95 不退步；全部明文情境下轉換檢查不再逐份讀詳細資料；有密文時逐份失敗隔離、可重試且不丟資料。不先新增唯一 userId/type 索引，避免未定義的多份同類文件遭破壞。

### OPT-07：帳號復原的產品決策

保留本機範圍及明文模型的事實，不自行改成寄信或雲端服務。需確認選項：

- A：維持 Email 重設，接受同電腦可操作 localhost 者能重設帳號的限制；只適用單一可信任 OS 使用者。
- B（較強身分驗證的建議方向）：取消無證明重設，規劃一次性離線復原碼；須新增發放、雜湊保存、一次性消耗與遺失處理流程，涉及 schema、UX 與既有帳號遷移，另立 spec 後實作。

不以 UI 隱藏按鈕作為驗證。無論採何方案，重設成功撤銷 Session、Cookie 安全屬性與 owner 保護都須回歸。未決前不得宣稱支援共用電腦或公開部署。

### OPT-08：文件與驗證可重現

- 同步 `docs/ai/architecture.md`、`frontend.md`、`backend.md` 與 README：瀏覽器 PDF、4001 proxy、實際掛載 API、本機明文限制；區分未掛載的 PDFKit／AI 舊路由，不為舊 PDF route 補裝 PDFKit。
- 補入 OPT-01～04 可重現的回歸案例；既有安全整合使用 FakeUser／FakeDocument，不足以證明真實 MongoDB 原子更新、ObjectId casting、timestamps、索引與 migration。
- 另在可監聽且有隔離測試 DB 的環境跑真實整合；指定測試專用 DB，不連線或清除個人使用的資料庫。需要工具／依賴時先列需求，停止安裝。
- 重構 PDF smoke 使用實際產生流程，再加入 verify；測試輸出只能放忽略的測試目錄並使用假資料。
- Node 基準依 `package.json` 的 20.x 執行，另行評估執行環境升級，不將本次 Node 22 結果視為 Node 20 驗證。

## 4. 實作拆分與影響範圍

| 批次 | 順序與交付 | 預期檔案 | 風險與退回方式 |
| --- | --- | --- | --- |
| S1 | OPT-01、02，先補失敗／競態回歸，再修保存與密文保護 | composable、五種 Wizard、documents route、相關 scripts | 中高：錯誤防護可能阻擋編輯；保留資料，修復後重試，不繞過密文保護。 |
| S2 | 確認後做 OPT-03，連同 OPT-04 輸入邊界 | documents route/model、前端保存 consumer、server、錯誤 helper、測試 | 高：涉及 API 與舊資料；停寫備份、先跑隔離舊資料 fixtures，前後端同步更新。 |
| S3 | OPT-05 與 OPT-08，PDF 實際流程測試、文件校正 | pdf service、composable、PDF smoke、package scripts、README、docs/ai | 中：字型與換頁回歸；保留完整字型方案，保留本機生成邊界。 |
| S4 | OPT-06 基準量測，OPT-07 決策後另開實作 | documentMigration、documents route/model、登入流程；復原另案 | 視決策：不預先遷移 schema、加入唯一約束或移除既有資料。 |

所有批次完成後均須確認五種 Wizard → 保存 → 重開 → 首頁最近編輯時間 → PDF 流程，並回歸貸款試算套用、舊密文與帳號隔離。未通過資料保護驗收前，不以效能改善作為發布理由。

## 5. 待決策清單

1. 是否批准 expectedVersion／409 的 API 行為及同步更新要求？建議批准，避免分頁互相覆蓋。
2. 每類文件是一份持續編輯草稿或可保留多份？現況 API 可建立多份，首頁與 Wizard 取最新一份；未決前不新增唯一索引。
3. 保留 30 分鐘閒置保存或新增較短的輸入後保存？建議先完成保存正確性，再以使用情境決定。
4. 舊內文是否需要歷史保留／模板版本？目前 computed 會以新模板產生預覽，不等同歷史內文還原。
5. 帳號復原採 OPT-07 的 A 或 B？本次不自動變更。

## 6. 初版驗證證據與限制

這是文件交付；未修改應用程式、API 或 schema，未安裝依賴、commit 或 push。

| 檢查 | 結果 |
| --- | --- |
| `npm run verify` | 未完整通過：後端 smoke 通過；security-integration 在 `listen(0)` 因沙箱禁止監聽而出現 `EPERM 0.0.0.0`，後續串接項目未執行。 |
| `node frontend/scripts/vault-smoke.mjs` | 單獨執行通過，屬 smoke，非真實 MongoDB migration。 |
| `node frontend/scripts/loan-calculator-smoke.mjs` | 單獨執行通過。 |
| `npm run build --prefix frontend` | 通過。草稿共用 chunk 約 1,153.72 KB（gzip 508.36 KB）、主 CSS 約 923.96 KB（gzip 134.85 KB），有大 chunk 警告。此為建置大小，非瀏覽器載入耗時。 |
| Node | 實際 v22.9.0；專案 engines 為 20.x，存在版本驗證缺口。 |
| 瀏覽器／PDF 視覺、真實 MongoDB、安全 HTTP 測試 | 未完成；本次以程式審查與可執行 smoke/build 建立提案，不能宣稱端到端或完整安全驗證通過。 |

下一步建議先實作 S1，將每個資料風險轉為可失敗的回歸案例；待 API 與產品決策確認後再展開 S2～S4。

## 7. 接手複核紀錄（2026-10-23）

- 核對 git HEAD 仍為 `83e92b2`，接手前只有 README 修改與本規格未追蹤；保留既有修改。
- 修正 OPT-04 的 server 錯誤處理行號為 68–74、POST 標題檢查行號為 69–70，補齊新增／更新空白標題的不同結果及大小拒絕分支不可達的條件。
- 補充 PATCH 未設定 `runValidators` 的具體證據及防護驗收。交接未提供「另 1 個問題」的具體位置，本紀錄不假定上述問題就是上一位所指項目。
- 離線執行實際 POST handler，僅將 `Document.create` 的資料庫操作替換為真實 Mongoose model `validate()`：空白標題觸發 required，handler 回 500，斷言通過；未連接資料庫。
- 離線執行實際 PATCH handler，以替身擷取 `findOneAndUpdate`：`title` 為空字串且 options 未設 `runValidators`，handler 在替身成功時回 200，斷言通過。此證據證明 route 行為，尚非真實 DB 寫入驗證。
- 重新探測 `127.0.0.1` 隨機埠監聽仍回 `EPERM`；雖然環境已有 mongod／mongosh，仍不能在此沙箱啟動可用的隔離整合服務。未嘗試使用個人資料庫，也未安裝任何依賴。
- 本次僅校正規格，不重跑未變更應用程式的 build；第 6 節結果是初版驗證紀錄，不代表本次重新執行。
- OPT-03 API 與 OPT-07 帳號復原決策仍待使用者回覆；交接文字與通用接手要求不視為替使用者選擇 A／B 或批准特定 API 變更。條件尚未滿足，S1 尚未開始實作。

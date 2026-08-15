# EndProfile Local Security Model

## Intended environment

正式版只適合在單一使用者控制的個人電腦上執行。前端、後端與 MongoDB 都應留在 localhost，不得直接公開到區域網路或網際網路。

## Stored data

- 密碼使用 bcrypt hash 保存。
- 登入使用 HttpOnly、SameSite=Strict Cookie，JWT 與 Cookie 最長有效 7 天。
- 文件的標題、表單資料與完整內文以明文保存於 MongoDB。
- MongoDB 備份與下載的 PDF 同樣含有可直接閱讀的敏感內容。
- 舊版 `encryptedPayload` 只用於一次性相容轉換；成功轉換後會被移除。

## Password reset

忘記密碼功能只以已註冊 Email 識別帳號，不寄送驗證信，也不要求復原金鑰。重設成功後會增加 `sessionVersion`，撤銷該帳號先前發出的所有 Session。

此流程依賴「只有電腦擁有者能操作 localhost」的假設，不適合多人共用電腦或任何公開部署。

## User responsibilities

- 使用至少 12 字元且不重複使用的密碼。
- 不在共用電腦上執行本系統。
- 使用後可手動登出；即使未登出，Session 最長 7 天後失效。
- 啟用 FileVault、BitLocker 或等效的整碟加密。
- 妥善保管 MongoDB 資料目錄、備份與 PDF。

## Operator responsibilities

- MongoDB 只監聽 localhost，不公開 `27017`。
- Express 與 Vite 只供本機存取，不設定 port forwarding 或公開反向代理。
- `JWT_SECRET` 只放在 `backend/.env`。
- 定期建立並實際測試 MongoDB 備份還原；將備份視為明文敏感資料。
- 安裝依賴更新前先執行測試並檢查安全公告。

## Limitations

本機明文模式不能防止惡意軟體、惡意瀏覽器擴充套件、其他可登入同一作業系統帳號的人，或可讀取 MongoDB 資料目錄的人取得文件內容。

若未來重新部署到網際網路，必須重新設計密碼重設驗證、HTTPS、資料庫網路隔離與文件加密，不能直接沿用此本機安全模型。

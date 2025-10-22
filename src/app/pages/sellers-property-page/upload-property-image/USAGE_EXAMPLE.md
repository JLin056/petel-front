# Upload Property Image Dialog 使用說明

## 功能說明

這個組件已被包裝成一個 Dialog，提供以下功能：
- 拖曳上傳或點擊選擇圖片
- 支援多檔案上傳
- 顯示已上傳檔案列表
- 上傳到 S3 使用 Presigned URL
- 完成後回傳所有上傳的圖片 URL

## 在父組件中使用

### 1. 在父組件的 HTML 中：

```html
<!-- 觸發按鈕 -->
<p-button
    label="上傳圖片"
    icon="pi pi-upload"
    (onClick)="showUploadDialog()" />

<!-- Dialog 組件 -->
<app-upload-property-image
    [(visible)]="uploadDialogVisible"
    (uploadComplete)="onUploadComplete($event)" />
```

### 2. 在父組件的 TypeScript 中：

```typescript
import { Component } from '@angular/core';
import { UploadPropertyImage } from './upload-property-image/upload-property-image';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-parent',
  imports: [UploadPropertyImage, ButtonModule],
  templateUrl: './parent.html',
  styleUrl: './parent.css'
})
export class ParentComponent {
  // 控制 Dialog 顯示
  uploadDialogVisible: boolean = false;

  // 打開上傳 Dialog
  showUploadDialog(): void {
    this.uploadDialogVisible = true;
  }

  // 處理上傳完成事件
  onUploadComplete(uploadedUrls: string[]): void {
    console.log('上傳完成，圖片 URLs:', uploadedUrls);

    // 在這裡處理上傳完成後的邏輯
    // 例如：將 URLs 儲存到表單、發送到後端等
    this.savePropertyImages(uploadedUrls);
  }

  // 儲存圖片 URLs
  savePropertyImages(urls: string[]): void {
    // 實作您的儲存邏輯
    console.log('儲存圖片 URLs 到資料庫:', urls);
  }
}
```

## API

### Input 屬性

| 屬性 | 類型 | 預設值 | 說明 |
|------|------|--------|------|
| visible | boolean | false | 控制 Dialog 的顯示/隱藏 |

### Output 事件

| 事件 | 參數類型 | 說明 |
|------|----------|------|
| visibleChange | boolean | Dialog 顯示狀態改變時觸發 |
| uploadComplete | string[] | 上傳完成時觸發，回傳所有上傳成功的圖片 URL |

## 功能特色

✅ **拖曳上傳**：支援拖曳圖片到上傳區域
✅ **多檔案**：可同時上傳多個圖片
✅ **即時反饋**：顯示已上傳的檔案列表
✅ **檔案限制**：最大 5MB，支援 image/* 格式
✅ **清除功能**：可清除已上傳列表重新上傳
✅ **咖啡色主題**：與整體風格一致
✅ **響應式設計**：適配桌面和手機

## 按鈕說明

- **清除**：清空已上傳的檔案列表（不會刪除 S3 上的檔案）
- **取消**：關閉 Dialog，已上傳的檔案不會回傳
- **完成**：確認上傳並關閉 Dialog，將所有上傳成功的 URL 回傳給父組件

## 注意事項

1. 確保後端 API 端點 `http://localhost:8080/images/sign-upload` 可正常運作
2. 上傳完成後，組件會自動清空檔案列表
3. 點擊「完成」時，如果沒有上傳任何檔案，會顯示提醒訊息
4. 所有上傳操作都會顯示 Toast 通知訊息

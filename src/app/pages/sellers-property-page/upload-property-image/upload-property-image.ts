import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileUpload, FileUploadHandlerEvent } from 'primeng/fileupload';
import { ButtonModule } from "primeng/button";
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { MessageService } from 'primeng/api';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-upload-property-image',
  imports: [CommonModule, FileUpload, ButtonModule, ToastModule, DialogModule],
  templateUrl: './upload-property-image.html',
  styleUrl: './upload-property-image.css',
  providers: [MessageService]
})
export class UploadPropertyImage {
  // Dialog 顯示控制
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();

  // 上傳完成事件，將上傳的文件 URL 傳回父組件
  @Output() uploadComplete = new EventEmitter<string[]>();

  // 已上傳檔案的追蹤陣列
  uploadedFiles: Array<{name: string, size: number, url?: string}> = [];

  // 定義您的後端 API 端點
  private presignApiUrl: string = 'http://localhost:8080/images/sign-upload';

  // 注入服務
  constructor(
    private http: HttpClient,
    private messageService: MessageService
  ) {}

    // 實作自訂上傳處理函式
    myUploader(event: FileUploadHandlerEvent) {

        const files: File[] = event.files;

        // 確保有檔案
        if (!files || files.length === 0) {
            this.messageService.add({severity: 'warn', summary: '警告', detail: '未選擇檔案'});
            return;
        }

        // 遍歷每個選中的檔案
        files.forEach(file => {

            // 步驟 A: 呼叫您的後端 API 取得 Presigned URL
            this.http.post<any>(this.presignApiUrl, { fileName: file.name, contentType: file.type })
                .subscribe({
                    next: (response) => {
                        const presignedUrl = response.presignedUrl; // 假設您的後端回應中有這個屬性

                        // 步驟 B: 直接 PUT 檔案到 S3
                        this.uploadToS3(file, presignedUrl);
                    },
                    error: (_err) => {
                        this.messageService.add({severity: 'error', summary: '上傳失敗', detail: `無法取得 ${file.name} 的上傳權限。`});
                    }
                });
        });
    }

    // 專門用於將檔案上傳到 S3 的函式 (PUT 請求)
    uploadToS3(file: File, presignedUrl: string) {

        // S3 PUT 請求需要設定 Content-Type 標頭
        const headers = new HttpHeaders({
            'Content-Type': file.type
            // 注意：不需要 authorization 或其他 CORS 相關標頭
        });

        // **使用 PUT 請求** 將檔案內容直接發送到 S3
        this.http.put(presignedUrl, file, { headers: headers }).subscribe({
            next: () => {
                // 將成功上傳的檔案加入追蹤陣列
                this.uploadedFiles.push({
                    name: file.name,
                    size: file.size,
                    url: presignedUrl.split('?')[0] // 去除查詢參數，保留檔案 URL
                });

                this.messageService.add({severity: 'success', summary: '上傳成功', detail: `${file.name} 已成功上傳到 S3。`});
                // 可以在這裡執行您上傳成功後的邏輯，例如通知後端檔案已就緒
            },
            error: (_err) => {
                this.messageService.add({severity: 'error', summary: '上傳失敗', detail: `${file.name} 上傳 S3 失敗。`});
            }
        });
    }

    // 關閉 Dialog
    onClose(): void {
        this.visible = false;
        this.visibleChange.emit(false);
    }

    // 完成上傳並關閉 Dialog
    onComplete(): void {
        if (this.uploadedFiles.length === 0) {
            this.messageService.add({
                severity: 'warn',
                summary: '提醒',
                detail: '尚未上傳任何圖片'
            });
            return;
        }

        // 提取所有上傳成功的文件 URL
        const uploadedUrls = this.uploadedFiles
            .filter(file => file.url)
            .map(file => file.url!);

        // 發送上傳完成事件
        this.uploadComplete.emit(uploadedUrls);

        // 清空上傳列表
        this.uploadedFiles = [];

        // 關閉 Dialog
        this.onClose();
    }

    // 清除已上傳的文件列表
    onClear(): void {
        this.uploadedFiles = [];
        this.messageService.add({
            severity: 'info',
            summary: '已清除',
            detail: '已清除上傳列表'
        });
    }
}

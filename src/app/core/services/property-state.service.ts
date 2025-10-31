import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * 管理當前選中旅館的狀態
 */
@Injectable({
    providedIn: 'root'
})
export class PropertyStateService {
    /** 當前選中的旅館 ID */
    private currentPropertyIdSubject = new BehaviorSubject<string>('');

    /** 當前選中的旅館 ID (Observable) */
    public currentPropertyId$: Observable<string> = this.currentPropertyIdSubject.asObservable();

    /** 當前選中的旅館名稱 */
    private currentPropertyNameSubject = new BehaviorSubject<string>('');

    /** 當前選中的旅館名稱 (Observable) */
    public currentPropertyName$: Observable<string> = this.currentPropertyNameSubject.asObservable();

    constructor() {
        // 從 localStorage 讀取上次選中的旅館 ID 和名稱
        const savedPropertyId = localStorage.getItem('currentPropertyId');
        const savedPropertyName = localStorage.getItem('currentPropertyName');

        if (savedPropertyId) {
            this.currentPropertyIdSubject.next(savedPropertyId);
        }

        if (savedPropertyName) {
            this.currentPropertyNameSubject.next(savedPropertyName);
        }
    }

    /**
     * 設定當前旅館 ID
     * @param propertyId 旅館 ID
     * @param propertyName 旅館名稱（選填）
     */
    setCurrentPropertyId(propertyId: string, propertyName?: string): void {
        this.currentPropertyIdSubject.next(propertyId);
        localStorage.setItem('currentPropertyId', propertyId);

        if (propertyName) {
            this.currentPropertyNameSubject.next(propertyName);
            localStorage.setItem('currentPropertyName', propertyName);
        }
    }

    /**
     * 設定當前旅館名稱
     * @param propertyName 旅館名稱
     */
    setCurrentPropertyName(propertyName: string): void {
        this.currentPropertyNameSubject.next(propertyName);
        localStorage.setItem('currentPropertyName', propertyName);
    }

    /**
     * 取得當前旅館 ID
     * @returns 當前旅館 ID
     */
    getCurrentPropertyId(): string {
        return this.currentPropertyIdSubject.value;
    }

    /**
     * 取得當前旅館名稱
     * @returns 當前旅館名稱
     */
    getCurrentPropertyName(): string {
        return this.currentPropertyNameSubject.value;
    }

    /**
     * 清除當前旅館 ID 和名稱
     */
    clearCurrentPropertyId(): void {
        this.currentPropertyIdSubject.next('');
        this.currentPropertyNameSubject.next('');
        localStorage.removeItem('currentPropertyId');
        localStorage.removeItem('currentPropertyName');
    }
}

/**
 * 通知類型
 */
export type NotificationType = 'SYSTEM' | 'ORDER' | 'PAYMENT';

/**
 * 通知狀態
 */
export type NotificationStatus = 'UNREAD' | 'READ';

/**
 * 通知資料物件
 */
export interface NotificationDto {
    /** 通知編號 */
    id: string;
    /** 通知標題 */
    title: string;
    /** 通知訊息內容 */
    message: string;
    /** 通知類型 */
    type: NotificationType;
    /** 通知狀態 */
    status: NotificationStatus;
    /** 通知建立時間 (ISO 8601) */
    created_at: string;
    /** 通知已讀時間 (ISO 8601)，未讀時為 null */
    read_at: string | null;
    /** 關聯的訂單編號 */
    order_id?: string;
    /** 關聯的旅館編號 */
    property_id?: string;
    /** 入住時間 (ISO 8601) */
    check_in?: string;
    /** 退房時間 (ISO 8601) */
    check_out?: string;
    /** 旅館名稱（ORDER 類型通知時提供）*/
    property_name?: string;
    /** 用戶名稱（ORDER 類型通知時提供）*/
    user_name?: string;
    /** 金額（ORDER / PAYMENT 類型通知時提供）*/
    amount?: number;
}

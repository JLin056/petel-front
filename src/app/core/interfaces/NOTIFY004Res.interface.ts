import { Res } from './Res.interface';

/**
 * NOTIFY-004 統計未讀通知數量 - 回應
 */
export interface NOTIFY004ResData {
    /** 未讀通知數量 */
    unread_count: number;
}

export type NOTIFY004Res = Res<NOTIFY004ResData>;

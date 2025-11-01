import { Res } from './Res.interface';

/**
 * NOTIFY-003 標記通知為已讀 - 回應
 */
export interface NOTIFY003ResData {
    /** 是否成功 */
    success: boolean;
    /** 已讀時間 (ISO 8601) */
    read_at: string;
}

export type NOTIFY003Res = Res<NOTIFY003ResData>;

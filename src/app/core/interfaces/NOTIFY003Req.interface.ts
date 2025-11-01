import { Req } from './Req.interface';

/**
 * NOTIFY-003 標記通知為已讀 - 請求
 */
export interface NOTIFY003ReqData {
    /** 要標記為已讀的通知 ID */
    notification_id: string;
}

export type NOTIFY003Req = Req<NOTIFY003ReqData>;

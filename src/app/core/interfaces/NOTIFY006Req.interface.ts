import { Req } from './Req.interface';

/**
 * NOTIFY-006 補發錯過的事件 - 請求
 */
export interface NOTIFY006ReqData {
    /** 上次收到事件的時間 (ISO 8601 格式) */
    last_event_time: string;
}

export type NOTIFY006Req = Req<NOTIFY006ReqData>;

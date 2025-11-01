import { Res } from './Res.interface';

/**
 * NOTIFY-006 補發錯過的事件 - 回應
 */
export interface NOTIFY006ResData {
    /** 補發的事件數量 */
    resent_count: number;
}

export type NOTIFY006Res = Res<NOTIFY006ResData>;

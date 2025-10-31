import { Res } from './Res.interface';
import { NotificationDto } from './notification.interface';

/**
 * NOTIFY-002 查詢通知列表 - 回應
 */
export interface NOTIFY002ResData {
    /** 通知列表 */
    notifications: NotificationDto[];
}

export type NOTIFY002Res = Res<NOTIFY002ResData>;

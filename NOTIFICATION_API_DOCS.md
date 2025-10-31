# Notification API 文檔

## 概述

本文檔說明 PETEL 通知系統的後端 API 規格，供前端開發者參考實作。

**Base URL**: `http://localhost:8080/notifications`
**認證方式**: JWT Token (所有 API 都需要登入)

---

## 通用格式說明

### 請求格式 (Request)

除了 GET 請求外，所有 POST 請求都使用以下包裝格式：

```json
{
  "MWHEADER": {
    // 可選的 header 資訊
  },
  "TRANRQ": {
    // 實際的請求資料
  }
}
```

### 回應格式 (Response)

所有 API 回應都使用以下包裝格式：

```json
{
  "MWHEADER": {
    "returnCode": "0000",
    "returnMsg": "成功"
  },
  "TRANRS": {
    // 實際的回應資料
  }
}
```

---

## API 列表

### NOTIFY-001 發送通知

**用途**: 發送通知給指定用戶

**端點**: `POST /notifications/send`

**請求範例**:
```json
{
  "MWHEADER": {},
  "TRANRQ": {
    "title": "新訂單通知",
    "message": "您有一筆新的訂單需要處理",
    "type": "ORDER",
    "order_id": "ORD123456",
    "property_id": "PROP001",
    "seller_id": "SELLER001"
  }
}
```

**欄位說明**:
| 欄位 | 型別 | 必填 | 說明 |
|------|------|------|------|
| title | string | ✓ | 通知標題 |
| message | string | ✓ | 通知訊息內容 |
| type | string | ✓ | 通知類型：`SYSTEM` / `ORDER` / `PAYMENT` |
| order_id | string |  | 關聯的訂單編號（選填）|
| property_id | string |  | 關聯的旅館編號（選填）|
| seller_id | string |  | 關聯的賣家編號（選填）|

**回應範例**:
```json
{
  "MWHEADER": {
    "returnCode": "0000",
    "returnMsg": "成功"
  },
  "TRANRS": {
    "notification_id": "NOTIF123456"
  }
}
```

---

### NOTIFY-002 查詢通知列表

**用途**: 取得當前登入用戶的所有通知

**端點**: `GET /notifications/list`

**請求**: 無需 body，透過 JWT Token 識別用戶

**回應範例**:
```json
{
  "MWHEADER": {
    "returnCode": "0000",
    "returnMsg": "成功"
  },
  "TRANRS": {
    "notifications": [
      {
        "id": "NOTIF123456",
        "title": "新訂單通知",
        "message": "您有一筆新的訂單需要處理",
        "type": "ORDER",
        "status": "UNREAD",
        "created_at": "2024-01-15T10:30:00+08:00",
        "read_at": null,
        "order_id": "ORD123456",
        "property_id": "PROP001",
        "check_in": "2024-01-20T15:00:00+08:00",
        "check_out": "2024-01-22T11:00:00+08:00",
        "property_name": "台北豪華飯店",
        "user_name": "王小明"
      }
    ]
  }
}
```

**NotificationDto 欄位說明**:
| 欄位 | 型別 | 說明 |
|------|------|------|
| id | string | 通知編號 |
| title | string | 通知標題 |
| message | string | 通知訊息內容 |
| type | string | 通知類型：`SYSTEM` / `ORDER` / `PAYMENT` |
| status | string | 通知狀態：`UNREAD` / `READ` |
| created_at | string | 通知建立時間 (ISO 8601) |
| read_at | string | 通知已讀時間 (ISO 8601)，未讀時為 null |
| order_id | string | 關聯的訂單編號 |
| property_id | string | 關聯的旅館編號 |
| check_in | string | 入住時間 (ISO 8601) |
| check_out | string | 退房時間 (ISO 8601) |
| property_name | string | 旅館名稱（ORDER 類型通知時提供）|
| user_name | string | 用戶名稱（ORDER 類型通知時提供）|

---

### NOTIFY-003 標記通知為已讀

**用途**: 將指定通知標記為已讀

**端點**: `POST /notifications/mark-read`

**請求範例**:
```json
{
  "MWHEADER": {},
  "TRANRQ": {
    "notification_id": "NOTIF123456"
  }
}
```

**欄位說明**:
| 欄位 | 型別 | 必填 | 說明 |
|------|------|------|------|
| notification_id | string | ✓ | 要標記為已讀的通知 ID |

**回應範例**:
```json
{
  "MWHEADER": {
    "returnCode": "0000",
    "returnMsg": "成功"
  },
  "TRANRS": {
    "success": true,
    "read_at": "2024-01-15T11:00:00+08:00"
  }
}
```

---

### NOTIFY-004 統計未讀通知數量

**用途**: 取得當前用戶的未讀通知數量

**端點**: `GET /notifications/unread-count`

**請求**: 無需 body，透過 JWT Token 識別用戶

**回應範例**:
```json
{
  "MWHEADER": {
    "returnCode": "0000",
    "returnMsg": "成功"
  },
  "TRANRS": {
    "unread_count": 5
  }
}
```

---

### NOTIFY-005 建立 SSE 連線（即時推播）

**用途**: 建立 Server-Sent Events 連線，接收即時通知推播

**端點**: `GET /notifications/subscribe`

**Content-Type**: `text/event-stream`

**使用方式**:

前端使用 EventSource API 建立連線：

```javascript
const token = localStorage.getItem('jwt_token');
const eventSource = new EventSource(
  `http://localhost:8080/notifications/subscribe`,
  {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
);

// 接收通知事件
eventSource.addEventListener('notification', (event) => {
  const notification = JSON.parse(event.data);
  console.log('收到新通知:', notification);
  // 更新 UI 顯示新通知
});

// 接收心跳事件（保持連線）
eventSource.addEventListener('heartbeat', (event) => {
  console.log('心跳:', event.data);
});

// 處理連線錯誤
eventSource.onerror = (error) => {
  console.error('SSE 連線錯誤:', error);
  eventSource.close();
  // 可以在這裡實作重連邏輯
};
```

**SSE 事件格式**:

```
event: notification
id: EVENT123456
data: {"id":"NOTIF123456","title":"新訂單通知","message":"您有一筆新的訂單需要處理",...}

event: heartbeat
data: ping
```

---

### NOTIFY-006 補發錯過的事件

**用途**: 斷線重連後，補發錯過的通知事件

**端點**: `POST /notifications/resend-missed`

**請求範例**:
```json
{
  "MWHEADER": {},
  "TRANRQ": {
    "last_event_time": "2024-01-15T10:00:00+08:00"
  }
}
```

**欄位說明**:
| 欄位 | 型別 | 必填 | 說明 |
|------|------|------|------|
| last_event_time | string | ✓ | 上次收到事件的時間 (ISO 8601 格式) |

**回應範例**:
```json
{
  "MWHEADER": {
    "returnCode": "0000",
    "returnMsg": "成功"
  },
  "TRANRS": {
    "resent_count": 3
  }
}
```

---

## 通知類型說明

| 類型 | 說明 | 範例場景 |
|------|------|----------|
| SYSTEM | 系統公告 | 平台維護通知、系統更新 |
| ORDER | 訂單相關 | 新訂單、訂單狀態變更、入住提醒 |
| PAYMENT | 交易相關 | 付款成功、退款通知 |

## 通知狀態說明

| 狀態 | 說明 |
|------|------|
| UNREAD | 未讀 |
| READ | 已讀 |

---

## 錯誤處理

當 API 發生錯誤時，回應格式如下：

```json
{
  "MWHEADER": {
    "returnCode": "9999",
    "returnMsg": "錯誤訊息說明"
  },
  "TRANRS": null
}
```

常見錯誤碼：
- `USER_NOT_LOGIN`: 用戶未登入（需重新登入）
- `9999`: 系統錯誤

---

## 前端整合建議

### 1. 初始化流程

```javascript
// 用戶登入後
async function initNotifications() {
  // 1. 取得未讀數量
  const unreadCount = await fetchUnreadCount();
  updateBadge(unreadCount);

  // 2. 建立 SSE 連線
  connectSSE();

  // 3. 取得通知列表（如果需要顯示）
  const notifications = await fetchNotificationList();
  renderNotifications(notifications);
}
```

### 2. SSE 斷線重連

```javascript
let lastEventTime = null;
let eventSource = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

function connectSSE() {
  const token = localStorage.getItem('jwt_token');

  eventSource = new EventSource(
    `http://localhost:8080/notifications/subscribe`,
    { headers: { 'Authorization': `Bearer ${token}` } }
  );

  eventSource.addEventListener('notification', (event) => {
    const notification = JSON.parse(event.data);
    lastEventTime = new Date().toISOString();

    // 更新 UI
    showNotification(notification);
    incrementUnreadCount();
  });

  eventSource.onerror = () => {
    eventSource.close();

    // 重連邏輯
    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      reconnectAttempts++;
      setTimeout(() => {
        connectSSE();
        if (lastEventTime) {
          resendMissedEvents(lastEventTime);
        }
      }, 1000 * reconnectAttempts); // 指數退避
    }
  };

  eventSource.onopen = () => {
    reconnectAttempts = 0;
  };
}

async function resendMissedEvents(lastEventTime) {
  const response = await fetch('/notifications/resend-missed', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
    },
    body: JSON.stringify({
      TRANRQ: { last_event_time: lastEventTime }
    })
  });

  const result = await response.json();
  console.log(`補發了 ${result.TRANRS.resent_count} 個錯過的事件`);
}
```

### 3. 標記已讀

```javascript
async function markAsRead(notificationId) {
  const response = await fetch('/notifications/mark-read', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
    },
    body: JSON.stringify({
      TRANRQ: { notification_id: notificationId }
    })
  });

  const result = await response.json();
  if (result.TRANRS.success) {
    // 更新 UI，減少未讀數量
    decrementUnreadCount();
  }
}
```

---

## 注意事項

1. **認證**: 所有 API 都需要在 Header 中帶入 JWT Token
2. **CORS**: 後端已設定允許 `http://localhost:4200` 跨域請求
3. **時間格式**: 所有時間欄位使用 ISO 8601 格式（例如：`2024-01-15T10:30:00+08:00`）
4. **SSE 連線**: 建議實作斷線重連機制，並使用 NOTIFY-006 補發錯過的事件
5. **ORDER 類型通知**: 會自動帶入 `property_name`、`user_name`、`check_in`、`check_out` 等額外欄位

---

## 變更記錄

- **2024-01-15**: ORDER 類型通知增加 `property_name`、`user_name`、`check_in`、`check_out` 欄位
- **初版**: 建立通知系統 API (NOTIFY-001 ~ NOTIFY-006)

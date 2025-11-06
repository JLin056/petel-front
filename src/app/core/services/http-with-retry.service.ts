import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError, timer } from 'rxjs';
import { retryWhen, mergeMap } from 'rxjs/operators';

/**
 * 封裝 HttpClient 的 Service，自動處理 401 錯誤重試
 *
 * 使用場景：
 * 當 token 過期時，interceptor 會自動刷新 token 並重試請求。
 * 但組件可能在 interceptor 處理之前就收到 401 錯誤。
 * 這個 service 讓所有 HTTP 請求都自動靜默重試，給 interceptor 時間完成 token 刷新。
 *
 * 使用方式：
 * 在你的 service 中，把 HttpClient 替換成 HttpWithRetry：
 * ```typescript
 * constructor(private http: HttpWithRetry) {}
 * ```
 *
 * API 保持不變：
 * ```typescript
 * this.http.get('/api/xxx')
 * this.http.post('/api/xxx', body)
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class HttpWithRetry {

  constructor(private http: HttpClient) {}

  /**
   * GET 請求（自動重試 401）
   */
  get<T>(url: string, options?: {
    headers?: HttpHeaders | { [header: string]: string | string[] };
    observe?: 'body';
    params?: HttpParams | { [param: string]: string | string[] };
    reportProgress?: boolean;
    responseType?: 'json';
    withCredentials?: boolean;
  }): Observable<T> {
    return this.http.get<T>(url, options).pipe(
      this.retryOn401()
    );
  }

  /**
   * POST 請求（自動重試 401）
   */
  post<T>(url: string, body: any | null, options?: {
    headers?: HttpHeaders | { [header: string]: string | string[] };
    observe?: 'body';
    params?: HttpParams | { [param: string]: string | string[] };
    reportProgress?: boolean;
    responseType?: 'json';
    withCredentials?: boolean;
  }): Observable<T> {
    return this.http.post<T>(url, body, options).pipe(
      this.retryOn401()
    );
  }

  /**
   * PUT 請求（自動重試 401）
   */
  put<T>(url: string, body: any | null, options?: {
    headers?: HttpHeaders | { [header: string]: string | string[] };
    observe?: 'body';
    params?: HttpParams | { [param: string]: string | string[] };
    reportProgress?: boolean;
    responseType?: 'json';
    withCredentials?: boolean;
  }): Observable<T> {
    return this.http.put<T>(url, body, options).pipe(
      this.retryOn401()
    );
  }

  /**
   * DELETE 請求（自動重試 401）
   */
  delete<T>(url: string, options?: {
    headers?: HttpHeaders | { [header: string]: string | string[] };
    observe?: 'body';
    params?: HttpParams | { [param: string]: string | string[] };
    reportProgress?: boolean;
    responseType?: 'json';
    withCredentials?: boolean;
  }): Observable<T> {
    return this.http.delete<T>(url, options).pipe(
      this.retryOn401()
    );
  }

  /**
   * PATCH 請求（自動重試 401）
   */
  patch<T>(url: string, body: any | null, options?: {
    headers?: HttpHeaders | { [header: string]: string | string[] };
    observe?: 'body';
    params?: HttpParams | { [param: string]: string | string[] };
    reportProgress?: boolean;
    responseType?: 'json';
    withCredentials?: boolean;
  }): Observable<T> {
    return this.http.patch<T>(url, body, options).pipe(
      this.retryOn401()
    );
  }

  /**
   * HEAD 請求（自動重試 401）
   */
  head<T>(url: string, options?: {
    headers?: HttpHeaders | { [header: string]: string | string[] };
    observe?: 'body';
    params?: HttpParams | { [param: string]: string | string[] };
    reportProgress?: boolean;
    responseType?: 'json';
    withCredentials?: boolean;
  }): Observable<T> {
    return this.http.head<T>(url, options).pipe(
      this.retryOn401()
    );
  }

  /**
   * OPTIONS 請求（自動重試 401）
   */
  options<T>(url: string, options?: {
    headers?: HttpHeaders | { [header: string]: string | string[] };
    observe?: 'body';
    params?: HttpParams | { [param: string]: string | string[] };
    reportProgress?: boolean;
    responseType?: 'json';
    withCredentials?: boolean;
  }): Observable<T> {
    return this.http.options<T>(url, options).pipe(
      this.retryOn401()
    );
  }

  /**
   * 重試 401 錯誤的邏輯（私有方法）
   *
   * @param maxRetries 最大重試次數（預設 2 次）
   * @param delayMs 每次重試前的延遲時間（預設 500ms，給 interceptor 時間刷新 token）
   */
  private retryOn401<T>(maxRetries = 2, delayMs = 500) {
    return (source: Observable<T>) => {
      return source.pipe(
        retryWhen(errors =>
          errors.pipe(
            mergeMap((error, index) => {
              // 如果不是 401 錯誤，或重試次數超過限制，直接拋出錯誤
              if (error.status !== 401 || index >= maxRetries) {
                // 如果是重試多次後還是 401，記錄錯誤
                if (error.status === 401 && index >= maxRetries) {
                  console.error(`[HttpWithRetry] 重試 ${maxRetries} 次後仍然 401，放棄重試`);
                }
                return throwError(() => error);
              }

              // 401 錯誤：延遲後重試（給 interceptor 時間刷新 token）
              console.log(`[HttpWithRetry] 收到 401，${delayMs}ms 後重試（第 ${index + 1}/${maxRetries} 次）`);
              return timer(delayMs);
            })
          )
        )
      );
    };
  }
}

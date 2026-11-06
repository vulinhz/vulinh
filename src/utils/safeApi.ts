/**
 * safeApiRequest - Tiện ích gọi API an toàn, chống lỗi parse JSON khi server trả về HTML hoặc trang lỗi
 */

export interface SafeApiOptions extends RequestInit {
  timeoutMs?: number;
}

export async function safeApiRequest<T>(url: string, options: SafeApiOptions = {}): Promise<T> {
  const { timeoutMs = 30000, ...fetchOptions } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal
    });
  } catch (networkError: any) {
    clearTimeout(timeoutId);
    if (networkError.name === 'AbortError') {
      throw new Error(`Yêu cầu AI luận giải bị quá thời gian chờ (${Math.round(timeoutMs / 1000)}s). Vui lòng thử lại.`);
    }
    throw new Error(`Không thể kết nối đến máy chủ: ${networkError.message || 'Mất kết nối mạng'}`);
  } finally {
    clearTimeout(timeoutId);
  }

  const contentType = response.headers.get('content-type') || '';
  const rawText = await response.text();

  let data: any = null;
  const isJson = contentType.toLowerCase().includes('application/json');

  if (isJson) {
    try {
      data = JSON.parse(rawText);
    } catch {
      console.error('API trả về Content-Type JSON nhưng dữ liệu không thể parse:', {
        url,
        status: response.status,
        rawSnippet: rawText.slice(0, 300)
      });
      throw new Error(`Máy chủ trả về JSON không hợp lệ (Mã HTTP ${response.status}).`);
    }
  } else {
    // Trường hợp máy chủ trả về HTML (ví dụ: trang 404, 502, 503 từ Cloud Run hoặc Nginx)
    console.error('API trả về nội dung không phải JSON (HTML hoặc Text):', {
      url,
      status: response.status,
      contentType,
      bodySnippet: rawText.slice(0, 300)
    });

    if (response.status === 404) {
      throw new Error(`Cổng API không tồn tại (${url} - HTTP 404). Vui lòng kiểm tra đường dẫn.`);
    } else if (response.status === 429) {
      throw new Error('Hệ thống đang quá tải hoặc bạn gửi yêu cầu quá nhanh. Vui lòng thử lại sau 1 phút.');
    } else if (response.status >= 500) {
      throw new Error(`Máy chủ AI đang bảo trì hoặc gặp sự cố dịch vụ (HTTP ${response.status}). Vui lòng thử lại.`);
    } else {
      throw new Error(`Máy chủ phản hồi trang web thay vì dữ liệu JSON hợp lệ (HTTP ${response.status}). Vui lòng thử lại.`);
    }
  }

  if (!response.ok) {
    const errorMsg = data?.error || data?.message || `Lỗi máy chủ (HTTP ${response.status})`;
    throw new Error(errorMsg);
  }

  return data as T;
}

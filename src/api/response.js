
export function sendJson(res, statusCode, data) {
  if (res.writableEnded || res.destroyed) {
    return;
  }

  res.statusCode = statusCode;

  if (!res.headersSent) {
    res.setHeader(
      'Content-Type',
      'application/json; charset=utf-8'
    );
  }

  res.end(JSON.stringify(data));
}

export function sendSuccess(
  res,
  data = null,
  statusCode = 200
) {
  sendJson(res, statusCode, {
    success: true,
    data
  });
}

export function sendError(
  res,
  message = 'Internal Server Error',
  statusCode = 500
) {
  sendJson(res, statusCode, {
    success: false,
    message
  });
}

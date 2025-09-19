export enum EnumResponse {
  SUCCESS = 'success', // 200
  SUCCESS_OK = 'success_ok', // 200
  CREATE_SUCCESS = 'create_success', // 201
  ACCEPTED = 'accepted', // 202
  NO_CONTENT = 'no_content', // 204
  BAD_REQUEST = 'bad_request', // 400
  DUPLICATE_ENTRY = 'duplicate_entry', // 400
  UNAUTHORIZED = 'unauthorized', // 401
  FORBIDDEN = 'forbidden', // 403
  NOT_FOUND = 'not_found', // 404
  UNPROCESSABLE_ENTITY = 'unprocessable_entity', // 422
  INTERNAL_SERVER_ERROR = 'internal_server_error', // 500
  NOT_IMPLEMENTED = 'not_implemented', // 501
  SERVICE_UNAVAILABLE = 'service_unavailable', // 503
  ERROR = 'error', // 500
}

export function setResponseError(error:any): {
    status: 'error' | 'warning' | 'ok',
    message: string
} {
    const message = error?.response?.data?.message || error?.message || "Ocurrio un error al consultar"
    return {
        status: 'error',
        message
    }
}
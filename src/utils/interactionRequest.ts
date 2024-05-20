const interactionRequests = new Map<string, { requester: string, timerId: NodeJS.Timeout }>();

function getRequestKey(userId: string, requesterId: string): string {
    return `${userId}-${requesterId}`;
}

export function addInteractionRequest(userId: string, requesterId: string, requestData: any): void {
    const requestKey = getRequestKey(userId, requesterId);
    const timerId = setTimeout(() => {
        interactionRequests.delete(requestKey);
    }, 180000); // 3 minutos en milisegundos

    interactionRequests.set(requestKey, { ...requestData, requester: requesterId, timerId });
}

export function removeInteractionRequest(userId: string, requesterId: string): void {
    const requestKey = getRequestKey(userId, requesterId);
    const requestDetails = interactionRequests.get(requestKey);
    if (requestDetails) {
        clearTimeout(requestDetails.timerId);
        interactionRequests.delete(requestKey);
    }
}

export function hasInteractionRequest(userId: string, requesterId: string): boolean {
    const requestKey = getRequestKey(userId, requesterId);
    return interactionRequests.has(requestKey);
}

export { interactionRequests }; 
const interactionRequests = new Map();

export function addInteractionRequest(userId, requestData) {
  interactionRequests.set(userId, requestData);

  const timerId = setTimeout(() => {
    interactionRequests.delete(userId);
  }, 180000); // 3 minutos en milisegundos

  interactionRequests.set(userId, { ...requestData, timerId });
}

export function removeInteractionRequest(userId) {
  const requestDetails = interactionRequests.get(userId);
  if (requestDetails) {
    clearTimeout(requestDetails.timerId);
    interactionRequests.delete(userId);
  }
}

export { interactionRequests };

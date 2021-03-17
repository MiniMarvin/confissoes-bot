/**
 * Seleciona qual ação deve ser realizada, é a função que define o processamento de texto.
 *
 * @param {any} payload O payload de mensagem recebido.
 * @returns {{action: 'IGNORE' | 'CANCEL_CONFESSION' | 'CONFESS', messages: { userId: string, message: string, timestamp: number}[]}} A ação que foi escolhida e executada pela função.
 */
const selectAction = (payload) => {
  const receivedMessagesEvents = payload.direct_message_events?.filter(
    (event) =>
      event.type === 'message_create' &&
      event.message_create.sender_id !== payload.for_user_id &&
      event.message_create.message_data.text
  )

  if (!receivedMessagesEvents || receivedMessagesEvents.length === 0) {
    return { action: 'IGNORE' }
  }

  // TODO: adicionar processamento de texto para escolher a intent do usuário.

  const shouldCancelConfession = receivedMessagesEvents
    .map((event) => isCancelMessage(event.message_create.message_data.text))
    .reduce((prev, current) => prev || current, false)

  if (shouldCancelConfession) {
    return { action: 'CANCEL_CONFESSION' }
  }

  return {
    action: 'CONFESS',
    messages: receivedMessagesEvents.map((event) => ({
      userId: event.message_create.sender_id,
      message: event.message_create.message_data.text,
      timestamp: parseInt(event.created_timestamp),
    })),
  }
}

/**
 * Verifica se a mensagem é desejando cancelar confissão.
 *
 * @param {string} message A mensagem recebida na DM.
 */
const isCancelMessage = (message) => {
  const processedMessage = message
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLocaleUpperCase()

  const commands = [
    'CANCELAR',
    'CANCELAR CONFISSAO',
    'NAO POSTAR',
    'CANCELA',
    'NAO POSTA',
  ]
  return commands.includes(processedMessage)
}

module.exports = {
  selectAction,
}

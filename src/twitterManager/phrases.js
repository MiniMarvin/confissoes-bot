const phrases = [
  '👀',
  'e aí?',
  'hmmm...',
  '👁👄👁',
  'e essa aí ein?',
  'serase?',
  '🤔',
  'o que vocês acham disso?',
  'vamos ver as opniões...',
  '😳'
]

module.exports.getRandomPhrase = () => {
  return phrases[Math.floor(Math.random() * phrases.length)]
}

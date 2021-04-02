const phrases = [
  '👀',
  'e aí?',
  'hmmm...',
  '👁👄👁',
  'e essa aí ein?',
  'serase?',
  '🤔',
]

module.exports.getRandomPhrase = () => {
  return phrases[Math.ceil(Math.random() * phrases.length)]
}

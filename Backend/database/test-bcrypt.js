const bcrypt = require('bcrypt');

(async () => {
  const plainPassword = '1988218'; // مثال: "123456"
  const hashFromDB = '$2b$10$kU5UoB7jS.JeY8x7FuLaS.Ra9yK9mwcHOOJNXPN25ItVt6DqMs/iKnode test-bcrypt.js'; // مثال: "$2b$10$CWNpwAHR2hCOVeEvB0LdV.8ALN9lG8aqi7dy3MQgmygwcNFej6Ae"

  const match = await bcrypt.compare(plainPassword, hashFromDB);
  console.log('Match result:', match);
})();
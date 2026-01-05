const sequelize = require('./src/config/database').default;
const User = require('./src/models/User').default;
(async ()=>{
  try{
    await sequelize.authenticate();
    console.log('DB ok');
    const u = User.build({ email:'debug@example.test', username:'debuguser', password:'x', firstName:'D', lastName:'B' });
    console.log('built user ok', u && u.username);
  }catch(e){
    console.error('error build/create:', e);
    console.error(e.stack);
  }
  process.exit(0);
})();


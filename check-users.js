const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://romeoville:banku@cluster0.iszcnwu.mongodb.net/?retryWrites=true&w=majority')
  .then(async () => {
    const db = mongoose.connection.db;
    const users = await db.collection('users').find({}).toArray();
    console.log('Users:', users.length);
    users.forEach(u => {
      console.log('-', u.name, u.email, u.role, u.isApproved);
    });
    process.exit(0);
  })
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
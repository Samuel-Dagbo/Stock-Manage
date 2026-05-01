const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://romeoville:banku@cluster0.iszcnwu.mongodb.net/?retryWrites=true&w=majority')
  .then(async () => {
    const db = mongoose.connection.db;
    await db.collection('users').deleteMany({});
    console.log('All users deleted');
    process.exit(0);
  })
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
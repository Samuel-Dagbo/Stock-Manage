const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://romeoville:banku@cluster0.iszcnwu.mongodb.net/?retryWrites=true&w=majority')
  .then(async () => {
    const db = mongoose.connection.db;
    await db.collection('users').updateOne(
      { email: 'perrycrowland35@gmail.com' },
      { $set: { isApproved: true, role: 'staff' } }
    );
    console.log('Pery approved with staff role');
    process.exit(0);
  })
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://romeoville:banku@cluster0.iszcnwu.mongodb.net/?retryWrites=true&w=majority')
  .then(async () => {
    const db = mongoose.connection.db;
    const products = await db.collection('products').find({}).toArray();
    console.log('Products:', products.length);
    products.slice(0, 5).forEach(p => {
      console.log('-', p.name, p.price, p.quantity);
    });
    process.exit(0);
  })
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
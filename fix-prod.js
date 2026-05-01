const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://romeoville:banku@cluster0.iszcnwu.mongodb.net/?retryWrites=true&w=majority')
  .then(async () => {
    const db = mongoose.connection.db;
    
    // Remove shop requirement from products to show them
    await db.collection('products').updateMany(
      {}, 
      { $unset: { shop: "" } }
    )
    
    console.log('Shop field removed from products');
    
    const products = await db.collection('products').find({}).toArray();
    console.log('Products now:', products.length);
    
    process.exit(0);
  })
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
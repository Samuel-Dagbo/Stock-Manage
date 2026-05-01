const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://romeoville:banku@cluster0.iszcnwu.mongodb.net/?retryWrites=true&w=majority')
  .then(async () => {
    const db = mongoose.connection.db;
    
    // Update products with proper price and quantity
    await db.collection('products').updateMany(
      { $or: [{ price: { $exists: false } }, { quantity: { $exists: false } }] },
      { 
        $set: { price: 10, quantity: 50 },
        $unset: { costPrice: "" }
      }
    )
    
    const products = await db.collection('products').find({}).toArray();
    console.log('Products updated:', products.length);
    products.forEach(p => {
      console.log('-', p.name, 'GHS', p.price, 'qty:', p.quantity);
    });
    process.exit(0);
  })
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
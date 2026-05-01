const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://romeoville:banku@cluster0.iszcnwu.mongodb.net/?retryWrites=true&w=majority')
  .then(async () => {
    const db = mongoose.connection.db;
    
    // Remove shop from customers and suppliers too
    await db.collection('customers').updateMany({}, { $unset: { shop: "" } })
    await db.collection('suppliers').updateMany({}, { $unset: { shop: "" } })
    
    console.log('Shop removed from customers & suppliers')
    
    const c = await db.collection('customers').countDocuments();
    const s = await db.collection('suppliers').countDocuments();
    console.log('Customers:', c, 'Suppliers:', s);
    
    process.exit(0);
  })
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
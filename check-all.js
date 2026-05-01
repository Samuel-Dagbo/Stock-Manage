const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://romeoville:banku@cluster0.iszcnwu.mongodb.net/?retryWrites=true&w=majority')
  .then(async () => {
    const db = mongoose.connection.db;
    
    const collections = ['products', 'categories', 'customers', 'suppliers', 'sales', 'expenses'];
    
    for (const name of collections) {
      const count = await db.collection(name).countDocuments();
      const sample = await db.collection(name).findOne();
      console.log(`${name}: ${count}`, sample ? JSON.stringify(sample).slice(0, 100) : '(empty)');
    }
    
    process.exit(0);
  })
  .catch(e => {
    console.error(e);
    process.exit(1);
  });